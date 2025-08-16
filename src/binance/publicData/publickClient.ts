import { IExchangePublicClient } from "../../bybit/type";
import { updatePriceStore } from "../../utils/priceStore";
import { getBestPrices } from "../../utils/util";
import { BinanceWebSocketConnector } from "../BinanceWsService";
import { PublicResponce } from "../types";

export class PublicBinanceWsClient implements IExchangePublicClient {
  constructor(private binanceWsService: BinanceWebSocketConnector) {}
  public connectPublic() {
    this.binanceWsService.onMessage<PublicResponce>((data) =>
      this.handlePublicMessage(data)
    );
  }
  private handlePublicMessage(data: PublicResponce): void {
    const { a, b } = data.data;
    const { bestAskPrice, bestBidPrice } = getBestPrices(a, b);
    updatePriceStore("binance", bestAskPrice, bestBidPrice);
  }
}
