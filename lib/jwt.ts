import { createHmac, timingSafeEqual } from "crypto";

const DEV_SECRET = "dev-secret-change-in-production";
const JWT_SECRET = process.env.JWT_SECRET ?? DEV_SECRET;
const isProduction = process.env.NODE_ENV === "production";
if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEV_SECRET)) {
  throw new Error("JWT_SECRET must be set to a strong random value in production");
}
const EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days

function base64UrlEncode(input: Buffer | string): string {
  const base64 = typeof input === "string" ? Buffer.from(input).toString("base64") : input.toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Buffer {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  return Buffer.from(base64, "base64");
}

export function signJwt(payload: { sub: string; email: string }): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + EXPIRES_IN,
  };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = createHmac("sha256", JWT_SECRET).update(signingInput).digest();
  const signatureB64 = base64UrlEncode(signature);
  return `${signingInput}.${signatureB64}`;
}

export function verifyJwt(token: string): { sub: string; email: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSig = createHmac("sha256", JWT_SECRET).update(signingInput).digest();
  const receivedSig = base64UrlDecode(signatureB64);
  if (expectedSig.length !== receivedSig.length || !timingSafeEqual(expectedSig, receivedSig)) return null;
  let payload: { sub: string; email: string; exp?: number };
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64).toString()) as { sub: string; email: string; exp?: number };
  } catch {
    return null;
  }
  if (payload.exp != null && payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
  return { sub: payload.sub, email: payload.email };
}
