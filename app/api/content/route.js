import { NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/data';
import { isAuthed } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Public: anyone can read the content (the homepage itself calls this
// data indirectly via a server-side read, but this GET exists too so
// the admin dashboard can refresh without a full page reload).
export async function GET() {
  const content = await readContent();
  return NextResponse.json(content);
}

// Protected: only a logged-in admin can overwrite the content.
export async function PUT(req) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  await writeContent(body);
  return NextResponse.json({ ok: true });
}
