import { Config } from "../config/types";
import {
  ArbitrageOpportunity,
  findBestArbitrageOpportunity,
} from "../arbitrage/service";
import { PriceDataFirst } from "./util";
import { managerArbitrage } from "../arbitrage/managerArbitrage";
// import { routeArbitrage } from "../arbitrage/routeArbitrage";

export const lastPriceStore: Config<PriceDataFirst> = {
  binance: {
    bestSell: {
      price: 0,
      volume: 0,
      symbol: "",
    },
    bestBuy: {
      price: 0,
      volume: 0,
      symbol: "",
    },
  },
  byBit: {
    bestSell: {
      price: 0,
      volume: 0,
      symbol: "",
    },
    bestBuy: {
      price: 0,
      volume: 0,
      symbol: "",
    },
  },
  okx: {
    bestBuy: {
      price: 0,
      volume: 0,
      symbol: "",
    },
    bestSell: {
      price: 0,
      volume: 0,
      symbol: "",
    },
  },
  mexc: {
    bestBuy: {
      price: 0,
      volume: 0,
      symbol: "",
    },
    bestSell: {
      price: 0,
      volume: 0,
      symbol: "",
    },
  },
  bingx: {
    bestBuy: {
      price: 0,
      volume: 0,
      symbol: "",
    },
    bestSell: {
      price: 0,
      volume: 0,
      symbol: "",
    },
  },
  htx: {
    bestBuy: {
      price: 0,
      volume: 0,
      symbol: "",
    },
    bestSell: {
      price: 0,
      volume: 0,
      symbol: "",
    },
  },
  deribit: {
    bestBuy: {
      price: 0,
      volume: 0,
      symbol: "",
    },
    bestSell: {
      price: 0,
      volume: 0,
      symbol: "",
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

  const bestArbitrageOpportunity = findBestArbitrageOpportunity(
    lastPriceStore,
    1
  );
  if (bestArbitrageOpportunity) {
    // if (
    //   bestArbitrageOpportunity.bestBuy.exchange === "okx" ||
    //   bestArbitrageOpportunity.bestSell.exchange === "okx"
    // ) {
    console.log(
      "🚀 ~ updatePriceStore ~ bestArbitrageOpportunity:",
      bestArbitrageOpportunity
    );
    // managerArbitrage.runArbitrage(bestArbitrageOpportunity);
    // }
  }
}
