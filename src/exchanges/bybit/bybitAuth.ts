import { createHmac } from "crypto";
import { IExchangeAuth } from "./type";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { OrderParams } from "./bybitPrivateClient";

type ArgAuthType = string | number;
type ArgType = ArgAuthType[] | OrderParams[];
export interface AuthByBitRequest<T extends ArgType> {
  op: string;
  args: T;
}

export interface AuthByBitResponce {
  retCode: number;
  retMsg: string;
  op: string;
  connId: string;
}
export class ByBitAuth implements IExchangeAuth {
  private isAuthorized = false;
  constructor(private wsManager: WebSocketConector) {}
  private getExpires(): number {
    return Number((Date.now() + 1) * 1000);
  }

  public login() {
    this.wsManager.onMessage((data: Buffer) => {
      const parsedData = JSON.parse(data.toString());
      if (parsedData.op === "auth" && parsedData.retMsg === "OK") {

        this.isAuthorized = true;
        console.log("✅ Authenticated private WebSocket ByBit");
      } else {
        this.isAuthorized = false;
        console.log("❌ Session Bybit not active");
      }
    });
    this.wsManager.send(this.getAuthPayload());
  }
  private getSignature(): string {
    return createHmac("sha256", process.env.BYBIT_API_SECRET!)
      .update(`GET/realtime${this.getExpires()}`)
      .digest("hex");
  }
  public getAuthPayload(): AuthByBitRequest<ArgAuthType[]> {
    const expires = this.getExpires();
    const signature = this.getSignature();
    return {
      op: "auth",
      args: [process.env.BYBIT_API_KEY!, expires, signature],
    };
  }
  public get status(): boolean {
    return this.isAuthorized;
  }
}
