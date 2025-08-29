import { IExchangePrivateClient } from "../../types";
import { ArbitrageOpportunity } from "../../arbitrage/service";
import { IExchangeAuth } from "../bybit/type";
import { Direction } from "../binance/private/privateClient";
import zlib from "zlib";
interface HTXOrderParams {
  op: string;
  cid: string;
  data: {
    contract_code: string; // Символ, например "DOGE-USDT"
    margin_mode: "cross" | "isolated";
    position_side?: "long" | "short"; // Обязательно в Hedge режиме
    side: "buy" | "sell";
    type: "limit" | "market" | "post_only";
    price?: string; // Обязательно для лимитного ордера
    volume: string; // Кол-во контрактов (целое число)
    time_in_force?: "GTC" | "FOK" | "IOC";
    client_order_id?: string;
  };
}

export class HTXPrivateWsClient implements IExchangePrivateClient {
  constructor(private auth: IExchangeAuth) {
    this.auth.ws?.addMessageHandler((msg) => this.handleOrderResponse(msg));
  }
  public async placeOrder(
    order: Partial<ArbitrageOpportunity>,
    direction: Direction
  ) {
    let newOrder: HTXOrderParams;
    if (direction === Direction.BUY) {
      newOrder = {
        op: "place_order",
        cid: "newOrder",
        data: {
          contract_code: order.bestBuy?.symbol!,
          margin_mode: "cross",
          position_side: "long",
          side: "buy",
          type: "limit",
          price: order.bestBuy?.price.toString()!,
          volume: (this.auth.balance! / order.bestBuy?.price!).toString(),
        },
      };
    } else if (direction === Direction.SELL) {
      newOrder = {
        op: "place_order",
        cid: "newOrder",
        data: {
          contract_code: order.bestSell?.symbol!,
          margin_mode: "cross",
          position_side: "long",
          side: "buy",
          type: "limit",
          price: order.bestSell?.price.toString()!,
          volume: (this.auth.balance! / order.bestSell?.price!).toString(),
        },
      };
    }
    this.createOrder(newOrder!);
  }
  private createOrder(order: HTXOrderParams) {
    if (this.auth.status) {
      this.auth.ws!.send<HTXOrderParams>(order);
    }
  }

  private handleOrderResponse(msg: Buffer) {
    const buf = Buffer.from(msg);
    const decodedMsg = zlib.gunzipSync(buf).toString("utf-8");
    const parsedData = JSON.parse(decodedMsg);
    if (parsedData.cid === "newOrder" && parsedData.data === null) {
      console.log("parsedData", parsedData.message);
      return;
    }

    return;
  }
}
