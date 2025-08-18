import { IExchangePublicClient } from "../../bybit/type";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { updatePriceStore } from "../../utils/priceStore";
import { getBestBidAsk } from "../../utils/util";

export class PublicBinanceWsClient implements IExchangePublicClient {
  constructor(private binanceWsService: WebSocketConector) {}
  public subscribeOrderBook() {
    this.binanceWsService.onMessage((data: Buffer) =>
      this.handlePublicMessage(data)
    );
  }
  private handlePublicMessage(data: Buffer): void {
    const parsedData = JSON.parse(data.toString());
    const { a, b } = parsedData.data;
    // console.log('binance', a, b)
    const { bestBuy, bestSell } = getBestBidAsk(a, b);
    updatePriceStore("binance", bestBuy!, bestSell!);
  }
}


