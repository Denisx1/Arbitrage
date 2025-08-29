import { IExchangePublicClient } from "../../bybit/type";
import { Exchanges } from "../../../pairsEnum";
import { WebSocketConector } from "../../../socketConnector/WebSocketConector";
import { updatePriceStore } from "../../../utils/priceStore";
import { getBestBidAsk } from "../../../utils/util";
import { ActionType } from "../enums";

export class PublicBinanceWsClient implements IExchangePublicClient {
  private isSubscribed = false;

  constructor(private binanceWsService: WebSocketConector) {
    this.binanceWsService.addMessageHandler((msg: Buffer) =>
      this.handlePublicMessage(msg)
    );
  }
  public async subscribeOrderBook() {
    await this.binanceWsService.connectWebSocket();
    this.isSubscribed = true;
  }

  private handlePublicMessage(data: Buffer): void {
    const parsedData = JSON.parse(data.toString());
    if (parsedData.data.e !== ActionType.BINANCE_SUBSCRIBE_ORDER_BOOK) return;
    const { a, b, s } = parsedData.data;
    const { bestBuy, bestSell } = getBestBidAsk(a, b, s);
    updatePriceStore(Exchanges.BINANCE, bestBuy!, bestSell!);
  }

  public get status(): boolean {
    return this.isSubscribed;
  }
}
