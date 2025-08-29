import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { PlaceOrderParams } from "../binance/types";

export interface BybitRequestPublicParams {
  op: string;
  args: string[];
}
export interface IExchangeAuth {
  login: () => void;
  readonly status: boolean;
  readonly ws?: WebSocketConector;
  balance?: number;
  sendOrder?: () => void;
}

export interface IExchangePublicClient {
  subscribeOrderBook: () => void;
}

export interface IOrderParams {
  reqId: string;
  header: {
    XBAPI_TIMESTAMP: string;
    XBAPI_RECV_WINDOW: string;
    Referer: string; // for api broker
  };
  op: string;
  args: [
    {
      symbol: string;
      side: string;
      orderType: string;
      qty: string;
      price: string;
      category: string;
      timeInForce: string;
    }
  ];
}

export interface IByBitResponce {
  retCode: number;
  retMsg: string;
  op: string;
  connId: string;
}
export type ArgAuthType = string | number;
export type ArgType = ArgAuthType[] | IOrderParams[];
export interface AuthByBitRequest<T extends ArgType> {
  op: string;
  args: T;
}
