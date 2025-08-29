export interface DeribitRequestPublicParams {
  method: string;
  params: {
    channels: string[];
  };
}

export interface AuthDeribitRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: {
    grant_type: string;
    client_id: string;
    timestamp: number;
    signature: string;
    nonce: string;
    data: string;
  };
}
