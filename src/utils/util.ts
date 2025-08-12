export function getBestPrices(
  asks: [string, string][],
  bids: [string, string][]
): { bestAskPrice: number; bestBidPrice: number } {
  const bestBid = bids.length > 0 ? parseFloat(bids[0][0]) : null;
  const bestAsk = asks.length > 0 ? parseFloat(asks[0][0]) : null;

  return {
    bestAskPrice: bestAsk!,
    bestBidPrice: bestBid!,
  };
}

export function getWeightedAvgPrice(
  orders: [string, string][],
  volumeNeeded: number,
  isBuy: boolean
) {
  let volumeLeft = volumeNeeded;
  let totalCost = 0;
  let totalVolume = 0;
  console.log("orders", orders);
}

//   for (const [priceStr, volumeStr] of orders) {
//     const price = parseFloat(priceStr);
//     const volume = parseFloat(volumeStr);
//     let tradeVolume = 0;
//     if (isBuy) {
//       tradeVolume = Math.max(volumeLeft, volume);
//     } else {
//       tradeVolume = Math.min(volumeLeft, volume);
//     }
//     if (tradeVolume === 0) continue;
//     totalCost += price * tradeVolume;
//     totalVolume += tradeVolume;
//     volumeLeft -= tradeVolume;

//     if (volumeLeft <= 0) break;
//   }

//   if (totalVolume === 0) return null; // Нет объёма
//   return totalCost / totalVolume;
// }
