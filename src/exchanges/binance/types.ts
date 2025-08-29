export interface PlaceOrderParams {
  id: string;
  method: string;
  apiKey: string;
  symbol: string;
  side: string;
  type: string;
  timeInForce: string;
  quantity: string;
  price: string;
  timestamp?: number;
  signature?: string;
}
export interface PublicResponce {
  stream: string;
  data: {
    e: string;
    E: number;
    T: number;
    s: string;
    U: number;
    u: number;
    pu: number;
    b: string[][];
    a: string[][];
  };
}
export interface AuthResponce {
  id: string;
  status: number;
  result: {
    apiKey: string | null;
    authorizedSince: number | null;
    connectedSince: number;
    returnRateLimits: boolean;
    serverTime: number;
  };
  rateLimits: [
    {
      rateLimitType: string;
      interval: string;
      intervalNum: number;
      limit: number;
      count: number;
    }
  ];
}
export interface AuthRequest {
  id: string;
  method: string;
  params: {
    apiKey: string;
    signature: string;
    timestamp: number;
  };
}

export interface BinanceOrderParams {
  id: string;
  method: string;
  params: {
    symbol: string;
    side: string;
    type: string;
    price: string;
    quantity: string;
    timeInForce: string;
    timestamp?: number;
    recvWindow?: number;
  };
}
export interface IBinanceBalance {
  accountAlias: string;
  asset: string;
  balance: string;
  crossWalletBalance: string;
  crossUnPnl: string;
  availableBalance: string;
  maxWithdrawAmount: string;
  marginAvailable: boolean;
  updateTime: number;
}
export interface LoginParams {
  apiKey: string;
  timestamp: number;
}
export interface OrderParams {
  apiKey: string;
  symbol: string;
  side: string;
  type: string;
  quantity: string;
  price: string;
  timeInForce: string;
}
