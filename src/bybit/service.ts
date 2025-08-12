import WebSocket from "ws";
import { updatePriceStore } from "../utils/priceStore";
import { config } from "../config/config";
import { convertTimestampToUTC } from "../utils/timeUtil";
import { getBestPrices, getWeightedAvgPrice } from "../utils/util";
export function connectBybit(symbol: string) {
  const ws = new WebSocket(config.bybit.wsUrl);
  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        op: "subscribe",
        args: [`orderbook.500.${symbol}`],
      })
    );
    console.log("✅ Bybit connected");
  });

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());
    if (!data.data) return;
   
    const { a, b } = data.data;
  
    const { bestAskPrice, bestBidPrice } = getBestPrices(a, b);
    updatePriceStore("bybit", bestAskPrice, bestBidPrice);


    // updatePriceStore("bybit", bestBuyBybit!, bestSellBybit!);
  });

  ws.on("error", (err) => console.error("Bybit error:", err));
}
