import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { Exchanges, Pairs } from "./pairsEnum";
import { ExchangeBuilder, ExchangesReturn } from "./config/config";
import { ExchangesConfig } from "./types";
import { BybitPrivateWsClient } from "./bybit/bybitPrivateClient";
import {
  IExchangeAuth,
  IExchangePrivateClient,
  IExchangePublicClient,
} from "./bybit/type";

async function main(symbol: string): Promise<void> {
  const { binanceClient } = publicClients(symbol);
  const { binanceClient: binancePrivateClient } = await privateClients(symbol);

  await Promise.all([binancePrivateClient.checkSession()]);
  // await Promise.all([
  //   // byBitPrivateClient.connectPrivate(),

  //   binanceClient.connectPublic(),

  //   // byBitClient.connectPublic(),
  //   // binanceClient.connectPublic(),
  //   // bingxClient.connectPublic(),
  //   // okxClient.connectPublic(),
  //   // mexcClient.connectPublic(),
  // ]);
}

main(Pairs.SOLUSDT);
async function privateClients(
  symbol: string
): Promise<ExchangesReturn<IExchangeAuth>> {
  const builder = new ExchangeBuilder().setBinanceConfig(
    ExchangesConfig[Exchanges.BINANCE]
  );
  return {
    binanceClient: (await builder.buildPrivate(Exchanges.BINANCE))
      .binanceClient!,
  };
}
function publicClients(symbol: string): ExchangesReturn<IExchangePublicClient> {
  const builder = new ExchangeBuilder().setBinanceConfig(
    ExchangesConfig[Exchanges.BINANCE]
  );
  // .setBingxConfig(ExchangesConfig[Exchanges.BINGX])
  // .setOkxConfig(ExchangesConfig[Exchanges.OKX])
  // .setMexcConfig(ExchangesConfig[Exchanges.MEXC]);

  return {
    // byBitClient: builder.buildPublick(Exchanges.BYBIT, symbol).byBitClient!,
    binanceClient: builder.buildPublick(Exchanges.BINANCE, symbol)
      .binanceClient!,
    // bingxClient: builder.buildPublick(Exchanges.BINGX, symbol).bingxClient!,
    // okxClient: builder.buildPublick(Exchanges.OKX, symbol).okxClient!,
    // mexcClient: builder.buildPublick(Exchanges.MEXC, symbol).mexcClient!,
  };
}
