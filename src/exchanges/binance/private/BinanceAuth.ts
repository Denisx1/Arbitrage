import crypto from "crypto";
import fs from "fs";
import { AuthRequest } from "../types";
import { WebSocketConector } from "../../../socketConnector/WebSocketConector";
import { IExchangeAuth } from "../../bybit/type";
import { BinanceBalanceClient } from "./balanceClient";
import { ActionType } from "../enums";

export class BinanceAuth implements IExchangeAuth {
  private isAuthorized = false;
  private binanceBalanceClient: BinanceBalanceClient;
  private binanceBalance: number | null = null;
  constructor(private wsManager: WebSocketConector) {
    this.wsManager.addMessageHandler((msg: Buffer) =>
      this.handleLoginResponse(msg)
    );
    this.binanceBalanceClient = new BinanceBalanceClient(this);
  }

  public async login() {
    this.wsManager.send<AuthRequest>(await this.authorize());
  }

  private handleLoginResponse(msg: Buffer) {
    const parsedData = JSON.parse(msg.toString());
    if (parsedData.id !== ActionType.BINANCE_LOGIN) {
      return;
    }
    // 1. Ответ на логин
    if (
      parsedData.result?.apiKey === process.env.BINANCE_PUBLIC_KEY &&
      parsedData.status === 200
    ) {
      this.isAuthorized = true;
      console.log("✅ Authenticated private WebSocket Binance");
      this.binanceBalanceClient.getBalance();
      return;
    }
    this.isAuthorized = false;
    console.log("❌ Session Binance not active", parsedData.error?.msg);
    return;
  }

  private async getSignature(): Promise<{
    signature: string;
    timestamp: number;
  }> {
    const pemContent = fs.readFileSync(
      process.env.BINANCE_PRIVATE_URL!,
      "utf8"
    );
    const privateKey = crypto.createPrivateKey(pemContent);
    const timestamp = await this.getServerTime();

    const sortedParams = this.signParams({
      apiKey: process.env.BINANCE_PUBLIC_KEY!,
      timestamp,
    });
    const signatureBuffer = crypto.sign(null, sortedParams, privateKey);
    const signature = signatureBuffer.toString("base64");
    return {
      signature,
      timestamp,
    };
  }
  private async authorize(): Promise<AuthRequest> {
    const { signature, timestamp } = await this.getSignature();

    const loginRequest: AuthRequest = {
      id: ActionType.BINANCE_LOGIN,
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
  private signParams(params: { apiKey: string; timestamp: number }): Buffer {
    const payload = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    const payloadBuffer = Buffer.from(payload, "ascii");
    return payloadBuffer;
  }

  get status(): boolean {
    return this.isAuthorized;
  }
  get ws(): WebSocketConector {
    return this.wsManager; // <-- добавляем доступ к WS
  }
  get balance(): number {
    return this.binanceBalance!;
  }
  set balance(value: number) {
    this.binanceBalance = value;
  }
}
