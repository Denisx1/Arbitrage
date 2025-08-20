import { IExchangeAuth } from "../bybit/type";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { createHmac } from "crypto";
import zlib from "zlib";
interface HTXAuthParams {
  AccessKeyId: string;
  SignatureMethod: string;
  SignatureVersion: string;
  Timestamp: string;
  Signature?: string;
}
export class HTXAuth implements IExchangeAuth {
  private isAuthenticated: boolean = false;
  constructor(private readonly wsManager: WebSocketConector) {}
  public login(): void {
    this.wsManager.send<HTXAuthParams>(this.getAuthPayload());
    this.wsManager.onMessage((msg: Buffer) => {
      const buf = Buffer.from(msg);
      const decodedMsg = zlib.gunzipSync(buf).toString("utf-8");
      const parsedData = JSON.parse(decodedMsg);
      if (parsedData.op === "ping") {
        this.wsManager.send({ op: "pong" });
        return;
      }
      if (parsedData.op === "auth" && parsedData["err-code"] === 0) {
        this.isAuthenticated = true;
        console.log("✅ Authenticated private WebSocket HTX");
      } else {
        this.isAuthenticated = false;
        console.log("❌ Session HTX not active");
      }
    });
  }

  private getSignature(params: HTXAuthParams): string {
    const host = "api.hbdm.com";
    const path = "/linear-swap-notification";
    const method = "GET";

    const sortedParams = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    const payload = `${method}\n${host}\n${path}\n${sortedParams}`;
    return createHmac("sha256", process.env.HTX_API_SECRET!)
      .update(payload)
      .digest("base64");
  }

  private getAuthPayload(): HTXAuthParams & { op: string; type: string } {
    const timestamp = new Date().toISOString().replace(/\.\d+Z$/, "");
    const params: HTXAuthParams = {
      AccessKeyId: process.env.HTX_API_KEY!,
      SignatureMethod: "HmacSHA256",
      SignatureVersion: "2",
      Timestamp: timestamp,
    };
    const signature = this.getSignature(params);

    return { ...params, Signature: signature, op: "auth", type: "api" };
  }

  public get status(): boolean {
    return this.isAuthenticated;
  }
}
