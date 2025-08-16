import { ExchangeConfig } from "../config/types";
import WebSocket from "ws";
import { updatePriceStore } from "../utils/priceStore";
import { IExchangePublicClient } from "./type";
import { getBestPrices } from "../utils/util";
export class BybitPublickWsClient implements IExchangePublicClient {
  private wsPublic: WebSocket | null = null;
  private wsPublicUrl: string;
  private symbol: string;

  constructor(byBitConfig: ExchangeConfig, symbol: string) {
    this.symbol = symbol;
    this.wsPublicUrl = byBitConfig.wsUrl;
    this.wsPublic = new WebSocket(this.wsPublicUrl);
  }

  public connectPublic(): void {
    this.wsPublic!.on("open", () => {
      this.subscribeOrderBook(this.symbol);
      console.log("✅ Bybit connected");
    });
    this.wsPublic!.on("message", (msg) => {
      this.handlePublicMessage(msg.toString());
    });
    this.wsPublic!.on("error", (err) =>
      console.error("Bybit Public WS error:", err)
    );
    this.wsPublic!.on("close", () => console.log("Bybit Public WS closed"));
  }
  public subscribeOrderBook(symbol: string): void {
    if (!this.wsPublic || this.wsPublic.readyState !== WebSocket.OPEN) return;
    this.wsPublic.send(
      JSON.stringify({
        op: "subscribe",
        args: [`orderbook.500.${symbol}`],
      })
    );
  }
  private handlePublicMessage(msg: string): void {
    const data = JSON.parse(msg.toString());
    if (!data.data) return;

    const { a, b } = data.data;

    const { bestAskPrice, bestBidPrice } = getBestPrices(a, b);
    updatePriceStore("bybit", bestAskPrice, bestBidPrice);
  }
}
