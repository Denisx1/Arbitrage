import WebSocket from "ws";
import { ExchangeConfig } from "../config/types";
import { ByBitAuth, AuthByBitRequest } from "./bybitAuth";
import { IExchangePrivateClient } from "./type";
import { WebSocketConector } from "../socketConnector/WebSocketConector";
export interface OrderParams {
  category: string;
  symbol: string;
  side: string;
  orderType: string;
  qty: string;
  price: string;
  timeInForce: string;
}
export class BybitPrivateWsClient {
  private isAuthenticated: boolean = false;
  private wsPrivate: WebSocket | null = null;
  constructor(private wsManager: WebSocketConector, private auth: ByBitAuth) {}

  public connectPrivate() {
    if (!this.auth.status) {
      console.log("❌ Session not active, cannot place order");
      return;
    }
    this.wsManager.send<AuthByBitRequest<OrderParams[]>>(this.placeOrder());
  }
  public placeOrder() // price: number, // symbol: string,
  // qty: number,
  // side: string
  {
    return {
      op: "spread.order",
      args: [
        {
          category: "linear",
          symbol: "BTCUSDT",
          side: "Buy",
          orderType: "Limit",
          qty: "0.001",
          price: "20000",
          timeInForce: "GoodTillCancel",
        },
      ],
    };
    // if (
    //   !this.isAuthenticated ||
    //   this.wsManager.ws?.readyState !== WebSocket.OPEN
    // ) {
    //   throw new Error("WebSocket not connected or authenticated");
    // }
    // const orderPayload: AuthByBitRequest<OrderParams[]> = {
    //   op: "spread.order",
    //   args: [
    //     {
    //       category: "linear",
    //       symbol: symbol,
    //       side,
    //       orderType: "Limit",
    //       qty: qty.toString(),
    //       price: price.toString(),
    //       timeInForce: "GoodTillCancel",
    //     },
    //   ],
    // };
    // return orderPayload;
  }
}
