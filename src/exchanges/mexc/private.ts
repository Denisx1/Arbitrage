import { createHmac } from "crypto";
import { IExchangeAuth } from "../bybit/type";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
export interface MexcAuthRequest {
  subscribe: boolean;
  method: string;
  param: {
    apiKey: string;
    reqTime: number;
    signature: string;
  };
}
export class MexcAuth implements IExchangeAuth {
  private isAuthenticated: boolean = false;
  constructor(private readonly wsManager: WebSocketConector) {}
  public login(): void {
    this.wsManager.send<MexcAuthRequest>(this.getAuthpayload());
    this.wsManager.onMessage((msg: Buffer) => {
      const parsedData = JSON.parse(msg.toString());

      if (parsedData.data === "success") {
        this.isAuthenticated = true;
        console.log("✅ Authenticated private WebSocket Mexc");
      } else {
        this.isAuthenticated = false;
        console.log("❌ Session Mexc not active");
      }
    });
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
}
