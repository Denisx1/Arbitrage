export interface MexcPublickWsRequest {
  method: string;
  param: {
    symbol: string;
  };
}

export interface MexcAuthRequest {
  subscribe: boolean;
  method: string;
  param: {
    apiKey: string;
    reqTime: number;
    signature: string;
  };
}