import { NextResponse } from 'next/server';
import { clearCookieName } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearCookieName(), '', { path: '/', maxAge: 0 });
  return res;
}
