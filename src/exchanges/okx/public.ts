import { Exchanges } from "../../pairsEnum";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { updatePriceStore } from "../../utils/priceStore";
import { getBestBidAsk } from "../../utils/util";
import { IExchangePublicClient } from "../bybit/type";
import { OkxRequestPublicParams } from "./types";

export class OkxPublickWsClient implements IExchangePublicClient {
  private symbol: string;
  constructor(private wsManager: WebSocketConector, symbol: string) {
    this.symbol = symbol.replace("USDT", "-USDT");
    this.wsManager.addMessageHandler((msg: Buffer) =>
      this.handlePublicMessage(msg)
    );
  }
  public subscribeOrderBook(): void {
    this.wsManager.connectWebSocket<OkxRequestPublicParams>({
      op: "subscribe",
      args: [
        {
          channel: "books5",
          instId: this.symbol,
        },
      ],
    });
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
          bidsPrices,
          item.instId
        );
        updatePriceStore(Exchanges.OKX, bestBuy!, bestSell!);
      });
    }
  }
}
