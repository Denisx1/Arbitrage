import { updatePriceStore } from "../../utils/priceStore";
import { BybitRequestPublicParams, IExchangePublicClient } from "./type";
import { getBestBidAsk } from "../../utils/util";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { Exchanges } from "../../pairsEnum";
export class BybitPublickWsClient implements IExchangePublicClient {
  private isSubscribed = false;
  constructor(private wsManager: WebSocketConector, private symbol: string) {
    this.wsManager.addMessageHandler((msg) => this.handlePublicMessage(msg));
  }
  public subscribeOrderBook(): void {
    this.wsManager.connectWebSocket<BybitRequestPublicParams>({
      op: "subscribe",
      args: [`orderbook.500.${this.symbol}`],
    });
    this.isSubscribed = true;
  }
  private handlePublicMessage(msg: Buffer): void {
    const data = JSON.parse(msg.toString());

    if (!data.data) return;

    const { a, b, s } = data.data;
    if (!a.length || !b.length) return;
    const { bestBuy, bestSell } = getBestBidAsk(a, b, s);
    updatePriceStore(Exchanges.BYBIT, bestBuy!, bestSell!);
  }
}
