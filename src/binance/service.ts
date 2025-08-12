import WebSocket from "ws";
import { updatePriceStore } from "../utils/priceStore";
import { config } from "../config/config";
import { convertTimestampToUTC } from "../utils/timeUtil";
import { getBestPrices, getWeightedAvgPrice } from "../utils/util";
export function connectBinance(symbol: string) {
  const wsUrl = config.binance.wsUrl.replace("%SYMBOL%", symbol.toLowerCase());
  const ws = new WebSocket(wsUrl);
  ws.on("open", () => console.log("✅ Binance connected"));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    const { a, b } = data.data;
    const { bestAskPrice, bestBidPrice } = getBestPrices(a, b);
    updatePriceStore("binance", bestAskPrice, bestBidPrice);
  });

  // data.data.b.forEach((i:any) => console.log(i));
  // const price: number = parseFloat(data.data.p);
  // const utcTimestamp = convertTimestampToUTC(data.data.E);
  // updatePriceStore("binance", price, utcTimestamp);

  ws.on("error", (err) => console.error("Binance error:", err));
}
