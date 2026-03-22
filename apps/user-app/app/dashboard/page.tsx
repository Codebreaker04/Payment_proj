import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardClient } from './dashboard-client';
import { prisma } from '@repo/database';

async function getDashboardData(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: userId.toString() },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ senderId: wallet?.id }, { receiverId: wallet?.id }],
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    balance: wallet?.balance ? wallet.balance.toNumber() : 0,
    transactions: transactions.map((tx: any) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount.toNumber(),
      status: tx.status,
      date: tx.createdAt.toISOString().split('T')[0],
    })),
  };
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
