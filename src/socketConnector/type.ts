import WebSocket from "ws";
export interface IWebSocketConnector {
  connectWebSocket<T>(initialMessage?: T): Promise<WebSocket>;
  onMessage(handler: (msg: Buffer) => void): void;
  offMessage(handler: (msg: Buffer) => void): void;
  send<T>(data: T): void;
  close(): void;
  isOpen(): boolean;
}
