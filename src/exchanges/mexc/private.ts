import { ArbitrageOpportunity } from "../../arbitrage/service";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { IExchangePrivateClient } from "../../types";
import { MexcAuth } from "./auth";
import { IExchangeAuth } from "../bybit/type";
import { Direction } from "../binance/private/privateClient";
interface MexcOrderParams {
  channel: "push.personal.order";
  data: {
    orderId: string; // ID ордера
    symbol: string; // Инструмент, напр. "CRV_USDT"
    positionId: string; // ID позиции (long/short)
    price: number; // Цена ордера
    vol: number; // Объем
    leverage: number; // Плечо
    side: 1 | 2 | 3 | 4; // 1: open long, 2: close short, 3: open short, 4: close long
    category: number; // 1: limit, 2: system, 3: close, 4: ADL
    orderType: number; // Тип ордера (обычно 1 = limit, 5 = market)
    dealAvgPrice: number; // Средняя цена сделки
    dealVol: number; // Исполненный объем
    state: 1 | 2 | 3 | 4 | 5; // Статус: 1 new, 2 uncompleted, 3 completed, 4 cancelled, 5 invalid
    feeCurrency: string; // Валюта комиссии, напр. "USDT"
    profit: number; // Прибыль (если ордер закрывает позицию)
    createTime: number; // Время создания (timestamp ms)
    updateTime: number;
  };
  ts: number;
}
export class MexcPrivateWsClient implements IExchangePrivateClient {
  constructor(private auth: IExchangeAuth) {
    this.auth.ws?.addMessageHandler((msg) => this.handleOrderResponse(msg));
  }
  public placeOrder(
    order: Partial<ArbitrageOpportunity>,
    direction: Direction
  ) {
    let newOrder: MexcOrderParams;
    if (direction === Direction.BUY) {
      newOrder = {
        channel: "push.personal.order",
        data: {
          orderId: "",
          symbol: order.bestBuy?.symbol!,
          positionId: "",
          price: order.bestBuy?.price!,
          vol: this.auth.balance! / order.bestBuy?.price!,
          leverage: 1,
          side: 1,
          category: 1,
          orderType: 1,
          dealAvgPrice: 0,
          dealVol: 0,
          state: 1,
          feeCurrency: "USDT",
          profit: 0,
          createTime: Date.now(),
          updateTime: Date.now(),
        },
        ts: Date.now(),
      };
    } else if (direction === Direction.SELL) {
      newOrder = {
        channel: "push.personal.order",
        data: {
          orderId: "",
          symbol: order.bestSell?.symbol!,
          positionId: "",
          price: order.bestSell?.price!,
          vol: this.auth.balance! / order.bestSell?.price!,
          leverage: 1,
          side: 4,
          category: 1,
          orderType: 1,
          dealAvgPrice: 0,
          dealVol: 0,
          state: 1,
          feeCurrency: "USDT",
          profit: 0,
          createTime: Date.now(),
          updateTime: Date.now(),
        },
        ts: Date.now(),
      };
    }
    this.createOrder(newOrder!);
  }
  private createOrder(order: MexcOrderParams) {
    if (this.auth.status) {
      this.auth.ws!.send<MexcOrderParams>(order);
    }
  }
  private handleOrderResponse(msg: Buffer) {
    const parsedData = JSON.parse(msg.toString());
    console.log(parsedData);
  }
}
