import { WebSocketConector } from "../socketConnector/WebSocketConector";
import { IExchangePublicClient } from "../bybit/type";
import { getBestBidAsk, getBestPrices } from "../utils/util";
import { updatePriceStore } from "../utils/priceStore";

export class MexcPublickWsClient implements IExchangePublicClient {
  constructor(private wsManager: WebSocketConector) {}
  public subscribeOrderBook(): void {
    this.wsManager.onMessage((msg: Buffer) => this.handlePublicMessage(msg));
  }
  private handlePublicMessage(msg: Buffer): void {
    const data = JSON.parse(msg.toString());
    if (!data.data) return;
    const { asks, bids } = data.data;
    if ((!asks && !bids) || asks.length === 0 || bids.length === 0) return;
    const asksPrices = asks.map((item: any) => [item[0], item[1]]);
    const bidsPrices = bids.map((item: any) => [item[0], item[1]]);
    // console.log('mexc', asksPrices, bidsPrices)
   const { bestAskPrice, bestBidPrice } = getBestBidAsk(asksPrices, bidsPrices);
    updatePriceStore("mexc", bestAskPrice!, bestBidPrice!);
  }
}
