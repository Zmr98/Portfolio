import { readContent } from '@/lib/data';
import PortfolioView from './PortfolioView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server component: reads the current content from Supabase on every
// request, so edits made in the admin dashboard show up on the live
// site immediately (no rebuild needed).
export default async function Home() {
  const content = await readContent();
  return <PortfolioView content={content} />;
}
