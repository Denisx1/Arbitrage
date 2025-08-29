import { IExchangeAuth } from "../bybit/type";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { createHmac } from "crypto";
import zlib from "zlib";
import { HTXAuthParams } from "./types";
import { HTXBalanceClient } from "./balance";

export class HTXAuth implements IExchangeAuth {
  private host = "api.hbdm.com";
  private path = "/linear-swap-trade";
  private method = "GET";
  private isAuthenticated: boolean = false;
  private balanceClient: HTXBalanceClient;
  private htxBalance: number = 0;

  constructor(private readonly wsManager: WebSocketConector) {
    this.wsManager.addMessageHandler((msg) => this.handlePublicMessage(msg));
    this.balanceClient = new HTXBalanceClient(this);
  }
  private handlePublicMessage(msg: Buffer): void {
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
      this.balanceClient.getBalance();
      return;
    }
  }
  public login(): void {
    this.wsManager.send<HTXAuthParams>(this.getAuthPayload());
  }

  private getSignature(params: HTXAuthParams): string {
    const qs = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    const payload = `${this.method}\n${this.host}\n${this.path}\n${qs}`;

    const signature = createHmac("sha256", process.env.HTX_API_SECRET!)
      .update(payload)
      .digest("base64");
    return signature;
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
  get ws(): WebSocketConector {
    return this.wsManager; // <-- добавляем доступ к WS
  }
  get balance(): number {
    return this.htxBalance;
  }
  set balance(value: number) {
    this.htxBalance = value;
  }
}
