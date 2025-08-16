import { createHmac } from "crypto";
import { IExchangeAuth } from "./type";
export class ByBitAuth implements IExchangeAuth {
  private getExpires(): number {
    return Number((Date.now() + 1) * 1000);
  }
  private getSignature(): string {
    return createHmac("sha256", process.env.BYBIT_API_SECRET!)
      .update(`GET/realtime${this.getExpires()}`)
      .digest("hex");
  }
  public getAuthPayload(): { op: string; args: (string | number)[] } {
    const expires = this.getExpires();
    const signature = this.getSignature();
    return {
      op: "auth",
      args: [process.env.BYBIT_API_KEY!, expires, signature],
    };
  }
}
