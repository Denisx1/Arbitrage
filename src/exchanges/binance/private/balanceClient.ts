import { IExchangeAuth } from "../../bybit/type";
import { IBalanceClient } from "../../common-types";
import { ActionType } from "../enums";
import { IBinanceBalance } from "../types";

export class BinanceBalanceClient implements IBalanceClient {
  constructor(private auth: IExchangeAuth) {
    this.auth!.ws!.addMessageHandler((msg: Buffer) =>
      this.handleBalanceResponse(msg)
    );
  }
  private handleBalanceResponse(msg: Buffer) {
    const parsedData = JSON.parse(msg.toString());
    if (parsedData.id !== ActionType.BINANCE_BALANCE) {
      return;
    }
    if (parsedData.status !== 200) {
      console.log("❌ Ошибка получения баланса", parsedData.error.msg);
      return;
    }
    const usdt: IBinanceBalance = parsedData.result.find(
      (item: IBinanceBalance) => item.asset === "USDT"
    );

    if (!usdt) {
      console.log("⚠️ Баланс USDT не найден");
      this.auth!.balance = 0;
      return;
    }
    if (usdt.crossWalletBalance === "0.00000000") {
      console.log("⚠️ Binance`s balance is empty");
      this.auth!.balance = 0;
      return;
    }
    console.log(`💰 Binance's balance: ${usdt.crossWalletBalance}`);
    this.auth!.balance = Number(usdt.crossWalletBalance);
  }
  public getBalance(): void {
    this.auth!.ws!.send({
      id: ActionType.BINANCE_BALANCE,
      method: "v2/account.balance",
      params: {
        timestamp: new Date().getTime(),
      },
    });
  }
}
