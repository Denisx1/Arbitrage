import { Config, ExchangeConfig, ExchangesReturn } from "./types";
import { Exchanges } from "../pairsEnum";
import { IExchangeAuth, IExchangePublicClient } from "../exchanges/bybit/type";
import { PublicBinanceWsClient } from "../exchanges/binance/publicData/publickClient";
import { BinanceAuth } from "../exchanges/binance/private/BinanceAuth";
import { WebSocketConector } from "../socketConnector/WebSocketConector";
import { ByBitAuth } from "../exchanges/bybit/bybitAuth";
import { BybitPublickWsClient } from "../exchanges/bybit/bybitPublickClient";
import { BingXPublickWsClient } from "../exchanges/bingx/public";
import { MexcPublickWsClient } from "../exchanges/mexc/public";

import { HTXWsPublicClient } from "../exchanges/HTX/public";
import { DeribitPublicWs } from "../exchanges/deribit/public";
import { AuthDeribitWs } from "../exchanges/deribit/auth";
import { HTXAuth } from "../exchanges/HTX/auth";
import { MexcAuth } from "../exchanges/mexc/auth";
import { BingXAuth } from "../exchanges/bingx/auth";
import { HandleListenKey } from "../exchanges/bingx/handleListenKey";
import { AuthOkx } from "../exchanges/okx/authOkx";
import { OkxPublickWsClient } from "../exchanges/okx/public";
import { ListenKey } from "../exchanges/binance/private/listenKey";
import fs from "fs";

export class ExchangeBuilder {
  private config: Partial<Config<ExchangeConfig>> = {};

  setBybitConfig(config: ExchangeConfig) {
    this.config.byBit = config;
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
  setHTXConfig(config: ExchangeConfig) {
    this.config.htx = config;
    return this;
  }
  setDeribitConfig(config: ExchangeConfig) {
    this.config.deribit = config;
    return this;
  }
  async buildPrivate(
    exchangeName: Exchanges
  ): Promise<Partial<ExchangesReturn<IExchangeAuth>>> {
    switch (exchangeName) {
      case Exchanges.BYBIT:
        const byBitConnector = new WebSocketConector(
          this.config.byBit!.wsTradeUrl
        );
        await byBitConnector.connectWebSocket();
        const authByBit = new ByBitAuth(byBitConnector);
        return {
          byBitClient: authByBit,
        };
      case Exchanges.BINANCE:
        const binanceConnector = new WebSocketConector(
          this.config.binance!.wsTradeUrl
        );

        await binanceConnector.connectWebSocket(); // открываем приватный сокет
        const auth = new BinanceAuth(binanceConnector);

        return {
          binanceClient: auth,
        };
      case Exchanges.OKX: {
        const okxConnector = new WebSocketConector(this.config.okx!.wsTradeUrl);

        await okxConnector.connectWebSocket();

        const authOkx = new AuthOkx(okxConnector);
        return {
          okxClient: authOkx,
        };
      }
      case Exchanges.DERIBIT: {
        const deribitConnector = new WebSocketConector(
          this.config.deribit!.wsUrl
        );
        await deribitConnector.connectWebSocket();
        const authDeribit = new AuthDeribitWs(deribitConnector);
        return {
          deribitClient: authDeribit,
        };
      }
      case Exchanges.HTX: {
        const htxConnector = new WebSocketConector(this.config.htx!.wsTradeUrl);
        await htxConnector.connectWebSocket();
        const authHTX = new HTXAuth(htxConnector);
        return {
          htxClient: authHTX,
        };
      }
      case Exchanges.MEXC: {
        const mexcConnector = new WebSocketConector(this.config.mexc!.wsUrl);
        await mexcConnector.connectWebSocket();
        const authMexc = new MexcAuth(mexcConnector);
        return {
          mexcClient: authMexc,
        };
      }
      case Exchanges.BINGX: {
        const authBingX = new BingXAuth();

        return {
          bingxClient: authBingX,
        };
      }
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
      case Exchanges.BYBIT: {
        const byBitConnector = new WebSocketConector(this.config.byBit!.wsUrl);
        const byBitClient = new BybitPublickWsClient(byBitConnector, symbol);
        return {
          byBitClient,
        };
      }
      case Exchanges.BINANCE: {
        const binanceConnector = new WebSocketConector(binanceWsUrl);
        const binanceClient = new PublicBinanceWsClient(binanceConnector);

        return {
          binanceClient,
        };
      }
      case Exchanges.BINGX: {
        const bingXConnector = new WebSocketConector(this.config.bingx!.wsUrl);
        const bingxClient = new BingXPublickWsClient(bingXConnector, symbol);

        return {
          bingxClient,
        };
      }
      case Exchanges.MEXC: {
        const mexcConnector = new WebSocketConector(this.config.mexc!.wsUrl);

        const mexcClient = new MexcPublickWsClient(mexcConnector, symbol);

        return {
          mexcClient,
        };
      }
      case Exchanges.OKX: {
        const okxConnector = new WebSocketConector(this.config.okx!.wsUrl);
        const okxClient = new OkxPublickWsClient(okxConnector, symbol);

        return {
          okxClient,
        };
      }
      case Exchanges.HTX: {
        const htxConnector = new WebSocketConector(this.config.htx!.wsUrl);
        const htxClient = new HTXWsPublicClient(htxConnector, symbol);
        return {
          htxClient,
        };
      }
      case Exchanges.DERIBIT: {
        const deribitConnector = new WebSocketConector(
          this.config.deribit!.wsUrl
        );
        const deribitClient = new DeribitPublicWs(deribitConnector, symbol);
        return {
          deribitClient,
        };
      }
      default:
        throw new Error("Invalid exchange name");
    }
  }
}
