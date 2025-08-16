import { PlaceOrderParams } from "../binance/types";

export interface IExchangeAuth {
  checkSession: () => void;
}
export interface IExchangePublicClient {
  connectPublic: () => void;
}
export interface IExchangePrivateClient {
  connect: (order: Partial<PlaceOrderParams>) => void;
}
