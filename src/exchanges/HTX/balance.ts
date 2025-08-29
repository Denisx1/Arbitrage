import { IExchangeAuth } from "../bybit/type";
import { createHmac } from "crypto";
export class HTXBalanceClient {
  constructor(private auth: IExchangeAuth) {}

  public async getBalance() {
    const apiKey = process.env.HTX_API_KEY!;
    const secretKey = process.env.HTX_API_SECRET!;
    const host = "api.hbdm.com"; // актуальный хост HTX
    const path = "/api/v1/contract_balance_valuation";
    const method = "POST";

    // 1. Формируем параметры
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, ""); // "2025-08-27T05:04:00"
    const params: Record<string, string> = {
      AccessKeyId: apiKey,
      SignatureVersion: "2",
      SignatureMethod: "HmacSHA256",
      Timestamp: timestamp,
    };

    // 2. Сортируем параметры и формируем строку для подписи
    const keys = Object.keys(params).sort();
    const queryString = keys
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const payload = `${method}\n${host}\n${path}\n${queryString}`;

    // 3. Создаём HMAC-SHA256 и кодируем в Base64
    const signature = createHmac("sha256", secretKey)
      .update(payload)
      .digest("base64");

    params["Signature"] = signature;

    // 4. Формируем полный URL с query string
    const url = new URL(`https://${host}${path}`);
    url.search = new URLSearchParams(params).toString();

    // 5. Делаем GET-запрос
    const response = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ valuation_asset: "USD" }),
    });

    const data = await response.json();
    if (data.status === "ok") {
      if (Number(data.data[0].balance) === 0) {
        console.log("⚠️ HTX`s balance is empty");
        this.auth.balance = 0;
        return;
      }
      this.auth.balance = Number(data.data[0].balance);
      console.log(`💰 HTX's balance: ${this.auth.balance}`);
      return;
    }
  }
}
