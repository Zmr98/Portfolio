// Single-admin, password-only auth. There's only one editor (you), so
// this skips user accounts/sessions-in-a-database entirely: the login
// cookie is just a hash of your ADMIN_PASSWORD env var. Anyone who
// knows the password can log in; nobody else can, and there's no
// separate secret to lose track of.
import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'mz_session';

function expectedToken() {
  const secret = process.env.ADMIN_PASSWORD || '';
  return crypto.createHash('sha256').update('mz-cms:' + secret).digest('hex');
}

export function checkPassword(password) {
  return Boolean(process.env.ADMIN_PASSWORD) && password === process.env.ADMIN_PASSWORD;
}

export function isAuthed() {
  const store = cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return Boolean(token) && token === expectedToken();
}

export function sessionCookie() {
  return {
    name: COOKIE_NAME,
    value: expectedToken(),
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export function clearCookieName() {
  return COOKIE_NAME;
}
