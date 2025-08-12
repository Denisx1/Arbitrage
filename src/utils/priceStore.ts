import { Config, PriceData } from "../config/types";
import { findBestArbitrageOpportunity } from "../arbitrage/service";

export const lastPriceStore: Config<PriceData> = {
  binance: {
    bestBuy: null,
    bestSell: null,
  },
  bybit: {
    bestBuy: null,
    bestSell: null,
  },
  okx: {
    bestBuy: null,
    bestSell: null,
  },
  mexc: {
    bestBuy: null,
    bestSell: null,
  },
  bingx: {
    bestBuy: null,
    bestSell: null,
  },
};

export function updatePriceStore(
  exchange: string,
  bestBuy: number,
  bestSell: number
) {

  lastPriceStore[exchange as keyof Config<PriceData>] = { bestBuy, bestSell };
  const allConnected = Object.values(lastPriceStore).every(
    (item) => item.bestBuy !== null && item.bestSell !== null
  );
  if (!allConnected) {
    console.log(
      `Waiting for all exchanges to send data. Missing data from: ${Object.entries(
        lastPriceStore
      )
        .filter(([_, data]) => data.bestBuy === null || data.bestSell === null)
        .map(([key]) => key)
        .join(", ")}`
    );
    return;
  }
  const bestArbitrageOpportunity = findBestArbitrageOpportunity(lastPriceStore);
  if (bestArbitrageOpportunity) {
    console.log("Best arbitrage opportunity found:", bestArbitrageOpportunity);
  }
}
