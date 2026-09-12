'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@repo/ui/sidebar';
import { api, Transaction } from '@/lib/api';
import { getSidebarSections } from '@/lib/sidebar';

export default function TransactionsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    void (async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.getTransactions(userId, 200, 0);
        setTransactions(
          Array.isArray(response.transactions) ? response.transactions : [],
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.user?.id]);

  const sidebarSections = getSidebarSections(transactions.length);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (statusFilter !== 'All' && transaction.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== 'All' && transaction.type !== typeFilter) {
      return false;
    }

    const txDate = transaction.createdAt.slice(0, 10);
    if (fromDate && txDate < fromDate) {
      return false;
    }
    if (toDate && txDate > toDate) {
      return false;
    }
    return true;
  });

  const uniqueStatuses = ['All', ...new Set(transactions.map(tx => tx.status))];
  const uniqueTypes = ['All', ...new Set(transactions.map(tx => tx.type))];

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar
        sections={sidebarSections}
        currentPath={pathname}
        onNavigate={handleNavigation}
        showSearch={true}
      />

      <main className='flex-1 p-8'>
        <h1 className='text-3xl font-bold mb-6 text-gray-900'>Transactions</h1>

        <section className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg'>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg'>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>From Date</label>
              <input
                type='date'
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>To Date</label>
              <input
                type='date'
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              />
            </div>
          </div>
        </section>

        <section className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto'>
          {loading ? (
            <p className='p-6 text-gray-600'>Loading transactions...</p>
          ) : error ? (
            <p className='p-6 text-red-600'>{error}</p>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200 bg-gray-50'>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>ID</th>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>Type</th>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>Amount</th>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>Status</th>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>Date</th>
                  <th className='text-left py-3 px-4 text-sm font-semibold'>
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='py-6 px-4 text-center text-gray-500'>
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(transaction => (
                    <tr key={transaction.id} className='border-b border-gray-100'>
                      <td className='py-3 px-4 text-sm font-medium'>{transaction.id}</td>
                      <td className='py-3 px-4 text-sm'>{transaction.type}</td>
                      <td className='py-3 px-4 text-sm'>${transaction.amount.toLocaleString()}</td>
                      <td className='py-3 px-4 text-sm'>{transaction.status}</td>
                      <td className='py-3 px-4 text-sm'>
                        {transaction.createdAt.slice(0, 10)}
                      </td>
                      <td className='py-3 px-4 text-sm text-gray-600'>
                        {transaction.description ?? '-'}
                      </td>
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
