import {
  BingXRequestPublicParams,
  BybitRequestPublicParams,
  Config,
  ExchangeConfig,
  ExchangesReturn,
  MexcRequestPublicParams,
  OkxRequestPublicParams,
} from "./types";
import { Exchanges } from "../pairsEnum";
import { IExchangeAuth, IExchangePublicClient } from "../bybit/type";
import { PublicBinanceWsClient } from "../binance/publicData/publickClient";
import { BinanceAuth } from "../binance/private/BinanceAuth";
import { WebSocketConector } from "../socketConnector/WebSocketConector";
import { ByBitAuth } from "../bybit/bybitAuth";
import { BybitPublickWsClient } from "../bybit/bybitPublickClient";
import { ExchangesConfig } from "../types";
import { BingXPublickWsClient } from "../bingx/public";
import { MexcPublickWsClient } from "../mexc/public";
import { OkxPublickWsClient } from "../okx/public";
import { AuthOkx } from "../okx/authOkx";
import { HTXWsPublicClient } from "../HTX/public";
import { DeribitPublicWs } from "../deribit/public";

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
          this.config.bybit!.wsTradeUrl
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
    const bingxSymbol: string = symbol.replace("USDT", "-USDT");
    const mexcSymbol: string = symbol.replace("USDT", "_USDT");
    const deribitSymbol: string = symbol.replace("USDT", "_USDC-PERPETUAL");
    switch (exchangeName) {
      case Exchanges.BYBIT: {
        const byBitConnector = new WebSocketConector(this.config.bybit!.wsUrl);
        byBitConnector.connectWebSocket<BybitRequestPublicParams>({
          op: "subscribe",
          args: [`orderbook.500.${symbol}`],
        });
        return {
          byBitClient: new BybitPublickWsClient(byBitConnector),
        };
      }
      case Exchanges.BINANCE: {
        const binanceConnector = new WebSocketConector(binanceWsUrl);
        binanceConnector.connectWebSocket();
        return {
          binanceClient: new PublicBinanceWsClient(binanceConnector),
        };
      }
      case Exchanges.BINGX: {
        const bingXConnector = new WebSocketConector(this.config.bingx!.wsUrl);
        bingXConnector.connectWebSocket<BingXRequestPublicParams>({
          id: "e745cd6d-d0f6-4a70-8d5a-043e4c741b40",
          reqType: "sub",
          dataType: `${bingxSymbol}@depth5@500ms`,
        });
        return {
          bingxClient: new BingXPublickWsClient(bingXConnector),
        };
      }
      case Exchanges.MEXC: {
        const mexcConnector = new WebSocketConector(this.config.mexc!.wsUrl);
        mexcConnector.connectWebSocket<MexcRequestPublicParams>({
          method: "sub.depth",
          param: {
            symbol: `${mexcSymbol}`,
          },
        });

        return {
          mexcClient: new MexcPublickWsClient(mexcConnector),
        };
      }
      case Exchanges.OKX: {
        const okxConnector = new WebSocketConector(this.config.okx!.wsUrl);
        okxConnector.connectWebSocket<OkxRequestPublicParams>({
          op: "subscribe",
          args: [
            {
              channel: "books5",
              instId: bingxSymbol,
            },
          ],
        });
        return {
          okxClient: new OkxPublickWsClient(okxConnector),
        };
      }
      case Exchanges.HTX: {
        const htxConnector = new WebSocketConector(this.config.htx!.wsUrl);
        htxConnector.connectWebSocket({
          sub: `market.${bingxSymbol}.depth.step0`,
          id: "id5",
        });
        return {
          htxClient: new HTXWsPublicClient(htxConnector),
        };
      }
      case Exchanges.DERIBIT: {
        const deribitConnector = new WebSocketConector(
          this.config.deribit!.wsUrl
        );
        deribitConnector.connectWebSocket({
          method: "/public/subscribe",
          params: {
            channels: [`book.${deribitSymbol}.100ms`],
          },
          
        });
        return {
          deribitClient: new DeribitPublicWs(deribitConnector),
        };
      }
      default:
        throw new Error("Invalid exchange name");
    }
  }
}
