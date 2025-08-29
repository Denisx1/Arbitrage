import { IExchangeAuth } from "../bybit/type";
import { IBalanceClient } from "../common-types";

export class OkxBalanceClient implements IBalanceClient {
  constructor(private auth: IExchangeAuth) {
    this.auth.ws!.addMessageHandler((msg: Buffer) =>
      this.handleBalanceResponse(msg)
    );
  }
  public getBalance(): void {
    this.auth.ws!.send({
      id: "balanceOkx",
      op: "subscribe",
      args: [{ channel: "balance_and_position" }],
    });
  }

  private handleBalanceResponse(msg: Buffer) {
    const parsedData = JSON.parse(msg.toString());
    if (
      parsedData.event &&
      ["channel-conn-count", "subscribe"].includes(parsedData.event)
    ) {
      return;
    }
    if (!parsedData.data || parsedData.data.length === 0) {
      this.auth!.balance = 0;
      return;
    }
    const snapshot = parsedData.data[0];
    const balData = snapshot.balData;

    if (!balData || balData.length === 0) {
      console.log("⚠️ Okx`s balance is empty");
      this.auth!.balance = 0;
      return;
    }
    const usdt = balData.find((b: any) => b.ccy === "USDT");
    if (!usdt) {
      console.log("⚠️ Баланс USDT не найден");
      this.auth!.balance = 0;
      return;
    }
    console.log(`💰 Okx's balance: ${usdt.availBal}`);
    this.auth!.balance = Number(usdt.availBal);
  }
}
