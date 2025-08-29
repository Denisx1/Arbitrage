import { createHmac } from "crypto";
import { IExchangeAuth } from "../bybit/type";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { AuthOkxRequest } from "./types";
import { OkxBalanceClient } from "./balance";

export class AuthOkx implements IExchangeAuth {
  private isAuthorized = false;
  private method = "GET";
  private requestPath = "/users/self/verify";
  private body = "";
  private balanceClient: OkxBalanceClient;
  private okxBalance: number = 0;
  constructor(private wsManager: WebSocketConector) {
    this.wsManager.addMessageHandler((data: Buffer) =>
      this.handleResponse(data)
    );
    this.balanceClient = new OkxBalanceClient(this);
  }
  public handleResponse(msg: Buffer): void {
    const parsedData = JSON.parse(msg.toString());
    if (parsedData.event !== "login" && parsedData.code !== "0") {
      this.isAuthorized = false;
      return;
    }
    this.isAuthorized = true;
    console.log("✅ Authenticated private WebSocket Okx");
    if (this.isAuthorized) {
      this.balanceClient.getBalance();
    }
  }
  public login() {
    this.wsManager.send(this.getAuthPayload());
  }
  private getAuthPayload(): AuthOkxRequest {
    const timeStamp = this.getExpires();
    return {
      op: "login",
      args: [
        {
          apiKey: process.env.OKX_API_KEY!,
          passphrase: process.env.OKX_PASSPHRASE!,
          timestamp: timeStamp,
          sign: this.getSignature(timeStamp),
        },
      ],
    };
  }
  private getSignature(timeStamp: string): string {
    const strToSign = timeStamp + this.method + this.requestPath + this.body;

    return createHmac("sha256", process.env.OKX_API_SECRET!)
      .update(strToSign)
      .digest("base64");
  }

  private getExpires(): string {
    return Math.floor(Date.now() / 1000).toString();
  }
  public get status(): boolean {
    return this.isAuthorized;
  }
  get ws(): WebSocketConector {
    return this.wsManager; // <-- добавляем доступ к WS
  }
  get balance(): number {
    return this.okxBalance!;
  }
  set balance(balance: number) {
    this.okxBalance = balance;
  }
}
