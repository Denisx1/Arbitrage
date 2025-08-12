import { Config, ExchangeConfig } from "./types";

export const config: Config<ExchangeConfig> = {
  binance: {
    wsUrl: process.env.BINANCE_WEB_SOCKET!,
  },
  bybit: {
    wsUrl: process.env.BYBIT_WEB_SOCKET!,
  },
  okx: {
    wsUrl: process.env.OKX_WEB_SOCKET!,
  },
  mexc: {
    wsUrl: process.env.MEXC_WEB_SOCKET!,
  },
  bingx: {
    wsUrl: process.env.BINGX_WEB_SOCKET!,
  },
};
