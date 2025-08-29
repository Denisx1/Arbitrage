import { IExchangeAuth } from "../bybit/type";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { createHmac } from "crypto";
import { AuthDeribitRequest } from "./type";
import { DeribitBalanceClient } from "./balance";

export class AuthDeribitWs implements IExchangeAuth {
  private isAuthenticated: boolean = false;
  private deribitBalanceClient: DeribitBalanceClient;
  private deribitBalance: number | null = null;
  constructor(private wsManager: WebSocketConector) {
    this.wsManager.addMessageHandler((msg) => this.handlePublicMessage(msg));
    this.deribitBalanceClient = new DeribitBalanceClient(this);
  }
  public handlePublicMessage(msg: Buffer): void {
    const parsedData = JSON.parse(msg.toString());
    if (
      !parsedData?.result?.access_token ||
      !parsedData?.result?.refresh_token
    ) {
      return;
    }
    this.isAuthenticated = true;
    console.log("✅ Authenticated private WebSocket Deribit");
    this.deribitBalanceClient.getBalance();
    return;
  }
  public login(): void {
    this.wsManager.send<AuthDeribitRequest>(this.getAuthPayload());
  }
  private getSignature(data: string): string {
    const signature = createHmac("sha256", process.env.DERIBIT_API_SECRET!)
      .update(data)
      .digest("hex");
    return signature;
  }
  private getAuthPayload() {
    const timestamp = Date.now();
    const nonce: string = "abcd";
    const data = "";
    const message = `${timestamp}\n${nonce}\n${data}`;
    const signature = this.getSignature(message);
    return {
      jsonrpc: "2.0",
      id: 4316,
      method: "public/auth",
      params: {
        grant_type: "client_signature",
        client_id: process.env.DERIBIT_API_KEY!,
        timestamp: timestamp,
        signature: signature,
        nonce: nonce,
        data: data,
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
    return this.deribitBalance!;
  }
  set balance(value: number) {
    this.deribitBalance = value;
  }
}
