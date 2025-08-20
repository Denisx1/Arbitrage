import { ExchangeConfig } from "../../config/types";
import WebSocket from "ws";
import { updatePriceStore } from "../../utils/priceStore";
import { IExchangePublicClient } from "./type";
import { getBestBidAsk } from "../../utils/util";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { Exchanges } from "../../pairsEnum";
export class BybitPublickWsClient implements IExchangePublicClient {
  constructor(private wsManager: WebSocketConector) {}
  public subscribeOrderBook(): void {
    this.wsManager.onMessage((msg: Buffer) => this.handlePublicMessage(msg));
  }
  private handlePublicMessage(msg: Buffer): void {
    const data = JSON.parse(msg.toString());
    if (!data.data) return;

    const { a, b } = data.data;
    if (!a.length || !b.length) return;
    const { bestBuy, bestSell } = getBestBidAsk(a, b);
    updatePriceStore(Exchanges.BYBIT, bestBuy!, bestSell!);
  }
}
