import { PlaceOrderParams } from "../../arbitrage/binance/types";

export interface IExchangeAuth {
  login: () => void;
  readonly status: boolean;
}
export interface IExchangePublicClient {
  subscribeOrderBook: () => void;
}
export interface IExchangePrivateClient {
  connect: (order: Partial<PlaceOrderParams>) => void;
}
