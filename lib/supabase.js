// Server-only Supabase client, using the service role key. This key
// bypasses row-level security and must NEVER be exposed to the browser
// — that's why it's a plain env var (not NEXT_PUBLIC_*) and this file
// is only ever imported from server components / route handlers.
import { createClient } from '@supabase/supabase-js';

// Next.js's App Router patches the global fetch() to cache requests by
// default. supabase-js uses fetch internally, so without this override
// Next can silently cache Supabase reads across requests/deploys —
// which looks exactly like "I saved an edit but the live site still
// shows the old version." Forcing cache: 'no-store' here guarantees
// every read hits Supabase fresh.
function noStoreFetch(input, init = {}) {
  return fetch(input, { ...init, cache: 'no-store' });
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  }
);
