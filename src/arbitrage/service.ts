import { Config } from "../config/types";
import { PriceDataFirst } from "../utils/util";
export interface ArbitrageOpportunity {
  bestBuy: {
    exchange: string;
    price: number;
    volume: number;
  };
  bestSell: {
    exchange: string;
    price: number;
    volume: number;
  };
  priceDiff: number;
  profitPercent: number;
}
export function findBestArbitrageOpportunity(
  priceStore: Config<PriceDataFirst>,
  thresholdPercent: number = 1
): ArbitrageOpportunity | undefined {
  const exchanges = Object.keys(priceStore);
  let bestBuyExchange = "";
  let bestSellExchange = "";
  let bestPriceDiff = 0;
  let bestPercentDiff = 0;

  for (let i = 0; i < exchanges.length; i++) {
    for (let j = 0; j < exchanges.length; j++) {
      if (i === j) continue;

      const buyEx = exchanges[i];
      const sellEx = exchanges[j];

      const buyPrice = Number(
        priceStore[buyEx as keyof Config<PriceDataFirst>]!.bestSell.price
      );
      const sellPrice = Number(
        priceStore[sellEx as keyof Config<PriceDataFirst>]!.bestBuy.price
      );

      if (buyPrice == null || sellPrice == null) continue; // Пропускаем если нет данных

      const priceDiff = sellPrice - buyPrice;
      const avgPrice = (sellPrice + buyPrice) / 2;
      const percentDiff = (priceDiff / avgPrice) * 100;

      // Сохраняем только, если процент больше порога и лучше текущего максимума
      if (percentDiff > thresholdPercent && percentDiff > bestPercentDiff) {
        if (
          priceStore[buyEx as keyof Config<PriceDataFirst>]!.bestSell.volume >
            3 &&
          priceStore[sellEx as keyof Config<PriceDataFirst>]!.bestBuy.volume >
            3
        ) {
          bestBuyExchange = buyEx;
          bestSellExchange = sellEx;
          bestPriceDiff = priceDiff;
          bestPercentDiff = percentDiff;
        }
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
      },
      bestSell: {
        exchange: bestSellExchange,
        price:
          priceStore[bestSellExchange as keyof Config<PriceDataFirst>]!.bestBuy!
            .price,
        volume:
          priceStore[bestSellExchange as keyof Config<PriceDataFirst>]!.bestBuy!
            .volume,
      },
      priceDiff: bestPriceDiff,
      profitPercent: bestPercentDiff,
    };
  }

  return undefined;
}
