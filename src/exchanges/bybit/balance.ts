import { IBalanceClient } from "../common-types";
import { BybitRequestPublicParams, IExchangeAuth } from "./type";
import { RestClientV5 } from "bybit-api";
export class ByBitBalance {
  private client: RestClientV5;
  constructor(private auth: IExchangeAuth) {
    this.client = new RestClientV5({
      key: process.env.BYBIT_API_KEY!,
      secret: process.env.BYBIT_API_SECRET!,
    });
  }
  public async getbalance(): Promise<void> {
    const responce = await this.client.getWalletBalance({
      accountType: "UNIFIED",
      coin: "USDT",
    });
    if (responce.result.list[0].totalAvailableBalance === "0") {
      console.log("⚠️ Bybit`s balance is empty");
      this.auth!.balance = 0;
      return;
    }
    console.log(
      `💰 Bybit's balance: ${responce.result.list[0].totalAvailableBalance}`
    );
    this.auth!.balance = Number(responce.result.list[0].totalAvailableBalance);
  }
}

// constructor(private auth: IExchangeAuth) {
//   this.auth!.ws!.addMessageHandler((msg: Buffer) =>
//     this.handleBalanceResponse(msg)
//   );
// }
// public getBalance(): void {
//   this.auth!.ws!.send<BybitRequestPublicParams>({
//     op: "subscribe",
//     args: ["wallet"],
//   });
// }
// private handleBalanceResponse(msg: Buffer) {
//   const parsedData = JSON.parse(msg.toString());
//   if (parsedData.op !== "subscribe") return;
//   console.log(parsedData);
// }
