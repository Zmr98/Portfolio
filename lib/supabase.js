// Server-only Supabase client, using the service role key. This key
// bypasses row-level security and must NEVER be exposed to the browser
// — that's why it's a plain env var (not NEXT_PUBLIC_*) and this file
// is only ever imported from server components / route handlers.
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
