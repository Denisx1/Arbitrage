import { IExchangePrivateClient } from "../../types";
import { ArbitrageOpportunity } from "../../arbitrage/service";
import { IExchangeAuth } from "../bybit/type";
import { Direction } from "../binance/private/privateClient";
interface OkxOrderParams {
  id: string;
  op: string;
  args: [
    {
      side: string;
      instId: string;
      tdMode: string;
      ordType: string;
      sz: string;
      px: string;
    }
  ];
}
export class OkxPrivateWsClient implements IExchangePrivateClient {
  constructor(private auth: IExchangeAuth) {
    this.auth.ws?.addMessageHandler((msg) => this.handleOrderResponse(msg));
  }
  public placeOrder(
    order: Partial<ArbitrageOpportunity>,
    direction: Direction
  ) {
    let newOrder: OkxOrderParams;
    if (direction === Direction.BUY) {
      newOrder = {
        id: "111",
        op: "order",
        args: [
          {
            side: direction.toLowerCase(),
            instId: order.bestBuy?.symbol!,
            tdMode: "isolated",
            ordType: "limit",
            sz: (this.auth.balance! / order.bestBuy?.price!).toString(),
            px: order.bestBuy?.price.toString()!,
          },
        ],
      };
    } else if (direction === Direction.SELL) {
      newOrder = {
        id: "111",
        op: "order",
        args: [
          {
            side: direction.toLowerCase(),
            instId: order.bestSell?.symbol!,
            tdMode: "isolated",
            ordType: "limit",
            sz: (this.auth.balance! / order.bestSell?.price!).toString(),
            px: order.bestSell?.price.toString()!,
          },
        ],
      };
    }
    this.createOrder(newOrder!);
  }
  private createOrder(order: OkxOrderParams) {
    this.auth.ws!.send(order);
  }
  private handleOrderResponse(msg: Buffer) {
    const parsedData = JSON.parse(msg.toString());
    console.log(parsedData);
  }
}
