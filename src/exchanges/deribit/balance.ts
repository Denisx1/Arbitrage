import { IExchangeAuth } from "../bybit/type";

export class DeribitBalanceClient {
  constructor(private auth: IExchangeAuth) {
    this.auth.ws!.addMessageHandler((msg: Buffer) =>
      this.handleBalanceResponse(msg)
    );
  }
  public getBalance(): void {
    this.auth.ws!.send({
      jsonrpc: "BalanceAccount",
      id: 200119175,
      method: "private/get_account_summary",
      params: {
        currency: "USDT",
        extended: true,
      },
    });
  }
  private handleBalanceResponse(msg: Buffer) {
    const parsedData = JSON.parse(msg.toString());
    if (parsedData.id !== 200119175) {
      return;
    }
    if (parsedData.result.equity === 0) {
      console.log("⚠️ Deribit`s balance is empty");
      this.auth!.balance = 0;
      return;
    }
    console.log(`💰 Deribit's balance: ${parsedData.result.equity}`);
    this.auth!.balance = Number(parsedData.result.equity);
  }
}
