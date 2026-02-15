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

export default function AccountPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

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
          <h1 className='text-3xl font-bold mb-8 text-gray-900'>Account</h1>

          {/* Profile Section */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Profile Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className='px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className='flex items-center gap-6 mb-6'>
              <div className='w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold'>
                U
              </div>
              <div>
                <h3 className='text-xl font-semibold text-gray-900'>
                  John Doe
                </h3>
                <p className='text-gray-600'>john.doe@example.com</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Full Name
                </label>
                <input
                  type='text'
                  defaultValue='John Doe'
                  disabled={!isEditing}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  defaultValue='john.doe@example.com'
                  disabled={!isEditing}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Phone
                </label>
                <input
                  type='tel'
                  defaultValue='+1 234 567 8900'
                  disabled={!isEditing}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Country
                </label>
                <input
                  type='text'
                  defaultValue='United States'
                  disabled={!isEditing}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
                />
              </div>
            </div>

            {isEditing && (
              <div className='mt-6 flex gap-3'>
                <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'>
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Account Details */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6'>
              Account Details
            </h2>
            <div className='space-y-4'>
              <div className='flex justify-between py-3 border-b border-gray-100'>
                <span className='text-gray-600'>Account Number</span>
                <span className='font-medium text-gray-900'>1234567890</span>
              </div>
              <div className='flex justify-between py-3 border-b border-gray-100'>
                <span className='text-gray-600'>Account Type</span>
                <span className='font-medium text-gray-900'>Premium</span>
              </div>
              <div className='flex justify-between py-3 border-b border-gray-100'>
                <span className='text-gray-600'>Member Since</span>
                <span className='font-medium text-gray-900'>January 2025</span>
              </div>
              <div className='flex justify-between py-3'>
                <span className='text-gray-600'>Status</span>
                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
