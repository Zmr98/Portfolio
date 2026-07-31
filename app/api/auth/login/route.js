import { NextResponse } from 'next/server';
import { checkPassword, sessionCookie } from '@/lib/auth';

export async function POST(req) {
  const { password } = await req.json();

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const c = sessionCookie();
  res.cookies.set(c.name, c.value, c);
  return res;
}
