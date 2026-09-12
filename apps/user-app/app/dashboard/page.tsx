import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardClient } from './dashboard-client';
import { api } from '@/lib/api';

async function getDashboardData(userId: string) {
  try {
    const [balanceResponse, transactionsResponse] = await Promise.all([
      api.getBalance(userId),
      api.getTransactions(userId, 10, 0),
    ]);

    return {
      balance: balanceResponse.balance,
      transactions: transactionsResponse.transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        date: tx.createdAt.split('T')[0] ?? tx.createdAt,
      })),
    };
  } catch {
    return {
      balance: 0,
      transactions: [],
    };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const data = await getDashboardData(session.user.id);

  return (
    <DashboardClient
      balance={data.balance}
      transactions={data.transactions}
      userName={session.user.name || 'User'}
    />
  );
}
