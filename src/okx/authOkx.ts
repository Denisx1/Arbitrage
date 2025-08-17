import { createHmac } from "crypto";

import { WebSocketConector } from "../socketConnector/WebSocketConector";
import { IExchangeAuth } from "../bybit/type";
interface AuthOkxRequest {
  op: string;
  args: {
    apiKey: string;
    passphrase: string;
    timestamp: string;
    sign: string;
  }[];
}
export class AuthOkx implements IExchangeAuth {
  private isAuthorized = false;
  constructor(private wsManager: WebSocketConector) {}

  public login() {
    this.wsManager.onMessage((data: Buffer) => {
      const parsedData = JSON.parse(data.toString());

      if (parsedData.event === "login" && parsedData.code === "0") {
        this.isAuthorized = true;
        console.log("✅ Authenticated private WebSocket Okx");
      } else {
        this.isAuthorized = false;
        console.log("❌ Session Okx not active");
      }
    });
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
    const method = "GET";
    const requestPath = "/users/self/verify";
    const body = ""; // пусто для GET
    const strToSign = timeStamp + method + requestPath + body;

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
}
