import { NextRequest, NextResponse } from 'next/server';
import { clearAdminCookieHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const cookieHeader = clearAdminCookieHeader();
  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', cookieHeader);
  return response;
}
