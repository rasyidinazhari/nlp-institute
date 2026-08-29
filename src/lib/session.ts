import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";

const SESSION_COOKIE_NAME = "pola-session-id";
const SESSION_MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getOrCreateSessionId(): Promise<string> {
  const existing = await getSessionId();
  if (existing) return existing;
  return createId();
}

export function createSessionCookieHeader(sessionId: string): string {
  return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export { SESSION_COOKIE_NAME };
