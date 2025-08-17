export interface PriceData {
  bestAskPrice: number;
  bestBidPrice: number;
}
export function getBestPrices(asks: string[][], bids: string[][]): PriceData {
  const bestBid = bids!.length > 0 ? parseFloat(bids[0][0]) : null;
  const bestAsk = asks!.length > 0 ? parseFloat(asks[0][0]) : null;

  return {
    bestAskPrice: bestAsk!,
    bestBidPrice: bestBid!,
  };
}

export function getBestBidAsk(asks: string[][], bids: string[][]) {
  if (!bids.length || !asks.length)
    return { bestBidPrice: null, bestAskPrice: null };

  const bestAsk = Math.min(
    ...asks.map(([price]: string[]) => parseFloat(price))
  ); // 194.66

  // Лучшая цена для продажи сразу
  const bestBid = Math.max(
    ...bids.map(([price]: string[]) => parseFloat(price))
  ); // 194.65

  return {
    bestAskPrice: bestAsk!,
    bestBidPrice: bestBid!,
  };
}
