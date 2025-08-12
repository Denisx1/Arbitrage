import { config } from "../config/config";
import WebSocket from "ws";
import pako from "pako";
import zlib from "zlib";
import { getBestPrices, getWeightedAvgPrice } from "../utils/util";
import { updatePriceStore } from "../utils/priceStore";
export function connectBingx(symbol: string) {
  const ws = new WebSocket(config.bingx.wsUrl);
  const bingxSymbol: string = symbol.replace("USDT", "-USDT");
  const CHANNEL = {
    id: "e745cd6d-d0f6-4a70-8d5a-043e4c741b40",
    reqType: "sub",
    dataType: `${bingxSymbol}@depth5@500ms`,
  };
  ws.on("open", () => {
    ws.send(JSON.stringify(CHANNEL));
    console.log("✅ BINGX connected");
  });

  ws.on("message", (msg) => {
    const buf = Buffer.from(msg as any);
    const decodedMsg = zlib.gunzipSync(buf).toString("utf-8");
    if (decodedMsg === "Ping") return;
    const data = JSON.parse(decodedMsg);
    if (!data.data) return;
    const { asks, bids } = data.data;
    const { bestAskPrice, bestBidPrice } = getBestPrices(asks, bids);
    updatePriceStore("bingx", bestAskPrice!, bestBidPrice!);
  });

  ws.on("error", (err) => console.error("Bingx error:", err));
}
