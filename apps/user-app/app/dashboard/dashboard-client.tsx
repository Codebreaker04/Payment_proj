'use client';

import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Sidebar,
  SidebarSection,
  DashboardIcon,
  TransferIcon,
  TransactionsIcon,
  SettingsIcon,
  PaymentsIcon,
  UsersIcon,
  LogoutIcon,
} from '@repo/ui/sidebar';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  date: string;
}

interface DashboardClientProps {
  balance: number;
  transactions: Transaction[];
  userName: string;
}

export function DashboardClient({
  balance,
  transactions,
  userName,
}: DashboardClientProps) {
  const pathname = usePathname();
  const router = useRouter();

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
          badge: transactions.length,
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

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

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
          {/* Info Banner */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center gap-3'>
            <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0'>
              <svg
                className='w-4 h-4 text-white'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <p className='text-blue-900 font-medium'>
              Welcome back, {userName}! Your account is secure and protected.
            </p>
          </div>

          {/* Metrics Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {/* Total Balance */}
            <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Total Balance
                </h3>
                <button className='text-gray-400 hover:text-gray-600'>
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                  </svg>
                </button>
              </div>
              <p className='text-3xl font-bold text-gray-900 mb-2'>
                ${balance.toLocaleString()}
              </p>
              <div className='flex items-center text-green-600 text-sm'>
                <svg
                  className='w-4 h-4 mr-1'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>12% from last month</span>
              </div>
            </div>

            {/* Total Saving */}
            <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Total Saving
                </h3>
                <button className='text-gray-400 hover:text-gray-600'>
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                  </svg>
                </button>
              </div>
              <p className='text-3xl font-bold text-gray-900 mb-2'>
                ${(balance * 0.3).toLocaleString()}
              </p>
              <div className='flex items-center text-red-600 text-sm'>
                <svg
                  className='w-4 h-4 mr-1'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>8% from last month</span>
              </div>
            </div>

            {/* Revenue */}
            <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium text-gray-600'>Revenue</h3>
                <button className='text-gray-400 hover:text-gray-600'>
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                  </svg>
                </button>
              </div>
              <p className='text-3xl font-bold text-gray-900 mb-2'>
                ${(balance * 0.45).toLocaleString()}
              </p>
              <div className='flex items-center text-green-600 text-sm'>
                <svg
                  className='w-4 h-4 mr-1'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>18% from last month</span>
              </div>
            </div>

            {/* Credit */}
            <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium text-gray-600'>Credit</h3>
                <button className='text-gray-400 hover:text-gray-600'>
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                  </svg>
                </button>
              </div>
              <p className='text-3xl font-bold text-gray-900 mb-2'>
                ${(balance * 0.15).toLocaleString()}
              </p>
              <div className='flex items-center text-green-600 text-sm'>
                <svg
                  className='w-4 h-4 mr-1'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>5% from last month</span>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
            <div className='p-6 border-b border-gray-200 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Recent Transactions
              </h2>
              <div className='flex gap-2'>
                <input
                  type='search'
                  placeholder='Search transactions...'
                  className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <button className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'>
                  Filter
                </button>
              </div>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200 bg-gray-50'>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Transaction ID
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
                    <th className='text-right py-4 px-6 text-sm font-semibold text-gray-700'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map(transaction => (
                    <tr
                      key={transaction.id}
                      className='border-b border-gray-100 hover:bg-gray-50'>
                      <td className='py-4 px-6 text-sm font-medium text-gray-900'>
                        {transaction.id}
                      </td>
                      <td className='py-4 px-6 text-sm text-gray-900'>
                        ${transaction.amount}
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
                      <td className='py-4 px-6 text-sm text-gray-500'>
                        {transaction.date}
                      </td>
                      <td className='py-4 px-6 text-right'>
                        <button className='text-gray-400 hover:text-gray-600'>
                          <svg
                            className='w-5 h-5'
                            fill='currentColor'
                            viewBox='0 0 20 20'>
                            <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
