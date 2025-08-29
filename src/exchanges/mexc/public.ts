import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { IExchangePublicClient } from "../bybit/type";
import { getBestBidAsk } from "../../utils/util";
import { updatePriceStore } from "../../utils/priceStore";
import { Exchanges } from "../../pairsEnum";
interface MexcPublickWsRequest {
  method: string;
  param: {
    symbol: string;
  };
}
export class MexcPublickWsClient implements IExchangePublicClient {
  private pingInterval?: NodeJS.Timeout;
  private isSubscribed = false;
  private symbol: string;
  constructor(private wsManager: WebSocketConector, symbol: string) {
    this.symbol = symbol.replace("USDT", "_USDT");
    this.startPing();
    this.wsManager.addMessageHandler((msg) => this.handlePublicMessage(msg));
  }
  public async subscribeOrderBook(): Promise<void> {
    await this.wsManager.connectWebSocket<MexcPublickWsRequest>({
      method: "sub.depth",
      param: {
        symbol: this.symbol,
      },
    });
    this.isSubscribed = true;
  }

  private handlePublicMessage(msg: Buffer): void {
    const data = JSON.parse(msg.toString());
    if (!data.data) return;

    const { asks, bids } = data.data;
    if ((!asks && !bids) || asks.length === 0 || bids.length === 0) return;
    const asksPrices = asks.map((item: any) => [item[0], item[1]]);
    const bidsPrices = bids.map((item: any) => [item[0], item[1]]);
    // console.log("mexc", asksPrices, bidsPrices);
    const { bestBuy, bestSell } = getBestBidAsk(
      asksPrices,
      bidsPrices,
      data.symbol
    );
    updatePriceStore(Exchanges.MEXC, bestBuy!, bestSell!);
  }
  private startPing() {
    this.pingInterval = setInterval(() => {
      this.wsManager.send({ method: "ping" });
    }, 20000);
  }

  public stopPing() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }
}
