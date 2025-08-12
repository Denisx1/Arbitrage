import WebSocket from "ws";
import { updatePriceStore } from "../utils/priceStore";

import { getBestPrices } from "../utils/util";
import * as crypto from "crypto";

import { ExchngeClient } from "../types";
import { ExchangeConfig } from "../config/types";

export class BybitWsClient implements ExchngeClient {
  private wsPublic: WebSocket | null = null;
  private wsPrivate: WebSocket | null = null;
  private wsPublicUrl: string;
  private wsPrivateUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private isAuthenticated: boolean = false;
  private symbol: string;
  constructor(byBitConfig: ExchangeConfig, symbol: string) {
    this.symbol = symbol;
    this.apiKey = byBitConfig.apiKey;
    this.apiSecret = byBitConfig.apiSecret;
    this.wsPublicUrl = byBitConfig.wsUrl;
    this.wsPrivateUrl = byBitConfig.wsTradeUrl;
  }
  
  public connectPublic() {
    this.wsPublic = new WebSocket(this.wsPublicUrl);
    this.wsPublic!.on("open", () => {
      console.log("Bybit Public WS connected");
      this.subscribeOrderBook(this.symbol);
    });
    this.wsPublic!.on("message", (msg) => {
      this.handlePublicMessage(msg.toString());
    });
    this.wsPublic.on("error", (err) =>
      console.error("Bybit Public WS error:", err)
    );
    this.wsPublic.on("close", () => console.log("Bybit Public WS closed"));
  }

  public connectPrivate() {
    this.wsPrivate = new WebSocket(this.wsPrivateUrl);
    this.wsPrivate.on("open", () => {
      this.privateAuthenticate();
    });
    this.wsPrivate.on("message", (msg) => {
      this.handlePrivateMessage(msg.toString());
    });
    this.wsPrivate.on("error", (err) =>
      console.error("Bybit Private WS error:", err)
    );
    this.wsPrivate.on("close", () => console.log("Bybit Private WS closed"));
  }
  private subscribeOrderBook(symbol: string) {
    if (!this.wsPublic || this.wsPublic.readyState !== WebSocket.OPEN) return;
    this.wsPublic.send(
      JSON.stringify({
        op: "subscribe",
        args: [`orderbook.500.${symbol}`],
      })
    );
  }
  private handlePublicMessage(msg: string) {
    const data = JSON.parse(msg.toString());
    if (!data.data) return;

    const { a, b } = data.data;

    const { bestAskPrice, bestBidPrice } = getBestPrices(a, b);
    updatePriceStore("bybit", bestAskPrice, bestBidPrice);
  }
  private privateAuthenticate() {
    const expires = this.getExpires();
    const signature = this.getSignature(expires);
    this.wsPrivate!.send(
      JSON.stringify({
        op: "auth",
        args: [this.apiKey, expires, signature],
      })
    );
  }
  private handlePrivateMessage(msg: WebSocket.Data) {
    const data = JSON.parse(msg.toString());
    if (data.op === "auth" && data.success) {
      this.isAuthenticated = true;
      console.log("Authenticated");
    }
  }
  public placeOrderBybit = async (price: number, qty: number, side: string) => {
    if (
      !this.isAuthenticated ||
      this.wsPrivate!.readyState !== WebSocket.OPEN
    ) {
      throw new Error("WebSocket not connected or authenticated");
    }
    const orderPayload = {
      op: "spread.order",
      args: [
        {
          category: "linear",
          symbol: this.symbol,
          side,
          orderType: "Limit",
          qty: qty.toString(),
          price: price.toString(),
          timeInForce: "GoodTillCancel",
        },
      ],
    };
    this.wsPrivate!.send(JSON.stringify(orderPayload));
  };
  private getExpires() {
    return Number((Date.now() + 1) * 1000); // в секундах, +1 секунда
  }
  private getSignature(expires: number): string {
    // Сообщение для подписи (пример, зависит от API!)

    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(`GET/realtime${expires}`)
      .digest("hex");
  }
}
