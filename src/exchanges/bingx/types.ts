export interface BingXRequestPublicParams {
  id: string;
  reqType: string;
  dataType: string;
}
export interface BingXResponcePublicParams {
  code: number;
  dataType: string;
  ts: number;
  data: {
    bids: string[][];
    asks: string[][];
  };
}