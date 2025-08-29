export interface PriceDataFirst {
  bestSell: { price: number; volume: number; symbol: string };
  bestBuy: { price: number; volume: number; symbol: string };
}

export function getBestBidAsk(
  asks: string[][],
  bids: string[][],
  symbol: string
): PriceDataFirst {
  if (!bids.length || !asks.length)
    return {
      bestSell: { price: 0, volume: 0, symbol: "" },
      bestBuy: { price: 0, volume: 0, symbol: "" },
    };

  const [bestAskPrice, bestAskVolume] = asks.reduce((best, current) =>
    parseFloat(current[0]) < parseFloat(best[0]) ? current : best
  );

  // Лучшая покупка (bid: максимальная цена)
  const [bestBidPrice, bestBidVolume] = bids.reduce((best, current) =>
    parseFloat(current[0]) > parseFloat(best[0]) ? current : best
  );

  return {
    bestSell: {
      price: parseFloat(bestAskPrice),
      volume: parseFloat(bestAskVolume),
      symbol,
    },
    bestBuy: {
      price: parseFloat(bestBidPrice),
      volume: parseFloat(bestBidVolume),
      symbol,
    },
  };
}
