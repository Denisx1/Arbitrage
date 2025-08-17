import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import fs from "fs";
import { IExchangeAuth } from "../../bybit/type";

import { AuthRequest, AuthResponce } from "../types";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";

export class BinanceAuth implements IExchangeAuth {
  private isAuthorized = false;
  constructor(private wsManager: WebSocketConector) {}

  public async login() {
    this.wsManager.onMessage(async (data: Buffer) => {
      const parsedData = JSON.parse(data.toString());
      if (parsedData.result.apiKey === null) {
        console.log("❌ Session not active, cannot place order");
        this.isAuthorized = false;
      } else {
        this.isAuthorized = true;
        console.log("✅ Authenticated private WebSocket Binance");
      }
    });
    this.wsManager.send<AuthRequest>(await this.authorize());
  }
  private async authorize(): Promise<AuthRequest> {
    const pemContent = fs.readFileSync(
      process.env.BINANCE_PRIVATE_URL!,
      "utf8"
    );
    const privateKey = crypto.createPrivateKey(pemContent);

    const timestamp = await this.getServerTime();
    const params = {
      apiKey: process.env.BINANCE_PUBLIC_KEY!,
      timestamp,
    };
    const sortedParams = this.signParams(params);

    const signatureBuffer = crypto.sign(null, sortedParams, privateKey);
    const signature = signatureBuffer.toString("base64");

    const loginRequest = {
      id: uuidv4(),
      method: "session.logon",
      params: {
        apiKey: process.env.BINANCE_PUBLIC_KEY!,
        signature: signature,
        timestamp,
      },
    };
    return loginRequest;
  }
  private async getServerTime(): Promise<number> {
    const response = await fetch(process.env.BINANCE_SERVER_GET_TIME_URL!);
    const data = await response.json();
    return data.serverTime;
  }
  private signParams(params: Record<string, any>): Buffer {
    const payload = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");
    const payloadBuffer = Buffer.from(payload, "ascii");
    return payloadBuffer;
  }

  public get status() {
    return this.isAuthorized;
  }
}
