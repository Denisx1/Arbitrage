export interface OkxRequestPublicParams {
  op: string;
  args: [
    {
      channel: string;
      instId: string;
    }
  ];
}
export interface AuthOkxRequest {
  op: string;
  args: {
    apiKey: string;
    passphrase: string;
    timestamp: string;
    sign: string;
  }[];
}
