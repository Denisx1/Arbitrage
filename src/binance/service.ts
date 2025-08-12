import WebSocket from "ws";
import { updatePriceStore } from "../utils/priceStore";
import { ExchangeConfig } from "../config/types";
import { convertTimestampToUTC } from "../utils/timeUtil";
import { getBestPrices } from "../utils/util";
import { ExchngeClient } from "../types";

export class BinanceWsClient implements ExchngeClient {
  private wsPublic: WebSocket | null = null;
  private wsPrivate: WebSocket | null = null;
  private wsPublicUrl: string;
  private wsPrivateUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private isAuthenticated: boolean = false;
  private symbol: string;
  constructor(binanceConfig: ExchangeConfig, symbol: string) {
    this.symbol = symbol;
    this.apiKey = binanceConfig.apiKey;
    this.apiSecret = binanceConfig.apiSecret;
    this.wsPublicUrl = binanceConfig.wsUrl;
    this.wsPrivateUrl = binanceConfig.wsTradeUrl;
  }
  public connectPublic() {
    const wsUrl = this.wsPublicUrl.replace(
      "%SYMBOL%",
      this.symbol.toLowerCase()
    );
    this.wsPublic = new WebSocket(wsUrl);
    this.wsPublic!.on("open", () => console.log("✅ Binance connected"));

    this.wsPublic!.on("message", (msg) => {
      const data = JSON.parse(msg.toString());

      const { a, b } = data.data;
      const { bestAskPrice, bestBidPrice } = getBestPrices(a, b);
      updatePriceStore("binance", bestAskPrice, bestBidPrice);
    });

    this.wsPublic.on("error", (err) => console.error("Binance error:", err));
  }
}
