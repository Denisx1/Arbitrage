import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import zlib from "zlib";
import { updatePriceStore } from "../../utils/priceStore";
import { getBestBidAsk } from "../../utils/util";
import { Exchanges } from "../../pairsEnum";
import { HTXRequestPublicParams } from "./types";
export class HTXWsPublicClient {
  private isSubscribed = false;
  constructor(private wsManager: WebSocketConector, private symbol: string) {
    this.wsManager.addMessageHandler((msg) => this.handlePublicMessage(msg));
  }
  public subscribeOrderBook() {
    this.symbol = this.symbol.replace("USDT", "-USDT");
    this.wsManager.connectWebSocket<HTXRequestPublicParams>({
      sub: `market.${this.symbol}.depth.step0`,
      id: "id5",
    });
  }

  private handlePublicMessage(msg: Buffer): void {
    const buf = Buffer.from(msg);
    const decodedMsg = zlib.gunzipSync(buf).toString("utf-8");
    const parsedData = JSON.parse(decodedMsg);
    if (parsedData.ping) {
      this.wsManager.send({ pong: parsedData.ping });
    }

    const { bids, asks } = parsedData.tick ?? {};
    if (!bids || !asks) return;

    // console.log('htx', asks, bids)
    const { bestBuy, bestSell } = getBestBidAsk(asks, bids, this.symbol);
    updatePriceStore(Exchanges.HTX, bestBuy!, bestSell!);
  }
}
