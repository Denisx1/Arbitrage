import { IExchangePublicClient } from "../bybit/type";
import { Exchanges } from "../../pairsEnum";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { updatePriceStore } from "../../utils/priceStore";
import { getBestBidAsk } from "../../utils/util";

export class DeribitPublicWs implements IExchangePublicClient {
  constructor(private wsManager: WebSocketConector, private symbol: string) {
    this.wsManager.addMessageHandler((msg) => this.handlePublicMessage(msg));
  }

  subscribeOrderBook(): void {
    this.symbol = this.symbol.replace("USDT", "_USDC-PERPETUAL");
    this.wsManager.connectWebSocket({
      method: "/public/subscribe",
      params: {
        channels: [`book.${this.symbol}.100ms`],
      },
    });
  }
  private handlePublicMessage(msg: Buffer): void {
    const data = JSON.parse(msg.toString());
 
    if (!data.params) return;
    const { bids, asks, instrument_name } = data.params.data;
    const asksPrices = asks.map(([_, price, amount]: any) => [
      parseFloat(price),
      parseFloat(amount),
    ]);
    const bidsPrices = bids.map(([_, price, amount]: any) => [
      parseFloat(price),
      parseFloat(amount),
    ]);
    if (!asksPrices.length || !bidsPrices.length) return;

    const { bestBuy, bestSell } = getBestBidAsk(
      asksPrices,
      bidsPrices,
      instrument_name
    );

    updatePriceStore(Exchanges.DERIBIT, bestBuy!, bestSell!);
  }
}
