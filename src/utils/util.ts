export interface PriceDataFirst {
  bestSell: { price: number; volume: number };
  bestBuy: { price: number; volume: number };
}
// export function getBestPrices(asks: string[][], bids: string[][]): PriceData {
//   const bestBid = bids!.length > 0 ? parseFloat(bids[0][0]) : null;
//   const bestAsk = asks!.length > 0 ? parseFloat(asks[0][0]) : null;

//   return {
//     bestAskPrice: bestAsk!,
//     bestBidPrice: bestBid!,
//   };
// }

export function getBestBidAsk(
  asks: string[][],
  bids: string[][]
): PriceDataFirst {
  if (!bids.length || !asks.length)
    return {
      bestSell: { price: 0, volume: 0 },
      bestBuy: { price: 0, volume: 0 },
    };

  const [bestAskPrice, bestAskVolume] = asks.reduce((best, current) =>
    parseFloat(current[0]) < parseFloat(best[0]) ? current : best
  );

  // Лучшая покупка (bid: максимальная цена)
  const [bestBidPrice, bestBidVolume] = bids.reduce((best, current) =>
    parseFloat(current[0]) > parseFloat(best[0]) ? current : best
  );

  return {
    bestSell: { price: parseFloat(bestAskPrice), volume: parseFloat(bestAskVolume) },
    bestBuy: { price: parseFloat(bestBidPrice), volume: parseFloat(bestBidVolume) },
  };
}
