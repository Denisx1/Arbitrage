import { config } from "../config/config";
import WebSocket from "ws";
import { getBestPrices, getWeightedAvgPrice } from "../utils/util";
import { updatePriceStore } from "../utils/priceStore";
export function connectMexc(symbol: string) {
  const ws = new WebSocket(config.mexc.wsUrl);
  const mexcSymbol: string = symbol.replace("USDT", "_USDT");
  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        method: "sub.depth",
        param: {
          symbol: `${mexcSymbol}`,
        },
      })
    );
    console.log("✅ MEXC connected");
  });
  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    if (!data.data) return;
    const { asks, bids } = data.data;
    if((!asks && !bids) || asks.length === 0 || bids.length === 0) return;
    const asksPrices = asks.map((item: any) => [item[0], item[1]]);
    const bidsPrices = bids.map((item: any) => [item[0], item[1]]);
    const { bestAskPrice, bestBidPrice  } = getBestPrices(asksPrices, bidsPrices);

    updatePriceStore("mexc", bestAskPrice!, bestBidPrice!);
  });
}
