import { Config } from "../config/types";
import { PriceDataFirst } from "../utils/util";
import { managerArbitrage, ManagerArbitrage } from "./managerArbitrage";
import { routeArbitrage } from "./routeArbitrage";
export interface ArbitrageOpportunity {
  bestBuy: {
    exchange: string;
    price: number;
    volume: number;
    symbol: string;
  };
  bestSell: {
    exchange: string;
    price: number;
    volume: number;
    symbol: string;
  };
  priceDiff: number;
  profitPercent: number;
}
export function findBestArbitrageOpportunity(
  priceStore: Config<PriceDataFirst>,
  thresholdPercent: number
): ArbitrageOpportunity | null {
  const exchanges = Object.keys(priceStore);
  let bestBuyExchange = "";
  let bestSellExchange = "";
  let bestPriceDiff = 0;
  let bestPercentDiff = 0;
  // const MIN_VOLUME = 3;

  for (let i = 0; i < exchanges.length; i++) {
    for (let j = 0; j < exchanges.length; j++) {
      if (i === j) continue;

      const buyEx = exchanges[i];
      const sellEx = exchanges[j];

      const buyPrice = Number(
        priceStore[buyEx as keyof Config<PriceDataFirst>]!.bestSell?.price
      );
      const sellPrice = Number(
        priceStore[sellEx as keyof Config<PriceDataFirst>]!.bestBuy?.price
      );

      if (!buyPrice || !sellPrice) continue;

      const priceDiff = sellPrice - buyPrice;
      const percentDiff = (priceDiff / buyPrice) * 100;

      if (
        percentDiff > thresholdPercent &&
        percentDiff > bestPercentDiff &&
        priceStore[buyEx as keyof Config<PriceDataFirst>]!.bestSell!.volume &&
        priceStore[sellEx as keyof Config<PriceDataFirst>]!.bestBuy!.volume
      ) {
        bestBuyExchange = buyEx;
        bestSellExchange = sellEx;
        bestPriceDiff = priceDiff;
        bestPercentDiff = percentDiff;
      }
    }
  }

  if (bestBuyExchange && bestSellExchange) {
    return {
      bestBuy: {
        exchange: bestBuyExchange,
        price:
          priceStore[bestBuyExchange as keyof Config<PriceDataFirst>]!.bestSell!
            .price,
        volume:
          priceStore[bestBuyExchange as keyof Config<PriceDataFirst>]!.bestSell!
            .volume,
        symbol:
          priceStore[bestBuyExchange as keyof Config<PriceDataFirst>]!.bestSell!
            .symbol,
      },
      bestSell: {
        exchange: bestSellExchange,
        price:
          priceStore[bestSellExchange as keyof Config<PriceDataFirst>]!.bestBuy!
            .price,
        volume:
          priceStore[bestSellExchange as keyof Config<PriceDataFirst>]!.bestBuy!
            .volume,
        symbol:
          priceStore[bestSellExchange as keyof Config<PriceDataFirst>]!.bestBuy!
            .symbol,
      },
      priceDiff: bestPriceDiff,
      profitPercent: bestPercentDiff,
    };
  }

  return null; // явный null, если арбитраж не найден
}
