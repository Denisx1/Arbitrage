export interface CreateBinanceOrder {
    symbol: string;
    side: "BUY" | "SELL";
    type: "LIMIT";
    quantity: number;
    stopPrice: string;
    takeProfitPrice: string;
    price: number;
    leverage: number;
    closePosition: string;
  }