import { ArbitrageOpportunity } from "./arbitrage/service";
import { ExchangeConfig } from "./config/types";
import { Direction } from "./exchanges/binance/private/privateClient";
import { Exchanges } from "./pairsEnum";
export interface IExchangePrivateClient {
  placeOrder(opportunity: ArbitrageOpportunity, direction: Direction): void;
}

export const ExchangesConfig: Record<Exchanges, ExchangeConfig> = {
  [Exchanges.BINGX]: {
    wsUrl: process.env.BINGX_WEB_SOCKET!,
    wsTradeUrl: process.env.BINGX_TRADE_WEB_SOCKET!,
    apiKey: process.env.BINGX_API_KEY!,
    apiSecret: process.env.BINGX_API_SECRET!,
  },
  [Exchanges.BINANCE]: {
    wsUrl: process.env.BINANCE_WEB_SOCKET!,
    wsTradeUrl: process.env.BINANCE_TRADE_WEB_SOCKET!,
    apiKey: process.env.BINANCE_API_KEY!,
    apiSecret: process.env.BINANCE_API_SECRET!,
  },
  [Exchanges.BYBIT]: {
    wsUrl: process.env.BYBIT_WEB_SOCKET!,
    wsTradeUrl: process.env.BYBIT_TRADE_WEB_SOCKET!,
    apiKey: process.env.BYBIT_API_KEY!,
    apiSecret: process.env.BYBIT_API_SECRET!,
  },
  [Exchanges.OKX]: {
    wsUrl: process.env.OKX_WEB_SOCKET!,
    wsTradeUrl: process.env.OKX_TRADE_WEB_SOCKET!,
    apiKey: process.env.OKX_API_KEY!,
    apiSecret: process.env.OKX_API_SECRET!,
  },
  [Exchanges.MEXC]: {
    wsUrl: process.env.MEXC_WEB_SOCKET!,
    wsTradeUrl: process.env.MEXC_WEB_SOCKET_TRADE!,
    apiKey: process.env.MEXC_API_KEY!,
    apiSecret: process.env.MEXC_API_SECRET!,
  },
  [Exchanges.HTX]: {
    wsUrl: process.env.HTX_WEB_SOCKET!,
    wsTradeUrl: process.env.HTX_WEB_SOCKET_TRADE!,
    apiKey: process.env.HTX_API_KEY!,
    apiSecret: process.env.HTX_API_SECRET!,
  },
  [Exchanges.DERIBIT]: {
    wsUrl: process.env.DERIBIT_WEB_SOCKET!,
    wsTradeUrl: process.env.DERIBIT_TRADE_WEB_SOCKET!,
    apiKey: process.env.DERIBIT_API_KEY!,
    apiSecret: process.env.DERIBIT_API_SECRET!,
  },
};
