import { IExchangePublicClient } from "../bybit/type";
import { Exchanges } from "../../pairsEnum";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { updatePriceStore } from "../../utils/priceStore";
import { getBestBidAsk } from "../../utils/util";

export class DeribitPublicWs implements IExchangePublicClient {
  constructor(private wsManager: WebSocketConector) {}
  subscribeOrderBook(): void {
    this.wsManager.onMessage((msg: Buffer) => this.handlePublicMessage(msg));
  }
  private handlePublicMessage(msg: Buffer): void {
    const data = JSON.parse(msg.toString());

    if (!data.params) return;
    const { bids, asks } = data.params.data
    const asksPrices = asks.map(([_, price, amount]: any) => [
      parseFloat(price),
      parseFloat(amount),
    ]);
    const bidsPrices = bids.map(([_, price, amount]: any) => [
      parseFloat(price),
      parseFloat(amount),
    ]);
    if(!asksPrices.length || !bidsPrices.length) return;
 
    const { bestBuy, bestSell } = getBestBidAsk(
      asksPrices,
      bidsPrices
    );

    updatePriceStore(Exchanges.DERIBIT, bestBuy!, bestSell!);
  }
}
