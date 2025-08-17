import WebSocket from "ws";
export interface IWebSocketConnector {
  connectWebSocket(): Promise<WebSocket>;
  onMessage(handler: (msg: Buffer) => void): void;
  send<T>(data: T): void;
}
