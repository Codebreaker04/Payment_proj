'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@repo/ui/sidebar';
import { api, Transaction } from '@/lib/api';
import { getSidebarSections } from '@/lib/sidebar';

export default function PaymentsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [payments, setPayments] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    void (async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.getTransactions(userId, 100, 0);
        const transactions = Array.isArray(response.transactions)
          ? response.transactions
          : [];
        const paymentLike = transactions.filter(
          tx => tx.type === 'debit' || tx.type === 'P2P_Transfer',
        );
        setPayments(paymentLike);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.user?.id]);

  const sidebarSections = getSidebarSections(payments.length);

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = payments
    .filter(payment => payment.status === 'Pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const completedAmount = payments
    .filter(payment => payment.status === 'Completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar
        sections={sidebarSections}
        currentPath={pathname}
        onNavigate={href => router.push(href)}
        showSearch={true}
      />

      <main className='flex-1 p-8'>
        <h1 className='text-3xl font-bold mb-6 text-gray-900'>Payment History</h1>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <p className='text-sm text-gray-600'>Total Payments</p>
            <p className='text-2xl font-bold text-gray-900'>${totalAmount.toFixed(2)}</p>
          </div>
          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <p className='text-sm text-gray-600'>Pending</p>
            <p className='text-2xl font-bold text-yellow-600'>${pendingAmount.toFixed(2)}</p>
          </div>
          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <p className='text-sm text-gray-600'>Completed</p>
            <p className='text-2xl font-bold text-green-600'>${completedAmount.toFixed(2)}</p>
          </div>
        </div>

        <section className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto'>
          {loading ? (
            <p className='p-6 text-gray-600'>Loading payment history...</p>
          ) : error ? (
            <p className='p-6 text-red-600'>{error}</p>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200 bg-gray-50'>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>Reference</th>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>Amount</th>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>Type</th>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>Status</th>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='py-6 px-4 text-center text-gray-500'>
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map(payment => (
                    <tr key={payment.id} className='border-b border-gray-100'>
                      <td className='py-3 px-4 text-sm'>{payment.referenceId}</td>
                      <td className='py-3 px-4 text-sm'>${payment.amount.toFixed(2)}</td>
                      <td className='py-3 px-4 text-sm'>{payment.type}</td>
                      <td className='py-3 px-4 text-sm'>{payment.status}</td>
                      <td className='py-3 px-4 text-sm'>{payment.createdAt.slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
