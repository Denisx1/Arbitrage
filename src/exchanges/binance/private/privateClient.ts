import { BinanceOrderParams } from "../types";
import { ArbitrageOpportunity } from "../../../arbitrage/service";
import { IExchangePrivateClient } from "../../../types";
import { IExchangeAuth } from "../../bybit/type";
import { ActionType } from "../enums";

export enum Direction {
  BUY = "BUY",
  SELL = "SELL",
}
export class BinancePrivateWsClient implements IExchangePrivateClient {
  constructor(private auth: IExchangeAuth) {
    this.auth!.ws!.addMessageHandler((msg) => {
      this.handleOrderResponse(msg);
    });
  }
  public async placeOrder(
    order: Partial<ArbitrageOpportunity>,
    direction: Direction
  ) {
    let newOrder: BinanceOrderParams;
    if (direction === Direction.BUY) {
      newOrder = {
        id: ActionType.BINANCE_PLACE_BUY_ORDER,
        method: "order.place",
        params: {
          symbol: order.bestBuy?.symbol!, // Исправьте на 'ADAUSDT'
          side: Direction.BUY,
          type: "LIMIT",
          price: order.bestBuy?.price.toString()!,
          quantity: (this.auth.balance! / order.bestBuy?.price!).toString(),
          timeInForce: "GTC",
          timestamp: new Date().getTime(), // Обязательно
        },
      };
    } else if (direction === Direction.SELL) {
      newOrder = {
        id: ActionType.BINANCE_PLACE_SELL_ORDER,
        method: "order.place",
        params: {
          symbol: order.bestSell?.symbol!,
          side: Direction.SELL,
          type: "LIMIT",
          price: order.bestSell?.price.toString()!,
          quantity: (this.auth.balance! / order.bestSell?.price!).toString(),
          timeInForce: "GTC",
          timestamp: new Date().getTime(), // Обязательно
          recvWindow: 5000, // Рекомендуется
        },
      };
    }
    this.createOrder(newOrder!);

    return;
  }
  private createOrder(order: BinanceOrderParams) {
    if (this.auth.status) {
      this.auth.ws?.send<BinanceOrderParams>(order);
    }
  }

  private handleOrderResponse(msg: Buffer) {
    const parsedData = JSON.parse(msg.toString());
    if (
      parsedData.id !== ActionType.BINANCE_PLACE_BUY_ORDER &&
      parsedData.id !== ActionType.BINANCE_PLACE_SELL_ORDER
    ) {
      return;
    }
    if (parsedData.status !== 200) {
      console.log("❌ Ордер Binance не выполнен", parsedData.error.msg);
      return;
    }
    console.log("✅ Ордер Binance выполнен", parsedData);
  }
}
