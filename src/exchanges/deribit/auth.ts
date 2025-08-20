
import { IExchangeAuth } from "../bybit/type";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { createHmac } from "crypto";
export interface AuthDeribitRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: {
    grant_type: string;
    client_id: string;
    timestamp: number;
    signature: string;
    nonce: string;
    data: string;
  };
}
export class AuthDeribitWs implements IExchangeAuth {
  private isAuthenticated: boolean = false;
  constructor(private wsManager: WebSocketConector) {}

  public login(): void {
    this.wsManager.onMessage((msg: Buffer) => {
      const parsedData = JSON.parse(msg.toString());
      if (parsedData.result.access_token && parsedData.result.refresh_token) {
        this.isAuthenticated = true;
        console.log("✅ Authenticated private WebSocket Deribit");
      } else {
        this.isAuthenticated = false;
        console.log("❌ Session Deribit not active");
      }
    });
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
}
