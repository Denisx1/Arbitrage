import WebSocket from "ws";
import { IWebSocketConnector } from "./type";

export class WebSocketConector implements IWebSocketConnector {
  public ws: WebSocket | null = null;
  private readonly wsUrl: string;

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
  }

  public async connectWebSocket<T>(initialMessage?: T): Promise<WebSocket> {
    this.ws = new WebSocket(this.wsUrl);

    return new Promise((resolve, reject) => {
      this.ws!.on("open", () => {
        if (initialMessage) {
          this.send(initialMessage);
        }
        resolve(this.ws!);
      });
      this.ws!.on("error", (err) => {
        console.error("WS error:", err);
        reject(err);
      });
    });
  }

  public onMessage(handler: (msg: Buffer) => void): void {
    if (!this.ws) {
      throw new Error("WebSocket not connected");
    }
    this.ws.on("message", (msg: Buffer) => {
      handler(msg);
    });
  }
  public send<T>(data: T): void {
    if (this.ws!.readyState === 1) {
      this.ws!.send(JSON.stringify(data));
    } else {
      console.error("Cannot send: WebSocket not open");
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
