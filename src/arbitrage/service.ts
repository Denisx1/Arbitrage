import { Config, PriceData } from "../config/types";
export interface ArbitrageOpportunity {
  bestBuy: {
    exchange: string;
    price: number;
  };
  bestSell: {
    exchange: string;
    price: number;
  };
  priceDiff: number;
  profitPercent: number;
}
export function findBestArbitrageOpportunity(
  priceStore: Config<PriceData>,
  thresholdPercent: number = 4
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

      const buyPrice = priceStore[buyEx as keyof Config<PriceData>]!.bestSell;
      const sellPrice = priceStore[sellEx as keyof Config<PriceData>]!.bestBuy;

      if (buyPrice == null || sellPrice == null) continue; // Пропускаем если нет данных

      const priceDiff = sellPrice - buyPrice;
      const avgPrice = (sellPrice + buyPrice) / 2;
      const percentDiff = (priceDiff / avgPrice) * 100;

      // Сохраняем только, если процент больше порога и лучше текущего максимума
      if (percentDiff > thresholdPercent && percentDiff > bestPercentDiff) {
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
          priceStore[bestBuyExchange as keyof Config<PriceData>]!.bestSell!,
      },
      bestSell: {
        exchange: bestSellExchange,
        price:
          priceStore[bestSellExchange as keyof Config<PriceData>]!.bestBuy!,
      },
      priceDiff: bestPriceDiff,
      profitPercent: bestPercentDiff,
    };
  }

  return undefined;
}
