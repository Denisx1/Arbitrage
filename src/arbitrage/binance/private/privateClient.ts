import { BinanceAuth } from "./BinanceAuth";
import { PlaceOrderParams } from "../types";
import { IExchangePrivateClient } from "../../../exchanges/bybit/type";
import { WebSocketConector } from "../../../socketConnector/WebSocketConector";

export class BinancePrivateWsClient implements IExchangePrivateClient {
  constructor(
    private wsManager: WebSocketConector,
    private auth: BinanceAuth
  ) {}
  public connect(order: Partial<PlaceOrderParams>) {
    if (!this.auth.status) {
      console.log("❌ Session not active, cannot place order");
      return;
    }
    this.wsManager.send({ id: "order", method: "order.place" });
    console.log("✅ Order sent:", order);
  }
}
