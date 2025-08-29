import { createHmac } from "crypto";
enum ListenKeyAction {
  NEW = "POST",
  RENEW = "PUT",
}

export class HandleListenKey {
  private API_KEY = process.env.BINGX_API_KEY;
  private API_SECRET = process.env.BINGX_API_SECRET;
  private HOST = process.env.BINGX_HOST_URL;
  private BINGX_PATH = process.env.BINGX_PATH_URL;
  private listenKey: string | null = null;
  private isAuthenticated: boolean = false;

  public async createListenKey(): Promise<string> {
    const data = await this.sendRequest(ListenKeyAction.NEW);
    this.listenKey = data;
    this.isAuthenticated = true;
    return data;
  }
  private getTimeStamp(): string {
    return `timestamp=${Date.now()}`;
  }
  private getSignature(timeStamp: string): string {
    return createHmac("sha256", this.API_SECRET!)
      .update(timeStamp)
      .digest("hex");
  }
  private async sendRequest(action: ListenKeyAction): Promise<string> {
    const timeStamp = this.getTimeStamp();
    const signature = this.getSignature(timeStamp);
    const url = `https://${this.HOST}${this.BINGX_PATH}?${timeStamp}&signature=${signature}`;
    const response = await fetch(url, {
      method: action,
      headers: {
        "X-BX-APIKEY": this.API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // так как в axios был пустой объект
    });
    const data = await response.json();
    return data.listenKey;
  }
  public async keepAliveListnKey(): Promise<string> {
    if (!this.listenKey) {
      this.listenKey = await this.createListenKey();
      return this.listenKey!;
    }
    const newListenKey = await this.sendRequest(ListenKeyAction.RENEW);
    this.listenKey = newListenKey;
    return newListenKey;
  }
  public getListenKey(): string {
    if (!this.listenKey) throw new Error("ListenKey ещё не создан");
    return this.listenKey;
  }
}
