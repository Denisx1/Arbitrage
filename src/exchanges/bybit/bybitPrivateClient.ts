import { IExchangePrivateClient } from "../../types";
import { ArbitrageOpportunity } from "../../arbitrage/service";
import { IExchangeAuth, IOrderParams } from "./type";
import { Direction } from "../binance/private/privateClient";

export class BybitPrivateWsClient implements IExchangePrivateClient {
  constructor(private auth: IExchangeAuth) {
    this.auth.ws?.addMessageHandler((msg: Buffer) =>
      this.handleOrderResponse(msg)
    );
  }

  public placeOrder(
    order: Partial<ArbitrageOpportunity>,
    direction: Direction
  ) {
    const timestamp = Date.now().toString();
    let newOrder: IOrderParams;
    if (direction === Direction.BUY) {
      newOrder = {
        reqId: "byBitOrderBuy",
        header: {
          XBAPI_TIMESTAMP: timestamp,
          XBAPI_RECV_WINDOW: "5000",
          Referer: "1",
        },
        op: "order.create",
        args: [
          {
            symbol: order.bestBuy?.symbol!,
            side: Direction.BUY,
            orderType: "LIMIT",
            qty: (this.auth.balance! / order.bestBuy?.price!).toString(),
            price: order.bestBuy?.price.toString()!,
            category: "LIMIT",
            timeInForce: "GTC",
          },
        ],
      };
    } else if (direction === Direction.SELL) {
      newOrder = {
        reqId: "byBitOrderSell",
        header: {
          XBAPI_TIMESTAMP: timestamp,
          XBAPI_RECV_WINDOW: "5000",
          Referer: "1",
        },
        op: "order.create",
        args: [
          {
            symbol: order.bestSell?.symbol!,
            side: Direction.SELL,
            orderType: "LIMIT",
            qty: (this.auth.balance! / order.bestSell?.price!).toString(),
            price: order.bestSell?.price.toString()!,
            category: "LIMIT",
            timeInForce: "GTC",
          },
        ],
      };
    }

    this.createOrder(newOrder!);

    return;
  }

  private createOrder(order: IOrderParams) {
    if (this.auth.status && this.auth.balance! > 0) {
      this.auth.ws?.send<IOrderParams>(order);
    }
  }
  private handleOrderResponse(msg: Buffer) {
    const parsedData = JSON.parse(msg.toString());

    if (
      parsedData.reqId !== "byBitOrderBuy" &&
      parsedData.reqId !== "byBitOrderSell"
    ) {
      return;
    }
    if (parsedData.retCode === 10404) {
      console.log(`недостаточно средств для выставление ордера`);
      return;
    }
    console.log("✅ Ордер выполнен", parsedData.result);
  }
}
