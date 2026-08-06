import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];
const MAX_BYTES = 12 * 1024 * 1024; // 12MB (covers a multi-page resume PDF too)
const BUCKET = 'uploads';

const CONTENT_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', gif: 'image/gif', pdf: 'application/pdf',
};

// Creates the storage bucket on first use so there's no manual step in
// the Supabase dashboard beyond running the SQL in the README once.
async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_BYTES });
  }
}

// Protected: handles a single image upload from the admin dashboard and
// stores it in Supabase Storage (a real persistent, CDN-backed bucket),
// then returns its public URL to save on the content item.
export async function POST(req) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 12MB)' }, { status: 400 });
  }

  const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const ext = ALLOWED_EXT.includes(rawExt) ? rawExt : 'jpg';
  const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    await ensureBucket();
    const { error } = await supabase.storage.from(BUCKET).upload(filename, bytes, {
      contentType: CONTENT_TYPES[ext] || file.type || 'application/octet-stream',
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
