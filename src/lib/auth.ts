import { cookies } from "next/headers";
import { prisma } from "./prisma";

const ADMIN_COOKIE_NAME = "admin-session";
const ADMIN_MAX_AGE = 24 * 60 * 60; // 24 hours

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    // Token format: adminId:secret
    const [adminId, secret] = token.split(":");
    if (secret !== process.env.ADMIN_SESSION_SECRET) return false;
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    return !!admin;
  } catch {
    return false;
  }
}

export function createAdminSessionValue(adminId: string): string {
  return `${adminId}:${process.env.ADMIN_SESSION_SECRET}`;
}

export function createAdminCookieHeader(adminId: string): string {
  const value = createAdminSessionValue(adminId);
  return `${ADMIN_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_MAX_AGE}`;
}

export function clearAdminCookieHeader(): string {
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export { ADMIN_COOKIE_NAME };
