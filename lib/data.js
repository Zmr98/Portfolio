// Content now lives in a single-row Supabase table (`site_content`)
// instead of a local JSON file — this is what makes edits survive
// deploys on a serverless host like Vercel, which has no persistent
// disk of its own.
import { supabase } from './supabase';

const ROW_ID = 'site';

export async function readContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('id', ROW_ID)
    .single();

  if (error) throw new Error('Failed to read content: ' + error.message);
  return data.data;
}

export async function writeContent(content) {
  const { error } = await supabase
    .from('site_content')
    .upsert({ id: ROW_ID, data: content, updated_at: new Date().toISOString() });

  if (error) throw new Error('Failed to save content: ' + error.message);
}
