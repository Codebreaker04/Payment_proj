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

export default function PaymentsPage() {
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

  const mockPayments = [
    {
      id: 'PAY-001',
      recipient: 'Electric Company',
      amount: 150,
      method: 'Bank Transfer',
      status: 'Completed',
      date: '2026-02-15',
    },
    {
      id: 'PAY-002',
      recipient: 'Internet Provider',
      amount: 80,
      method: 'Credit Card',
      status: 'Completed',
      date: '2026-02-14',
    },
    {
      id: 'PAY-003',
      recipient: 'Water Department',
      amount: 45,
      method: 'Bank Transfer',
      status: 'Pending',
      date: '2026-02-13',
    },
    {
      id: 'PAY-004',
      recipient: 'Amazon',
      amount: 250,
      method: 'Credit Card',
      status: 'Completed',
      date: '2026-02-12',
    },
    {
      id: 'PAY-005',
      recipient: 'Netflix',
      amount: 15,
      method: 'Credit Card',
      status: 'Completed',
      date: '2026-02-10',
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
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
          <h1 className='text-3xl font-bold mb-8 text-gray-900'>
            Payment History
          </h1>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
              <h3 className='text-sm font-medium text-gray-600 mb-2'>
                Total Payments
              </h3>
              <p className='text-3xl font-bold text-gray-900'>$540</p>
              <p className='text-sm text-gray-500 mt-2'>This month</p>
            </div>
            <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
              <h3 className='text-sm font-medium text-gray-600 mb-2'>
                Pending
              </h3>
              <p className='text-3xl font-bold text-yellow-600'>$45</p>
              <p className='text-sm text-gray-500 mt-2'>1 payment</p>
            </div>
            <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
              <h3 className='text-sm font-medium text-gray-600 mb-2'>
                Completed
              </h3>
              <p className='text-3xl font-bold text-green-600'>$495</p>
              <p className='text-sm text-gray-500 mt-2'>4 payments</p>
            </div>
          </div>

          {/* Payments Table */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Recent Payments
              </h2>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200 bg-gray-50'>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Payment ID
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Recipient
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Amount
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Payment Method
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Status
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-700'>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockPayments.map(payment => (
                    <tr
                      key={payment.id}
                      className='border-b border-gray-100 hover:bg-gray-50'>
                      <td className='py-4 px-6 text-sm font-medium text-gray-900'>
                        {payment.id}
                      </td>
                      <td className='py-4 px-6 text-sm text-gray-900'>
                        {payment.recipient}
                      </td>
                      <td className='py-4 px-6 text-sm font-medium text-gray-900'>
                        ${payment.amount.toLocaleString()}
                      </td>
                      <td className='py-4 px-6 text-sm text-gray-600'>
                        {payment.method}
                      </td>
                      <td className='py-4 px-6'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className='py-4 px-6 text-sm text-gray-600'>
                        {payment.date}
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
