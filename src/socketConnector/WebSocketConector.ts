import WebSocket from "ws";
import { IWebSocketConnector } from "./type";
// Конфигурация для коннектора
interface WebSocketConnectorConfig {
  url: string;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  connectTimeout?: number;
}

export class WebSocketConector {
  public ws: WebSocket | null = null;
  private readonly wsUrl: string;
  private readonly reconnectDelay: number = 1000; // Фиксированная задержка переподключения
  private readonly connectTimeout: number = 10000; // Таймаут подключения
  private messageHandlers: Array<(msg: Buffer) => void> = [];
  private isReconnecting: boolean = false;
  private pending: Map<string, (msg: any) => void> = new Map();
  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
  }

  public async connectWebSocket<T>(initialMessage?: T): Promise<WebSocket> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return this.ws;
    }

    this.ws = new WebSocket(this.wsUrl);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn("WebSocket connection timeout");
        this.reconnect();
        reject(new Error("Connection timeout"));
      }, this.connectTimeout);

      this.ws!.on("open", () => {
        clearTimeout(timeout);
        if (initialMessage) {
          this.send(initialMessage);
        }
        resolve(this.ws!);
      });

      this.ws!.on("error", (err) => {
        console.error(`WebSocket error: ${err.message}`);
        reject(err);
      });

      this.ws!.on("message", (msg: Buffer) => {
        this.messageHandlers.forEach((h) => h(msg));
      });
      this.ws!.on("close", () => {
        this.reconnect();
      });
    });
  }
  private reconnect(): void {
    if (this.isReconnecting) return;
    this.isReconnecting = true;
    this.close();
    try {
      setTimeout(() => {
        this.connectWebSocket().catch((err) =>
          console.error(`Reconnect failed: ${err.message}`)
        );
      }, this.reconnectDelay);
    } catch (error) {
      throw error;
    } finally {
      this.isReconnecting = false;
    }
  }

  public send<T>(data: T): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("Cannot send: WebSocket not open");
      return;
    }
    try {
      if (typeof data === "string") {
        this.ws.send(data);
      } else {
        this.ws.send(JSON.stringify(data));
      }
    } catch (err) {
      console.error(`Failed to send message: ${err}`);
    }
  }

  public close(): void {
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers = [];
  }

  public isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  addMessageHandler(handler: (msg: any) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (msg: any) => void) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }
}
