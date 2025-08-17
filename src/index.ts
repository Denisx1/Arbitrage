import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { Exchanges, Pairs } from "./pairsEnum";

import { ExchangesConfig } from "./types";
import { IExchangeAuth, IExchangePublicClient } from "./bybit/type";
import { ExchangesReturn } from "./config/types";
import { ExchangeBuilder } from "./config/config";

async function main(symbol: string): Promise<void> {
  const {
    binanceClient,
    byBitClient,
    okxClient,
    bingxClient,
    mexcClient,
    htxClient,
    deribitClient,
  } = publicClients(symbol);
  // const {
  //   binanceClient: binancePrivateClient,
  //   byBitClient: byBitPrivateClient,
  //   okxClient: okxPrivateClient,
  // } = await privateClients();
  // await Promise.all([
  //   binancePrivateClient.login(),
  //   byBitPrivateClient.login(),
  //   okxPrivateClient.login(),
  // ]);

  await Promise.all([
    byBitClient.subscribeOrderBook(),
    binanceClient.subscribeOrderBook(),
    bingxClient?.subscribeOrderBook(),
    mexcClient?.subscribeOrderBook(),
    okxClient.subscribeOrderBook(),
    htxClient?.subscribeOrderBook(),
    deribitClient?.subscribeOrderBook(),
  ]);
}

main(Pairs.ADAUSDT);

async function privateClients(): Promise<ExchangesReturn<IExchangeAuth>> {
  const builder = new ExchangeBuilder()
    .setBinanceConfig(ExchangesConfig[Exchanges.BINANCE])
    .setBybitConfig(ExchangesConfig[Exchanges.BYBIT])
    .setOkxConfig(ExchangesConfig[Exchanges.OKX]);
  return {
    binanceClient: (await builder.buildPrivate(Exchanges.BINANCE))
      .binanceClient!,
    byBitClient: (await builder.buildPrivate(Exchanges.BYBIT)).byBitClient!,
    okxClient: (await builder.buildPrivate(Exchanges.OKX)).okxClient!,
  };
}
function publicClients(symbol: string): ExchangesReturn<IExchangePublicClient> {
  const builder = new ExchangeBuilder()
    .setBinanceConfig(ExchangesConfig[Exchanges.BINANCE])
    .setBybitConfig(ExchangesConfig[Exchanges.BYBIT])
    .setBingxConfig(ExchangesConfig[Exchanges.BINGX])
    .setMexcConfig(ExchangesConfig[Exchanges.MEXC])
    .setOkxConfig(ExchangesConfig[Exchanges.OKX])
    .setHTXConfig(ExchangesConfig[Exchanges.HTX])
    .setDeribitConfig(ExchangesConfig[Exchanges.DERIBIT]);
  return {
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
}
