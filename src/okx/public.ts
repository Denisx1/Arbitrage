import { IExchangePublicClient } from "../bybit/type";
import { WebSocketConector } from "../socketConnector/WebSocketConector";
import { updatePriceStore } from "../utils/priceStore";
import { getBestBidAsk } from "../utils/util";

export class OkxPublickWsClient implements IExchangePublicClient {
  constructor(private wsManager: WebSocketConector) {}
  public subscribeOrderBook(): void {
    this.wsManager.onMessage((msg: Buffer) => this.handlePublicMessage(msg));
  }
  private handlePublicMessage(msg: Buffer): void {
    const data = JSON.parse(msg.toString());
    if (data.data && data.data.length > 0) {
      data.data.forEach((item: any) => {
        const asksPrices = item.asks.map((item: any) => [item[0], item[1]]);
        const bidsPrices = item.bids.map((item: any) => [item[0], item[1]]);
        // console.log("okx", asksPrices, bidsPrices);
        const { bestBuy, bestSell } = getBestBidAsk(
          asksPrices,
          bidsPrices
        );
        updatePriceStore("okx", bestBuy!, bestSell!);
      });
    }
  }
}
