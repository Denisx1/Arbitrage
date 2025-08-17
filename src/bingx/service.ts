import WebSocket from "ws";

import zlib from "zlib";
import { getBestPrices } from "../utils/util";
import { updatePriceStore } from "../utils/priceStore";
import { ExchngeClient } from "../types";
import { ExchangeConfig } from "../config/types";
export class BingxWsClient implements ExchngeClient {
  private wsPublic: WebSocket | null = null;
  private wsPrivate: WebSocket | null = null;
  private wsPublicUrl: string;
  private wsPrivateUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private isAuthenticated: boolean = false;
  private symbol: string;
  constructor(bingxConfig: ExchangeConfig, symbol: string) {
    this.symbol = symbol;
    this.apiKey = bingxConfig.apiKey;
    this.apiSecret = bingxConfig.apiSecret;
    this.wsPublicUrl = bingxConfig.wsUrl;
    this.wsPrivateUrl = bingxConfig.wsTradeUrl;
  }
  public connectPublic() {
    this.wsPublic = new WebSocket(this.wsPublicUrl);
    this.wsPublic!.on("open", () => {
      const bingxSymbol: string = this.symbol.replace("USDT", "-USDT");
      const CHANNEL = {
        id: "e745cd6d-d0f6-4a70-8d5a-043e4c741b40",
        reqType: "sub",
        dataType: `${bingxSymbol}@depth5@500ms`,
      };
      this.wsPublic!.send(JSON.stringify(CHANNEL));

      console.log("✅ BINGX connected");
    });
    this.wsPublic!.on("message", (msg) => {
      const buf = Buffer.from(msg as any);
      const decodedMsg = zlib.gunzipSync(buf).toString("utf-8");
      if (decodedMsg === "Ping") return;
      const data = JSON.parse(decodedMsg);
      if (!data.data) return;

      const { asks, bids } = data.data;
      const { bestAskPrice, bestBidPrice } = getBestPrices(asks, bids);
      updatePriceStore("bingx", bestAskPrice!, bestBidPrice!);
    });
    this.wsPublic.on("error", (err) => console.error("Bingx error:", err));
  }
}
