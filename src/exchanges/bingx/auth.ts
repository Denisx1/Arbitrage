import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { IExchangeAuth } from "../bybit/type";
import { HandleListenKey } from "./handleListenKey";
import zlib from "zlib";
import { createHmac } from "crypto";
export class BingXAuth implements IExchangeAuth {
  private isAuthorized = false;
  private API_KEY = process.env.BINGX_API_KEY;
  private API_SECRET = process.env.BINGX_API_SECRET;
  private HOST = "open-api.bingx.com";
  private BINGX_PATH = "/openApi/swap/v3/user/balance";
  private bingxBalance = 0;

  private getTimeStamp(): string {
    return `${Date.now()}`;
  }
  private getSignature(paramsString: string): string {
    // Подпись на строке параметров (без сортировки для GET)
    return createHmac("sha256", this.API_SECRET!)
      .update(paramsString)
      .digest("hex");
  }

  public async getBalance() {
    const timestamp = this.getTimeStamp();
    const recvWindow = 5000; // Рекомендуемое значение
    const params = { timestamp, recvWindow }; // Добавьте другие параметры, если нужно

    // Строим строку параметров (без сортировки для GET)
    const paramsString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    const signature = this.getSignature(paramsString);

    // Полный URL с query
    const queryString = `${paramsString}&signature=${signature}`;
    const url = `https://${this.HOST}${this.BINGX_PATH}?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-BX-APIKEY": this.API_KEY!,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  }

  async login() {
    const data = await this.getBalance();
    if (data.code === 0) {
      this.isAuthorized = true;
      console.log("✅ Authenticated private WebSocket BingX");
      if (data.data[0].balance === "0.0000") {
        console.log("⚠️ BingX`s balance is empty");
        return;
      }
      this.bingxBalance = Number(data.data[0].balance);
    }
  }
  get status(): boolean {
    return this.isAuthorized;
  }
  get balance(): number {
    return this.bingxBalance;
  }
}
