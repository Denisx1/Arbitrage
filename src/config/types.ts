
export interface ExchangeConfig {
  wsUrl: string;
  wsTradeUrl: string;
  apiKey: string;
  apiSecret: string;
}
export interface Config<T> {
  binance: T;
  byBit: T;
  okx: T;
  mexc: T;
  bingx: T;
  htx: T;
  deribit: T;
}
export type Time = number | string;

export interface ExchangesReturn<T> {
  byBitClient?: T;
  binanceClient?: T;
  bingxClient?: T;
  okxClient?: T;
  mexcClient?: T;
  htxClient?: T;
  deribitClient?: T;
}


