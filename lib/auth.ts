import { cookies } from "next/headers";
import { verifyJwt } from "./jwt";

const COOKIE_NAME = "auth-token";

export async function getAuthUser(): Promise<{ sub: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJwt(token);
}
