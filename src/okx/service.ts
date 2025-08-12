import WebSocket from "ws";
import { updatePriceStore } from "../utils/priceStore";
import { convertTimestampToUTC } from "../utils/timeUtil";
import { getBestPrices, getWeightedAvgPrice } from "../utils/util";
import { ExchangeConfig } from "../config/types";
import { ExchngeClient } from "../types";
export class OkxWsClient implements ExchngeClient {
  private wsPublic: WebSocket | null = null;
  private wsPrivate: WebSocket | null = null;
  private wsPublicUrl: string;
  private wsPrivateUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private isAuthenticated: boolean = false;
  private symbol: string;
  constructor(okxConfig: ExchangeConfig, symbol: string) {
    this.symbol = symbol;
    this.apiKey = okxConfig.apiKey;
    this.apiSecret = okxConfig.apiSecret;
    this.wsPublicUrl = okxConfig.wsUrl;
    this.wsPrivateUrl = okxConfig.wsTradeUrl;
  }
  public connectPublic() {
    const okxSymbol: string = this.symbol.replace("USDT", "-USDT");
    this.wsPublic = new WebSocket(this.wsPublicUrl);
    this.wsPublic!.on("open", () => {
      this.wsPublic!.send(
        JSON.stringify({
          op: "subscribe",
          args: [
            {
              channel: "books5",
              instId: okxSymbol,
            },
          ],
        })
      );
      console.log("✅ Okx connected");
    });
    this.wsPublic!.on("message", (msg) => {
      const data = JSON.parse(msg.toString());
      if (data.data && data.data.length > 0) {
        data.data.forEach((item: any) => {
          const asksPrices = item.asks.map((item: any) => [item[0], item[1]]);
          const bidsPrices = item.bids.map((item: any) => [item[0], item[1]]);
          const { bestAskPrice, bestBidPrice } = getBestPrices(
            asksPrices,
            bidsPrices
          );
          updatePriceStore("okx", bestAskPrice!, bestBidPrice!);
        });
      }
    });
    this.wsPublic!.on("error", (err) => console.error("Okx error:", err));
  }
}
