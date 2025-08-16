import WebSocket from "ws";
import { AuthRequest, PublicResponce } from "./types";
export class BinanceWebSocketConnector {
  public ws!: WebSocket;
  constructor(private wsUrl: string) {}

  public async connect(): Promise<WebSocket> {
    this.ws = new WebSocket(this.wsUrl);
    return new Promise((resolve, reject) => {
      this.ws.on("open", () => {
        resolve(this.ws);
      });
      this.ws.on("error", (err) => {
        console.error("WS error:", err);
        reject(err);
      });
      this.ws.on("close", () => console.log("WebSocket closed"));
    });
  }

  public onMessage<T>(handler: (msg: T) => void) {
    this.ws.on("message", (msg: Buffer) => {
      let data;
      try {
        data = JSON.parse(msg.toString());
      } catch (err) {
        console.error("Invalid JSON:", msg.toString());
        return;
      }
      handler(data);
    });
  }

  public send<T>(data: T): void {
    if (this.ws.readyState === 1) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("Cannot send: WebSocket not open");
    }
  }
}
