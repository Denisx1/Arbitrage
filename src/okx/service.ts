import WebSocket from "ws";
import { updatePriceStore } from "../utils/priceStore";
import { config } from "../config/config";
import { convertTimestampToUTC } from "../utils/timeUtil";
import { getBestPrices, getWeightedAvgPrice } from "../utils/util";
export function connectOkx(symbol: string) {
  const okxSymbol: string = symbol.replace("USDT", "-USDT");
  const ws = new WebSocket(config.okx.wsUrl);
  ws.on("open", () => {
    ws.send(
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

  ws.on("message", (msg) => {
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

  ws.on("error", (err) => console.error("Okx error:", err));
}
