import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { IExchangePrivateClient } from "../../types";
import { ArbitrageOpportunity } from "../../arbitrage/service";
import { IExchangeAuth } from "../bybit/type";
import { Direction } from "../binance/private/privateClient";
import { createHmac } from "crypto";

interface OrderParams {
  symbol: string;
  side: string;
  positionSide: string;
  type: string;
  quantity: string;
  price: string;
  takeProfit?: string;
  stopLoss?: string;
}

export class BingXPrivateClient implements IExchangePrivateClient {
  private HOST = "open-api.bingx.com";
  private URI = "/openApi/swap/v2/trade/order";
  private method = "POST";

  constructor(private auth: IExchangeAuth) {}

  public async placeOrder(
    order: Partial<ArbitrageOpportunity>,
    direction: Direction
  ) {
    if (!order.bestBuy && !order.bestSell) {
      throw new Error("Нет данных для ордера");
    }

    const price =
      direction === Direction.BUY
        ? order.bestBuy!.price!
        : order.bestSell!.price!;

    const quantity = Number((this.auth.balance! / price).toFixed(4)).toString();

    // формируем payload (как в примере)
    const payload: OrderParams = {
      symbol:
        direction === Direction.BUY
          ? order.bestBuy!.symbol!
          : order.bestSell!.symbol!,
      side: direction === Direction.BUY ? "BUY" : "SELL",
      positionSide: direction === Direction.BUY ? "LONG" : "SHORT",
      type: "LIMIT",
      quantity: quantity,
      price: price.toString(),
    };

    if (price) {
      payload.takeProfit = JSON.stringify({
        type: "TAKE_PROFIT_MARKET",
        stopPrice: Number((price * 1.01).toFixed(4)),
        price: Number((price * 1.01).toFixed(4)),
        workingType: "MARK_PRICE",
      });

      payload.stopLoss = JSON.stringify({
        type: "STOP_MARKET",
        stopPrice: Number((price * 0.99).toFixed(4)),
        workingType: "MARK_PRICE",
      });
    }

    const timestamp = Date.now();

    // Формируем строку параметров (⚠️ без сортировки!)
    const paramsString = this.getParameters(payload, timestamp, false);
    const paramsEncoded = this.getParameters(payload, timestamp, true);

    // Подпись
    const signature = createHmac("sha256", process.env.BINGX_API_SECRET!)
      .update(paramsString)
      .digest("hex");

    const url = `https://${this.HOST}${this.URI}?${paramsEncoded}&signature=${signature}`;

    try {
      const resp = await fetch(url, {
        method: this.method,
        headers: {
          "X-BX-APIKEY": process.env.BINGX_API_KEY!,
        },
      });

      // Дополнительно парсим BigInt корректно
      let data;
      try {
        data = await resp.json();
      } catch (e) {
        console.error("JSON parse error:", e);
        throw new Error(`Failed to parse response: ${resp}`);
      }
      if (!data.data) {
        console.log("Order Bingx response:", {
          message: data.message,
          code: data.code,
        });
        return;
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  private getParameters(
    payload: OrderParams,
    timestamp: number,
    urlEncode = false
  ): string {
    let parameters = "";
    for (const key in payload) {
      if (urlEncode) {
        parameters +=
          key +
          "=" +
          encodeURIComponent(payload[key as keyof OrderParams] as string) +
          "&";
      } else {
        parameters += key + "=" + payload[key as keyof OrderParams] + "&";
      }
    }
    parameters += "timestamp=" + timestamp;
    return parameters;
  }
}
