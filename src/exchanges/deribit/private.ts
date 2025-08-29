import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { AuthDeribitWs } from "./auth";
import { IExchangePrivateClient } from "../../types";
import { ArbitrageOpportunity } from "../../arbitrage/service";
import { IExchangeAuth } from "../bybit/type";
import { Direction } from "../binance/private/privateClient";
interface DeribitOrderParams {
  id: number;
  jsonrpc: string;
  method: string;
  params: {
    amount: number;
    instrument_name: string;
    label: string;
    type: string;
    price: number;
  };
}
export class DeribitPrivateWsClient implements IExchangePrivateClient {
  private requestId: number = 5545;
  constructor(private auth: IExchangeAuth) {
    this.auth.ws?.addMessageHandler((msg) => this.handleOrderResponse(msg));
  }
  public placeOrder(
    order: Partial<ArbitrageOpportunity>,
    direction: Direction
  ) {
    let newOrder;
    if (direction === Direction.BUY) {
      newOrder = {
        id: this.requestId,
        jsonrpc: "2.0",
        method: "private/buy",
        params: {
          amount: 100,
          instrument_name: order.bestBuy?.symbol!,
          label: "market0000234",
          type: "limit",
          price: order.bestBuy?.price,
        },
      };
    } else if (direction === Direction.SELL) {
      newOrder = {
        id: this.requestId,
        jsonrpc: "2.0",
        method: "private/sell",
        params: {
          amount: 100,
          instrument_name: order.bestSell?.symbol!,
          label: "market0000234",
          type: "limit",
          price: order.bestSell?.price,
        },
      };
    }
    this.createOrder(newOrder!);
  }
  private createOrder(order: any) {
    this.auth.ws?.send<DeribitOrderParams>(order);
  }
  private handleOrderResponse(msg: Buffer) {
    const data = JSON.parse(msg.toString());
    if (data.id !== this.requestId) return;
    console.log(data);
  }
}
