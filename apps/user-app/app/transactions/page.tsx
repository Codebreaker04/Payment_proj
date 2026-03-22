'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarSection,
  DashboardIcon,
  TransferIcon,
  TransactionsIcon,
  SettingsIcon,
  PaymentsIcon,
  UsersIcon,
} from '@repo/ui/sidebar';

export default function TransactionsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const sidebarSections: SidebarSection[] = [
    {
      id: 'menu',
      title: 'MENU',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <DashboardIcon />,
          href: '/dashboard',
        },
        {
          id: 'transactions',
          label: 'Transactions',
          icon: <TransactionsIcon />,
          href: '/transactions',
          badge: 8,
        },
        {
          id: 'transfer',
          label: 'Transfer Money',
          icon: <TransferIcon />,
          href: '/transfer',
        },
        {
          id: 'payments',
          label: 'Payment History',
          icon: <PaymentsIcon />,
          href: '/payments',
        },
      ],
    },
    {
      id: 'account',
      title: 'ACCOUNT',
      items: [
        {
          id: 'profile',
          label: 'Account',
          icon: <UsersIcon />,
          href: '/account',
        },
      ],
    },
    {
      id: 'support',
      title: 'SUPPORT',
      items: [
        {
          id: 'settings',
          label: 'Setting',
          icon: <SettingsIcon />,
          href: '/settings',
        },
      ],
    },
  ];

  const mockTransactions = [
    {
      id: 'TXN-001',
      type: 'Credit',
      amount: 500,
      status: 'Completed',
      date: '2026-02-15',
      description: 'Payment received',
    },
    {
      id: 'TXN-002',
      type: 'Debit',
      amount: 150,
      status: 'Completed',
      date: '2026-02-14',
      description: 'Transfer to John',
    },
    {
      id: 'TXN-003',
      type: 'Credit',
      amount: 1200,
      status: 'Completed',
      date: '2026-02-13',
      description: 'Salary deposit',
    },
    {
      id: 'TXN-004',
      type: 'Debit',
      amount: 75,
      status: 'Pending',
      date: '2026-02-12',
      description: 'Online purchase',
    },
    {
      id: 'TXN-005',
      type: 'Debit',
      amount: 300,
      status: 'Completed',
      date: '2026-02-11',
      description: 'Utility bill',
    },
    {
      id: 'TXN-006',
      type: 'Credit',
      amount: 850,
      status: 'Completed',
      date: '2026-02-10',
      description: 'Freelance payment',
    },
    {
      id: 'TXN-007',
      type: 'Debit',
      amount: 200,
      status: 'Failed',
      date: '2026-02-09',
      description: 'Failed transaction',
    },
    {
      id: 'TXN-008',
      type: 'Credit',
      amount: 450,
      status: 'Completed',
      date: '2026-02-08',
      description: 'Refund',
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  // Filter transactions based on selected filters
  const filteredTransactions = mockTransactions.filter(transaction => {
    // Status filter
    if (statusFilter !== 'All' && transaction.status !== statusFilter) {
      return false;
    }

    // Type filter
    if (typeFilter !== 'All' && transaction.type !== typeFilter) {
      return false;
    }

    // Date range filter
    if (fromDate && transaction.date < fromDate) {
      return false;
    }

    if (toDate && transaction.date > toDate) {
      return false;
    }

    return true;
  });

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar
        sections={sidebarSections}
        currentPath={pathname}
        onNavigate={handleNavigation}
        showSearch={true}
      />

      <main className='flex-1'>
        <div className='p-8'>
          <h1 className='text-3xl font-bold mb-8 text-gray-900'>
            Transactions
          </h1>

          {/* Filters */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-900'>Filters</h2>
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setTypeFilter('All');
                  setFromDate('');
                  setToDate('');
                }}
                className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                Clear All
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option>All</option>
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option>All</option>
                  <option>Credit</option>
                  <option>Debit</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  From Date
                </label>
                <input
                  type='date'
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  To Date
                </label>
                <input
                  type='date'
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
            <div className='p-6 border-b border-gray-200 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Transactions
              </h2>
              <span className='text-sm text-gray-600'>
                Showing {filteredTransactions.length} of{' '}
                {mockTransactions.length} transactions
              </span>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200 bg-gray-50'>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Transaction ID
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Type
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Amount
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Status
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Date
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className='py-8 px-6 text-center text-gray-500'>
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(transaction => (
                      <tr
                        key={transaction.id}
                        className='border-b border-gray-100 hover:bg-gray-50'>
                        <td className='py-4 px-6 text-sm font-medium text-gray-900'>
                          {transaction.id}
                        </td>
                        <td className='py-4 px-6 text-sm'>
                          <span
                            className={`font-medium ${transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className='py-4 px-6 text-sm font-medium text-gray-900'>
                          ${transaction.amount.toLocaleString()}
                        </td>
                        <td className='py-4 px-6'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className='py-4 px-6 text-sm text-gray-600'>
                          {transaction.date}
                        </td>
                        <td className='py-4 px-6 text-sm text-gray-600'>
                          {transaction.description}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
