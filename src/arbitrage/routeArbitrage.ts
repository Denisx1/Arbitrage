import { getPrivateClients } from "../clients";
import {
  BinancePrivateWsClient,
  Direction,
} from "../exchanges/binance/private/privateClient";
import { BingXPrivateClient } from "../exchanges/bingx/private";
import { BybitPrivateWsClient } from "../exchanges/bybit/bybitPrivateClient";
import { DeribitPrivateWsClient } from "../exchanges/deribit/private";
import { HTXPrivateWsClient } from "../exchanges/HTX/private";
import { MexcPrivateWsClient } from "../exchanges/mexc/private";
import { OkxPrivateWsClient } from "../exchanges/okx/private";
import { Exchanges } from "../pairsEnum";
import { IExchangePrivateClient } from "../types";

import { ArbitrageOpportunity } from "./service";

let cashedPrivateClient: Record<Exchanges, IExchangePrivateClient> = {} as any;
export async function initOrderClients() {
  const privateClients = await getPrivateClients();
  cashedPrivateClient = {
    [Exchanges.BINANCE]: new BinancePrivateWsClient(
      privateClients.binanceClient!
    ),
    [Exchanges.BYBIT]: new BybitPrivateWsClient(privateClients.byBitClient!),
    [Exchanges.OKX]: new OkxPrivateWsClient(privateClients.okxClient!),
    [Exchanges.DERIBIT]: new DeribitPrivateWsClient(
      privateClients.deribitClient!
    ),
    [Exchanges.HTX]: new HTXPrivateWsClient(privateClients.htxClient!),
    [Exchanges.MEXC]: new MexcPrivateWsClient(privateClients.mexcClient!),
    [Exchanges.BINGX]: new BingXPrivateClient(privateClients.bingxClient!),
  };
}

export async function routeArbitrage(opportunity: ArbitrageOpportunity) {
  await initOrderClients();
  const buyClient =
    cashedPrivateClient[
      opportunity.bestBuy.exchange as keyof Record<
        Exchanges,
        IExchangePrivateClient
      >
    ];
  const sellClient =
    cashedPrivateClient[
      opportunity.bestSell.exchange as keyof Record<
        Exchanges,
        IExchangePrivateClient
      >
    ];

  await Promise.all([
    buyClient.placeOrder(opportunity, Direction.BUY),
    sellClient.placeOrder(opportunity, Direction.SELL),
  ]);
}
