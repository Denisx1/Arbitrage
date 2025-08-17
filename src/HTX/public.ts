import { WebSocketConector } from "../socketConnector/WebSocketConector";
import zlib from "zlib";
import { updatePriceStore } from "../utils/priceStore";
import { getBestBidAsk, getBestPrices } from "../utils/util";
export class HTXWsPublicClient {
  constructor(private wsManager: WebSocketConector) {}
  public subscribeOrderBook() {
    this.wsManager.onMessage((msg: Buffer) => this.handlePublicMessage(msg));
  }

  private handlePublicMessage(msg: Buffer): void {
    const buf = Buffer.from(msg);
    const decodedMsg = zlib.gunzipSync(buf).toString("utf-8");
    const parsedData = JSON.parse(decodedMsg);
    const { bids, asks } = parsedData.tick ?? {};
    if (!bids || !asks) return;
    // console.log('htx', asks, bids)
    const { bestAskPrice, bestBidPrice } = getBestBidAsk(asks, bids);
    updatePriceStore("htx", bestAskPrice!, bestBidPrice!)
  }
}
