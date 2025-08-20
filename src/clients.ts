import { IExchangeAuth, IExchangePublicClient } from "./exchanges/bybit/type";
import { ExchangesReturn } from "./config/types";
import { ExchangeBuilder } from "./config/config";
import { ExchangesConfig } from "./types";
import { Exchanges } from "./pairsEnum";

let privateClientsCache: ExchangesReturn<IExchangeAuth> | null = null;
let publicClientsCache: ExchangesReturn<IExchangePublicClient> | null = null;
export async function initPrivateClients(): Promise<
  ExchangesReturn<IExchangeAuth>
> {
  if (privateClientsCache) return privateClientsCache;
  const builder = new ExchangeBuilder()
    .setBinanceConfig(ExchangesConfig[Exchanges.BINANCE])
    .setBybitConfig(ExchangesConfig[Exchanges.BYBIT])
    .setOkxConfig(ExchangesConfig[Exchanges.OKX])
    .setDeribitConfig(ExchangesConfig[Exchanges.DERIBIT])
    .setHTXConfig(ExchangesConfig[Exchanges.HTX])
    .setMexcConfig(ExchangesConfig[Exchanges.MEXC])
    .setBingxConfig(ExchangesConfig[Exchanges.BINGX]);

  privateClientsCache = {
    binanceClient: (await builder.buildPrivate(Exchanges.BINANCE))
      .binanceClient!,
    byBitClient: (await builder.buildPrivate(Exchanges.BYBIT)).byBitClient!,
    okxClient: (await builder.buildPrivate(Exchanges.OKX)).okxClient!,
    deribitClient: (await builder.buildPrivate(Exchanges.DERIBIT))
      .deribitClient!,
    htxClient: (await builder.buildPrivate(Exchanges.HTX)).htxClient!,
    mexcClient: (await builder.buildPrivate(Exchanges.MEXC)).mexcClient!,
    bingxClient: (await builder.buildPrivate(Exchanges.BINGX)).bingxClient!,
  };

  await Promise.all(
    Object.values(privateClientsCache).map((client) => client.login())
  );

  return privateClientsCache;
}

export function getPrivateClients(): ExchangesReturn<IExchangeAuth> {
  if (!privateClientsCache) throw new Error("Private clients not initialized");
  return privateClientsCache;
}

export function initPublicClients(
  symbol: string
): ExchangesReturn<IExchangePublicClient> {
  if (publicClientsCache) return publicClientsCache;

  const builder = new ExchangeBuilder()
    .setBinanceConfig(ExchangesConfig[Exchanges.BINANCE])
    .setBybitConfig(ExchangesConfig[Exchanges.BYBIT])
    .setBingxConfig(ExchangesConfig[Exchanges.BINGX])
    .setMexcConfig(ExchangesConfig[Exchanges.MEXC])
    .setOkxConfig(ExchangesConfig[Exchanges.OKX])
    .setHTXConfig(ExchangesConfig[Exchanges.HTX])
    .setDeribitConfig(ExchangesConfig[Exchanges.DERIBIT]);

  publicClientsCache = {
    byBitClient: builder.buildPublick(Exchanges.BYBIT, symbol).byBitClient!,
    binanceClient: builder.buildPublick(Exchanges.BINANCE, symbol)
      .binanceClient!,
    bingxClient: builder.buildPublick(Exchanges.BINGX, symbol).bingxClient!,
    mexcClient: builder.buildPublick(Exchanges.MEXC, symbol).mexcClient!,
    okxClient: builder.buildPublick(Exchanges.OKX, symbol).okxClient!,
    htxClient: builder.buildPublick(Exchanges.HTX, symbol).htxClient!,
    deribitClient: builder.buildPublick(Exchanges.DERIBIT, symbol)
      .deribitClient!,
  };

  return publicClientsCache;
}
