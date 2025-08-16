import WebSocket from "ws";
import { ExchangeConfig } from "../config/types";
import { ByBitAuth } from "./bybitAuth";
import { IExchangePrivateClient } from "./type";
export class BybitPrivateWsClient{
  private wsPrivate: WebSocket | null = null;
  private wsPrivateUrl: string;
  private isAuthenticated: boolean = false;
  private bybitAuth: ByBitAuth;
  private symbol: string;
  constructor(byBitConfig: ExchangeConfig, symbol: string) {
    this.wsPrivateUrl = byBitConfig.wsUrl;
    this.symbol = symbol;
    this.bybitAuth = new ByBitAuth();
  }

  public connectPrivate() {
    this.wsPrivate = new WebSocket(this.wsPrivateUrl);
    this.wsPrivate.on("open", () => {
      this.wsPrivate!.send(JSON.stringify(this.bybitAuth.getAuthPayload()));
    });
    this.wsPrivate.on("message", (msg) => {
      this.handlePrivateMessage(msg.toString());
    });
    this.wsPrivate.on("error", (err) =>
      console.error("Bybit Private WS error:", err)
    );
    this.wsPrivate.on("close", () => console.log("Bybit Private WS closed"));
  }
  private handlePrivateMessage(msg: WebSocket.Data) {
    const data = JSON.parse(msg.toString());
    if (data.op === "auth" && data.success) {
      this.isAuthenticated = true;
      console.log("Authenticated");
    }
  }
  public placeOrder = async (price: number, qty: number, side: string) => {
    if (
      !this.isAuthenticated ||
      this.wsPrivate!.readyState !== WebSocket.OPEN
    ) {
      throw new Error("WebSocket not connected or authenticated");
    }
    const orderPayload = {
      op: "spread.order",
      args: [
        {
          category: "linear",
          symbol: this.symbol,
          side,
          orderType: "Limit",
          qty: qty.toString(),
          price: price.toString(),
          timeInForce: "GoodTillCancel",
        },
      ],
    };
    this.wsPrivate!.send(JSON.stringify(orderPayload));
  };
}
