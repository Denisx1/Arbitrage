import { IExchangeAuth } from "../bybit/type";
import { createHmac } from "crypto";
interface BalanceMexcResponce {
  success: boolean;
  code: number;
  data: BalanceMexcData[];
}
interface BalanceMexcData {
  currency: string;
  positionMargin: number;
  availableBalance: number;
  cashBalance: number;
  frozenBalance: number;
  equity: number;
  unrealized: number;
  bonus: number;
  availableCash: number;
  availableOpen: number;
  debtAmount: number;
  contributeMarginAmount: number;
  vcoinId: string;
}
export class MEXCBalanceClient {
  constructor(private auth: IExchangeAuth) {}

  private getSignature(): { signature: string; reqTime: string } {
    const reqTime = this.getTimestamp();
    const requestParam = ""; // тут нет параметров, значит пустая строка
    const strToSign = process.env.MEXC_API_KEY! + reqTime + requestParam;

    const signature = createHmac("sha256", process.env.MEXC_API_SECRET!)
      .update(strToSign)
      .digest("hex");
    return { signature, reqTime };
  }
  private getTimestamp(): string {
    return Date.now().toString();
  }

  public async getBalance(): Promise<void> {
    const { signature, reqTime } = this.getSignature();
    const headers = {
      ApiKey: process.env.MEXC_API_KEY!,
      "Request-Time": reqTime,
      Signature: signature,
      "Content-Type": "application/json",
    };

    const res = await fetch(process.env.MEXC_REST_API_URL!, {
      headers,
    });
    const data: BalanceMexcResponce = await res.json();
    const usdt = data.data.find(
      (balance: BalanceMexcData) => balance.currency === "USDT"
    );
    if (usdt?.availableBalance === 0) {
      console.log("⚠️ MEXC`s balance is empty");
      this.auth!.balance = 0;
      return;
    }
    console.log(`💰 MEXC's balance: ${usdt?.availableBalance}`);
    this.auth!.balance = Number(usdt?.availableBalance);
  }
}
