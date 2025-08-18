import { Config } from "../config/types";
import { findBestArbitrageOpportunity } from "../arbitrage/service";
import { PriceDataFirst } from "./util";

export const lastPriceStore: Config<PriceDataFirst> = {
  binance: {
    bestSell: {
      price: 0,
      volume: 0,
    },
    bestBuy: {
      price: 0,
      volume: 0,
    },
  },
  bybit: {
    bestSell: {
      price: 0,
      volume: 0,
    },
    bestBuy: {
      price: 0,
      volume: 0,
    },
  },
  okx: {
    bestBuy: {
      price: 0,
      volume: 0,
    },
    bestSell: {
      price: 0,
      volume: 0,
    },
  },
  mexc: {
    bestBuy: {
      price: 0,
      volume: 0,
    },
    bestSell: {
      price: 0,
      volume: 0,
    },
  },
  bingx: {
    bestBuy: {
      price: 0,
      volume: 0,
    },
    bestSell: {
      price: 0,
      volume: 0,
    },
  },
  htx: {
    bestBuy: {
      price: 0,
      volume: 0,
    },
    bestSell: {
      price: 0,
      volume: 0,
    },
  },
  deribit: {
    bestBuy: {
      price: 0,
      volume: 0,
    },
    bestSell: {
      price: 0,
      volume: 0,
    },
  },
};

export function updatePriceStore(
  exchange: string,
  bestBuy: PriceDataFirst["bestBuy"],
  bestSell: PriceDataFirst["bestSell"]
) {
  lastPriceStore[exchange as keyof Config<PriceDataFirst>] = {
    bestBuy,
    bestSell,
  };

  const allConnected = Object.values(lastPriceStore).every(
    (item) => item.bestBuy.price !== 0 && item.bestSell.price !== 0
  );

  const missingData = Object.entries(lastPriceStore).reduce<string[]>(
    (acc, [key, data]) => {
      if (data.bestBuy.price === 0 || data.bestSell.price === 0) {
        acc.push(key);
      }
      return acc;
    },
    []
  );

  if (!allConnected) {
    console.log(
      `Waiting for all exchanges to send data. Missing data from: ${missingData.join(
        ", "
      )}`
    );
    return;
  }

  const bestArbitrageOpportunity = findBestArbitrageOpportunity(lastPriceStore);
  if (bestArbitrageOpportunity) {
    console.log("Best arbitrage opportunity found:", bestArbitrageOpportunity);
  }
}
