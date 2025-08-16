import { Config, ExchangeClientMap, ExchangeConfig } from "./types";
import { Exchanges } from "../pairsEnum";
import { ExchngeClient } from "../types";
import { BingxWsClient } from "../bingx/service";
import { MexcWsClient } from "../mexc/service";
import { OkxWsClient } from "../okx/service";
import { BybitPublickWsClient } from "../bybit/bybitPublickClient";
import { BybitPrivateWsClient } from "../bybit/bybitPrivateClient";
import {
  IExchangeAuth,
  IExchangePrivateClient,
  IExchangePublicClient,
} from "../bybit/type";
import { PublicBinanceWsClient } from "../binance/publicData/publickClient";
import { BinanceWebSocketConnector } from "../binance/BinanceWsService";
import { BinanceAuth } from "../binance/private/BinanceAuth";
export interface ExchangesReturn<T> {
  // byBitClient: T;
  binanceClient: T;
  // bingxClient: T;
  // okxClient: T;
  // mexcClient: T;
}
export class ExchangeBuilder {
  private config: Partial<Config<ExchangeConfig>> = {};

  setBybitConfig(config: ExchangeConfig) {
    this.config.bybit = config;
    return this;
  }
  setBinanceConfig(config: ExchangeConfig) {
    this.config.binance = config;
    return this;
  }
  setOkxConfig(config: ExchangeConfig) {
    this.config.okx = config;
    return this;
  }
  setMexcConfig(config: ExchangeConfig) {
    this.config.mexc = config;
    return this;
  }
  setBingxConfig(config: ExchangeConfig) {
    this.config.bingx = config;
    return this;
  }
  async buildPrivate(
    exchangeName: Exchanges,
  ): Promise<Partial<ExchangesReturn<IExchangeAuth>>> {
    switch (exchangeName) {
      case Exchanges.BYBIT:
      // return {
      //   byBitClient: new BybitPrivateWsClient(this.config.bybit!, symbol),
      // };
      case Exchanges.BINANCE:
        const binanceConnector = new BinanceWebSocketConnector(
          this.config.binance!.wsTradeUrl
        );

        await binanceConnector.connect(); // открываем приватный сокет
        const auth = new BinanceAuth(binanceConnector);
        return {
          binanceClient: auth,
        };
      default:
        throw new Error("Invalid exchange name");
    }
  }
  buildPublick(
    exchangeName: Exchanges,
    symbol: string
  ): Partial<ExchangesReturn<IExchangePublicClient>> {
    const binanceWsUrl = this.config.binance!.wsUrl.replace(
      "%SYMBOL%",
      symbol.toLowerCase()
    );
    switch (exchangeName) {
      case Exchanges.BYBIT:
      // return {
      //   byBitClient: new BybitPublickWsClient(this.config.bybit!, symbol),
      // };

      case Exchanges.BINANCE: {
        // создаём коннектор с нужной ссылкой
        const binanceConnector = new BinanceWebSocketConnector(binanceWsUrl);
        binanceConnector.connect(); // сразу подключаемся

        return {
          binanceClient: new PublicBinanceWsClient(binanceConnector),
        };
      }
      default:
        throw new Error("Invalid exchange name");
    }
  }
}
