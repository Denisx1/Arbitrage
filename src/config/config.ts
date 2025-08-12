import { Config, ExchangeConfig } from "./types";
import { Exchanges } from "../pairsEnum";
import { BybitWsClient } from "../bybit/service";
import { ExchngeClient } from "../types";
import { BinanceWsClient } from "../binance/service";
import { BingxWsClient } from "../bingx/service";
import { MexcWsClient } from "../mexc/service";
import { OkxWsClient } from "../okx/service";

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
  build(exchengeName: Exchanges, symbol: string): ExchngeClient {
    switch (exchengeName) {
      case Exchanges.BYBIT:
        return new BybitWsClient(this.config.bybit!, symbol);
      case Exchanges.BINANCE:
        return new BinanceWsClient(this.config.binance!, symbol);
      case Exchanges.BINGX:
        return new BingxWsClient(this.config.bingx!, symbol);
      case Exchanges.MEXC:
        return new MexcWsClient(this.config.mexc!, symbol);
      case Exchanges.OKX:
        return new OkxWsClient(this.config.okx!, symbol);
      default:
        throw new Error("Invalid exchange name");
    }
  }
}
