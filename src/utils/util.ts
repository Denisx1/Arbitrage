export interface PriceData {
  bestAskPrice: number;
  bestBidPrice: number;
}
export function getBestPrices(asks: string[][], bids: string[][]): PriceData {
  const bestBid = bids.length > 0 ? parseFloat(bids[0][0]) : null;
  const bestAsk = asks.length > 0 ? parseFloat(asks[0][0]) : null;

  return {
    bestAskPrice: bestAsk!,
    bestBidPrice: bestBid!,
  };
}
