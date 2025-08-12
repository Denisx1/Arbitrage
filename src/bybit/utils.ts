import * as crypto from "crypto";
export function getExpires() {
  return Number((Date.now() + 1) * 1000); // в секундах, +1 секунда
}

export function getSignature(apiSecret: string, expires: number): string {
  return crypto
    .createHmac("sha256", apiSecret)
    .update(`GET/realtime${expires}`)
    .digest("hex");
}
