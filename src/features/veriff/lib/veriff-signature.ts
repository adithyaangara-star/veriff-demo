import CryptoJS from "crypto-js";

/** Matches veriff-backend: HMAC-SHA256 over UTF-8, hex digest. */
export const signPayload = (payload: object | string, secret: string): string => {
  const raw = typeof payload === "string" ? payload : JSON.stringify(payload);
  return CryptoJS.HmacSHA256(raw, secret).toString(CryptoJS.enc.Hex);
};
