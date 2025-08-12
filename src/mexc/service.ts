import WebSocket from "ws";
import { getBestPrices, getWeightedAvgPrice } from "../utils/util";
import { updatePriceStore } from "../utils/priceStore";
import { ExchngeClient } from "../types";
import { ExchangeConfig } from "../config/types";

export class MexcWsClient implements ExchngeClient {
  private wsPublic: WebSocket | null = null;
    private wsPrivate: WebSocket | null = null;
    private wsPublicUrl: string;
    private wsPrivateUrl: string;
    private apiKey: string;
    private apiSecret: string;
    private isAuthenticated: boolean = false;
    private symbol: string;
    constructor(mexcConfig: ExchangeConfig, symbol: string) {
      this.symbol = symbol;
      this.apiKey = mexcConfig.apiKey;
      this.apiSecret = mexcConfig.apiSecret;
      this.wsPublicUrl = mexcConfig.wsUrl;
      this.wsPrivateUrl = mexcConfig.wsTradeUrl;
    }
    public connectPublic() {
      this.wsPublic = new WebSocket(this.wsPublicUrl);
      const mexcSymbol: string = this.symbol.replace("USDT", "_USDT");
      this.wsPublic!.on("open", () => {
        this.wsPublic!.send(
          JSON.stringify({
            method: "sub.depth",
            param: {
              symbol: `${mexcSymbol}`,
            },
          })
        );
        console.log("✅ MEXC connected");
      });
      this.wsPublic!.on("message", (msg) => {
        const data = JSON.parse(msg.toString());
        if (!data.data) return;
        const { asks, bids } = data.data;
        if((!asks && !bids) || asks.length === 0 || bids.length === 0) return;
        const asksPrices = asks.map((item: any) => [item[0], item[1]]);
        const bidsPrices = bids.map((item: any) => [item[0], item[1]]);
        const { bestAskPrice, bestBidPrice  } = getBestPrices(asksPrices, bidsPrices);

        updatePriceStore("mexc", bestAskPrice!, bestBidPrice!);
      });
      this.wsPublic!.on("error", (err) => console.error("MEXC error:", err));
    }
      
}

