import { PlaceOrderParams } from "../binance/types";

export interface IExchangeAuth {
  login: () => void;
}
export interface IExchangePublicClient {
  subscribeOrderBook: () => void;
}
export interface IExchangePrivateClient {
  connect: (order: Partial<PlaceOrderParams>) => void;
}
