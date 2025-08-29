import { createHmac } from "crypto";
import {
  ArgAuthType,
  AuthByBitRequest,
  IByBitResponce,
  IExchangeAuth,
} from "./type";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { ByBitBalance } from "./balance";

export class ByBitAuth implements IExchangeAuth {
  private isAuthorized = false;
  private byBitBalance: number | null = null;
  private bybitBalanceClient: ByBitBalance;
  constructor(private wsManager: WebSocketConector) {
    this.wsManager.addMessageHandler((msg: Buffer) => this.handleResponse(msg));
    this.bybitBalanceClient = new ByBitBalance(this);
  }
  private getExpires(): number {
    return Number((Date.now() + 1) * 1000);
  }
  public async handleResponse(msg: Buffer): Promise<void> {
    const parsedData: IByBitResponce = JSON.parse(msg.toString());
    if (parsedData.retMsg === "Invalid sign") {
      console.log(
        "❌ Session Bybit not active Relogin......",
        parsedData.retMsg
      );
      this.login();
      return;
    }
    if (parsedData.op !== "auth" || parsedData.retMsg !== "OK") {
      return;
    }
    this.isAuthorized = true;
    console.log("✅ Authenticated private WebSocket ByBit");
    if (this.isAuthorized) {
      await this.bybitBalanceClient.getbalance();
      return;
    }
    return;
  }
  public login(): void {
    this.wsManager.send<AuthByBitRequest<ArgAuthType[]>>(this.getAuthPayload());
    return;
  }
  private getSignature(): string {
    return createHmac("sha256", process.env.BYBIT_API_SECRET!)
      .update(`GET/realtime${this.getExpires()}`)
      .digest("hex");
  }
  private getAuthPayload(): AuthByBitRequest<ArgAuthType[]> {
    const expires = this.getExpires();
    const signature = this.getSignature();
    return {
      op: "auth",
      args: [process.env.BYBIT_API_KEY!, expires, signature],
    };
  }
  get status(): boolean {
    return this.isAuthorized;
  }
  get ws(): WebSocketConector {
    return this.wsManager;
  }
  get balance(): number {
    return this.byBitBalance!;
  }
  set balance(value: number) {
    this.byBitBalance = value;
  }
}
