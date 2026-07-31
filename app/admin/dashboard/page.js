import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import { readContent } from '@/lib/data';
import Dashboard from './Dashboard';

export const dynamic = 'force-dynamic';

// Server component: gate-keeps the whole dashboard. If there's no
// valid session cookie, bounce straight back to the login page instead
// of ever sending the editor UI or content to the browser.
export default async function DashboardPage() {
  if (!isAuthed()) {
    redirect('/admin');
  }
  const content = await readContent();
  return <Dashboard initialContent={content} />;
}
