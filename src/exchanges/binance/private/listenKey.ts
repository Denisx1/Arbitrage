import fs from "fs";
import { IExchangeAuth } from "../../bybit/type";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export class ListenKey {
  private listenKeyPath = path.join(__dirname, "listenKey.txt");

  constructor(private auth: IExchangeAuth) {
    this.auth.ws?.addMessageHandler((msg: Buffer) => this.handleMessage(msg));
  }

  public async initListenKey() {
    await this.keepAlive();
  }

  private async createListenKey() {
    const request = {
      id: uuidv4(),
      method: "userDataStream.start",
      params: {
        apiKey: process.env.BINANCE_API_KEY!,
      },
    };

    try {
      this.auth.ws?.send(request);
      console.log("📤 Sent userDataStream.start request");
    } catch (error) {
      console.error("❌ Error sending userDataStream.start:", error);
    }
  }

  private async keepAlive() {
    const request = {
      id: uuidv4(),
      method: "userDataStream.ping",
      params: {
        apiKey: process.env.BINANCE_API_KEY!,
      },
    };

    try {
      this.auth.ws?.send(request);
      console.log("🔄 Sent userDataStream.ping for listenKey:");
    } catch (error) {
      console.error("❌ Error sending userDataStream.ping:", error);
    }
  }

  private handleMessage(msg: Buffer): void {
    try {
      const parsedData = JSON.parse(msg.toString());
      if (parsedData.status === 200 && parsedData.result.listenKey) {
        fs.writeFileSync(this.listenKeyPath, parsedData.result.listenKey);
      }
      return;
    } catch (error) {
      console.error("❌ Error parsing message:", error);
    }
  }

  // public getListenKey(): string | null {
  //   return this.;
  // }
}
