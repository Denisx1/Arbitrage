import { IExchangePublicClient } from "../bybit/type";
import { Exchanges } from "../../pairsEnum";
import { WebSocketConector } from "../../socketConnector/WebSocketConector";
import { updatePriceStore } from "../../utils/priceStore";
import { getBestBidAsk } from "../../utils/util";
import zlib from "zlib";
import { BingXRequestPublicParams, BingXResponcePublicParams } from "./types";
import { v4 as uuidv4 } from "uuid";

export class BingXPublickWsClient implements IExchangePublicClient {
  private heartbeatInterval?: NodeJS.Timeout;
  private lastMessageTime: number = Date.now();
  private symbol: string;
  constructor(private wsManager: WebSocketConector, symbol: string) {
    this.symbol = symbol.replace("USDT", "-USDT");
    this.wsManager.addMessageHandler((msg) => this.handlePublicMessage(msg));
  }

  public async subscribeOrderBook(): Promise<void> {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    await this.wsManager.connectWebSocket<BingXRequestPublicParams>({
      id: uuidv4(),
      reqType: "sub",
      dataType: `${this.symbol}@depth5@500ms`,
    });

    this.heartbeatInterval = setInterval(() => this.checkHeartbeat(), 5000);
  }
  public stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
    this.wsManager.close();
    console.log(`[BingX:${this.symbol}] Stopped`);
  }
  private handlePublicMessage(msg: Buffer): void {
    try {
      let data: BingXResponcePublicParams;
      try {
        const decodedMsg = zlib.gunzipSync(msg).toString("utf-8");
        if (decodedMsg === "Ping") {
          if (this.wsManager.isOpen()) {
            this.wsManager.send("Pong");
          } else {
            console.warn(
              `[BingX:${this.symbol}] Cannot send Pong: WebSocket not open`
            );
          }
          return;
        }
        data = JSON.parse(decodedMsg);
      } catch (err) {
        console.error(
          `[BingX:${this.symbol}] Failed to decode/parse message: ${err}`
        );
        return;
      }

      this.lastMessageTime = Date.now();
      if (!data?.data) {
        return;
      }

      const { asks, bids } = data.data;
      const { bestBuy, bestSell } = getBestBidAsk(asks, bids, this.symbol);
      updatePriceStore(Exchanges.BINGX, bestBuy, bestSell);
    } catch (err) {
      console.error(`[BingX:${this.symbol}] Error processing message: ${err}`);
    }
  }

  private checkHeartbeat(): void {
    const diff = Date.now() - this.lastMessageTime;
    if (diff > 10000) {
      console.warn(`[BingX:${this.symbol}] No data >10s, reconnecting...`);
      this.wsManager
        .connectWebSocket()
        .catch((err) =>
          console.error(
            `[BingX:${this.symbol}] Reconnect failed: ${err.message}`
          )
        );
    }
  }
}
