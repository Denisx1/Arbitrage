import { IExchangePrivateClient, IExchangePublicClient } from "../bybit/type";
import { Exchanges } from "../pairsEnum";

export interface ExchangeConfig {
  wsUrl: string;
  wsTradeUrl: string;
  apiKey: string;
  apiSecret: string;
}
export interface PriceData {
  bestBuy: number | null;
  bestSell: number | null;
}
export interface Config<T> {
  binance: T;
  bybit: T;
  okx: T;
  mexc: T;
  bingx: T;
}
export type Time = number | string;

export type ExchangeClientMap = {
  [Exchanges.BYBIT]: {
    public: IExchangePublicClient;
    private: IExchangePrivateClient;
  };
};
