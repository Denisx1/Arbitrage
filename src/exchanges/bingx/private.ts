import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { HandleListenKey } from "./handleListenKey";
import zlib from "zlib";

interface BingXAuthParams {}
export class BingXAuth {
  private wsManager: WebSocketConector | null = null;
  private listenKey: string | null = null;
  private isAuthenticated: boolean = false;
  private keepAliveInterval: NodeJS.Timer | null = null;
  constructor(private readonly handleListenKey: HandleListenKey) {}

  public async login(): Promise<void> {
    this.listenKey = await this.handleListenKey.createListenKey();
    await this.initWebSocket();
    this.keepAliveInterval = setInterval(
      () => this.keepAliveListenKey(),
      30 * 60 * 1000
    );
  }

  private async initWebSocket(): Promise<void> {
    if (!this.listenKey) throw new Error("ListenKey не создан");

    const url = `wss://open-api-swap.bingx.com/swap-market?listenKey=${this.listenKey}`;
    this.wsManager = new WebSocketConector(url);
    await this.wsManager.connectWebSocket();

    this.wsManager.onMessage((data: Buffer) => this.handleMessage(data));
  }

  private handleMessage(data: Buffer): void {
    const buf = Buffer.from(data);
    const decodedMsg = zlib.gunzipSync(buf).toString("utf-8");

    if (decodedMsg === "Ping") {
      this.wsManager?.send("Pong");
      return;
    }

    const parsed = JSON.parse(decodedMsg);
    // Успешная аутентификация
    if (!this.isAuthenticated && parsed.e === "SNAPSHOT") {
      this.isAuthenticated = true;
      console.log("✅ Authenticated private WebSocket BingX");
    }
  }

  private async keepAliveListenKey(): Promise<void> {
    if (!this.listenKey) return;

    try {
      this.listenKey = await this.handleListenKey.keepAliveListnKey();
      console.log("ListenKey продлён:", this.listenKey);
    } catch (err) {
      console.error("Ошибка продления listenKey:", err);
      // Можно попробовать заново создать ключ и переподключить WebSocket
    }
  }
  public get status(): boolean {
    return this.isAuthenticated;
  }
}
