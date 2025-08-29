import { createHmac } from "crypto";
import { IExchangeAuth } from "../bybit/type";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { MexcAuthRequest } from "./types";
import { MEXCBalanceClient } from "./balance";

export class MexcAuth implements IExchangeAuth {
  private isAuthenticated: boolean = false;
  private balanceClient: MEXCBalanceClient;
  private mexcBalance: number | null = null;
  constructor(private readonly wsManager: WebSocketConector) {
    this.wsManager.addMessageHandler((msg: Buffer) => this.handleResponse(msg));
    this.balanceClient = new MEXCBalanceClient(this);
  }

  public handleResponse(msg: Buffer): void {
    const parsedData = JSON.parse(msg.toString());
    if (parsedData.data !== "success") {
      this.isAuthenticated = false;
      return;
    }
    this.isAuthenticated = true;
    console.log("✅ Authenticated private WebSocket Mexc");
    this.balanceClient.getBalance();
  }
  public login(): void {
    this.wsManager.send<MexcAuthRequest>(this.getAuthpayload());
  }

  private getSignature() {
    const reqTime = Date.now();
    const signature = createHmac("sha256", process.env.MEXC_API_SECRET!)
      .update(process.env.MEXC_API_KEY! + reqTime)
      .digest("hex"); // MEXC требует hex
    return { signature, reqTime };
  }

  private getAuthpayload(): MexcAuthRequest {
    const { signature, reqTime } = this.getSignature();
    return {
      subscribe: false,
      method: "login",
      param: {
        apiKey: process.env.MEXC_API_KEY!,
        reqTime,
        signature,
      },
    };
  }
  public get status(): boolean {
    return this.isAuthenticated;
  }
  get ws(): WebSocketConector {
    return this.wsManager; // <-- добавляем доступ к WS
  }
  get balance(): number {
    return this.mexcBalance!;
  }
  set balance(value: number) {
    this.mexcBalance = value;
  }
}
