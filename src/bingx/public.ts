import { IExchangePublicClient } from "../bybit/type";
import { WebSocketConector } from "../socketConnector/WebSocketConector";
import { updatePriceStore } from "../utils/priceStore";
import { getBestBidAsk, getBestPrices } from "../utils/util";
import zlib from "zlib";

export class BingXPublickWsClient implements IExchangePublicClient {
  constructor(private wsManager: WebSocketConector) {}
  public subscribeOrderBook(): void {
    this.wsManager.onMessage((msg: Buffer) => this.handlePublicMessage(msg));
  }
  private handlePublicMessage(msg: Buffer): void {
    const buf = Buffer.from(msg);
    const decodedMsg = zlib.gunzipSync(buf).toString("utf-8");
    if (decodedMsg === "Ping") return;
    const data = JSON.parse(decodedMsg);
    if (!data.data) return;
    const { asks, bids } = data.data;
    // console.log('bingx', asks, bids)
    const { bestAskPrice, bestBidPrice } = getBestBidAsk(asks, bids);
    updatePriceStore("bingx", bestAskPrice!, bestBidPrice!);
  }
}
