export interface HTXRequestPublicParams {
  sub: string;
  id: string;
}
export interface HTXAuthParams {
  AccessKeyId: string;
  SignatureMethod: string;
  SignatureVersion: string;
  Timestamp: string;
  Signature?: string;
}
