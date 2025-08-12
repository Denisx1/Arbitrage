import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { Exchanges, Pairs } from "./pairsEnum";
import { ExchangeBuilder } from "./config/config";
import { ExchangesConfig, ExchngeClient } from "./types";

async function main(symbol: string) {
  const { byBitClient, binanceClient, bingxClient, okxClient, mexcClient } =
    highestBuilder(symbol);

  await Promise.all([
    byBitClient.connectPublic(),
    binanceClient.connectPublic(),
    bingxClient.connectPublic(),
    okxClient.connectPublic(),
    mexcClient.connectPublic(),
  ]);
}

main(Pairs.DOGEUSDT);

function highestBuilder(symbol: string): {
  byBitClient: ExchngeClient;
  binanceClient: ExchngeClient;
  bingxClient: ExchngeClient;
  okxClient: ExchngeClient;
  mexcClient: ExchngeClient;
} {
  const builder = new ExchangeBuilder()
    .setBybitConfig(ExchangesConfig[Exchanges.BYBIT])
    .setBinanceConfig(ExchangesConfig[Exchanges.BINANCE])
    .setBingxConfig(ExchangesConfig[Exchanges.BINGX])
    .setOkxConfig(ExchangesConfig[Exchanges.OKX])
    .setMexcConfig(ExchangesConfig[Exchanges.MEXC]);
  return {
    byBitClient: builder.build(Exchanges.BYBIT, symbol),
    binanceClient: builder.build(Exchanges.BINANCE, symbol),
    bingxClient: builder.build(Exchanges.BINGX, symbol),
    okxClient: builder.build(Exchanges.OKX, symbol),
    mexcClient: builder.build(Exchanges.MEXC, symbol),
  };
}
