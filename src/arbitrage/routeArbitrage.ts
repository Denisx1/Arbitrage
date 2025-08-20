import { getPrivateClients } from "../clients";
import { Exchanges } from "../pairsEnum";
import { ArbitrageOpportunity } from "./service";

export async function routeArbitrage(opportunity: ArbitrageOpportunity) {
  const clients = await getPrivateClients();
  //   console.log(opportunity)
  const buyClient =
    clients[`${opportunity.bestBuy.exchange}Client` as keyof typeof clients];
  const sellClient =
    clients[`${opportunity.bestSell.exchange}Client` as keyof typeof clients];
  if (!buyClient || (!sellClient && !buyClient.status) || !sellClient.status)
    return;
  switch (opportunity.bestBuy.exchange) {
    case Exchanges.BINANCE:
      
      break;
    default:
      break;
  }
  switch (opportunity.bestSell.exchange) {
    case Exchanges.BINANCE:
      
      break;
    default:
      break;
  
  }
}
