import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { connectBinance } from "./binance/service";
import { connectBybit } from "./bybit/service";
import { connectOkx } from "./okx/service";
import { Pairs } from "./pairsEnum";
import { connectBingx } from "./bingx/service";
import { connectMexc } from "./mexc/service";

async function main(symbol: string) {
  await Promise.all([
    connectBinance(symbol),
    connectBybit(symbol),
    connectOkx(symbol),
    connectMexc(symbol),
    connectBingx(symbol),
  ]);
}

main(Pairs.DOGEUSDT);
