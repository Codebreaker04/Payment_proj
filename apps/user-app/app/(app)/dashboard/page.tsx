import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Data is fetched by the client so the dashboard can refresh itself after a
  // transfer without a full navigation (see dashboard-client.tsx).
  return <DashboardClient />;
}
