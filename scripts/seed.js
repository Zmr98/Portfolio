// Run this ONCE after creating your Supabase project and the
// site_content table (see README): `npm run seed`
//
// It creates the "uploads" storage bucket, uploads your existing local
// profile photo (if present), and pushes data/content.json into
// Supabase as the site's starting content. After this, all edits go
// through the admin dashboard — this file is just the initial seed.
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const contentPath = path.join(__dirname, '..', 'data', 'content.json');
  const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

  console.log('Checking storage bucket...');
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) { console.error('Could not list buckets:', listErr.message); process.exit(1); }
  if (!buckets.some((b) => b.name === 'uploads')) {
    const { error: createErr } = await supabase.storage.createBucket('uploads', { public: true });
    if (createErr) { console.error('Could not create bucket:', createErr.message); process.exit(1); }
    console.log('Created "uploads" bucket.');
  } else {
    console.log('"uploads" bucket already exists.');
  }

  const localPhoto = path.join(__dirname, '..', 'public', 'uploads', 'profile.png');
  if (fs.existsSync(localPhoto)) {
    console.log('Uploading existing profile photo...');
    const bytes = fs.readFileSync(localPhoto);
    const filename = `img_${Date.now()}_profile.png`;
    const { error: upErr } = await supabase.storage.from('uploads').upload(filename, bytes, { contentType: 'image/png' });
    if (upErr) {
      console.warn('Could not upload profile photo (skipping):', upErr.message);
    } else {
      const { data: pub } = supabase.storage.from('uploads').getPublicUrl(filename);
      content.hero.portraitImage = pub.publicUrl;
      console.log('Profile photo uploaded:', pub.publicUrl);
    }
  }

  console.log('Seeding site_content table...');
  const { error: seedErr } = await supabase
    .from('site_content')
    .upsert({ id: 'site', data: content, updated_at: new Date().toISOString() });
  if (seedErr) {
    console.error('Could not seed content table:', seedErr.message);
    console.error('Did you run the CREATE TABLE SQL from the README yet?');
    process.exit(1);
  }

  console.log('\nDone! Your Supabase project is seeded and ready.');
}

main();
