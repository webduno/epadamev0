import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const storedHashBuf = Buffer.from(hashHex, "hex");
  const computedHash = scryptSync(password, salt, 64);
  if (computedHash.length !== storedHashBuf.length) return false;
  return timingSafeEqual(computedHash, storedHashBuf);
}
