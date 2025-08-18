import { IExchangePrivateClient, IExchangePublicClient } from "../bybit/type";
import { Exchanges } from "../pairsEnum";

export interface ExchangeConfig {
  wsUrl: string;
  wsTradeUrl: string;
  apiKey: string;
  apiSecret: string;
}
export interface Config<T> {
  binance: T;
  bybit: T;
  okx: T;
  mexc: T;
  bingx: T;
  htx: T;
  deribit: T;
}
export type Time = number | string;

export interface ExchangesReturn<T> {
  byBitClient: T;
  binanceClient: T;
  bingxClient?: T;
  okxClient: T;
  mexcClient?: T;
  htxClient?: T;
  deribitClient?: T;
}
export interface BingXRequestPublicParams {
  id: string;
  reqType: string;
  dataType: string;
}

export interface BybitRequestPublicParams {
  op: string;
  args: string[];
}
export interface MexcRequestPublicParams {
  method: string;
  param: {
    symbol: string;
  };
}
export interface OkxRequestPublicParams {
  op: string;
  args: [
    {
      channel: string;
      instId: string;
    }
  ];
}
