import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { Pairs } from "./pairsEnum";
import { IExchangeAuth } from "./exchanges/bybit/type";
import { ExchangesReturn } from "./config/types";
import { initPrivateClients } from "./clients";
import { initPublicClients } from "./clients";

async function main(symbol: string): Promise<ExchangesReturn<IExchangeAuth>> {
  const privateClients = await initPrivateClients();
  const publicClients = initPublicClients(symbol);
  await Promise.all(
    Object.values(publicClients).map((client) => client.subscribeOrderBook())
  );
  return privateClients;
}

main(Pairs.ETHUSDT);
