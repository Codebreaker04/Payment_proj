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

export default function TransferPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferMethod, setTransferMethod] = useState('instant');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const recentRecipients = [
    { id: '101', name: 'John Doe', avatar: 'JD' },
    { id: '102', name: 'Sarah Smith', avatar: 'SS' },
    { id: '103', name: 'Mike Johnson', avatar: 'MJ' },
    { id: '104', name: 'Emily Davis', avatar: 'ED' },
  ];

  const recentTransfers = [
    {
      id: 'TXN-001',
      recipient: 'John Doe',
      amount: 500,
      date: '2026-02-14',
      status: 'Completed',
    },
    {
      id: 'TXN-002',
      recipient: 'Sarah Smith',
      amount: 150,
      date: '2026-02-13',
      status: 'Completed',
    },
    {
      id: 'TXN-003',
      recipient: 'Mike Johnson',
      amount: 300,
      date: '2026-02-12',
      status: 'Completed',
    },
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiverId || !amount) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Amount must be greater than 0' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({
        type: 'success',
        text: 'Transfer successful!',
      });
      setReceiverId('');
      setAmount('');
      setDescription('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
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
            Transfer Money
          </h1>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Main Transfer Form */}
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                  Send Money
                </h2>

                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* Recipient */}
                  <div>
                    <label
                      htmlFor='receiverId'
                      className='block text-sm font-medium text-gray-700 mb-2'>
                      Recipient User ID *
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <svg
                          className='h-5 w-5 text-gray-400'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                          />
                        </svg>
                      </div>
                      <input
                        id='receiverId'
                        type='text'
                        value={receiverId}
                        onChange={e => setReceiverId(e.target.value)}
                        className='w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter recipient user ID'
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label
                      htmlFor='amount'
                      className='block text-sm font-medium text-gray-700 mb-2'>
                      Amount *
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <span className='text-gray-500 text-lg font-semibold'>
                          $
                        </span>
                      </div>
                      <input
                        id='amount'
                        type='number'
                        step='0.01'
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className='w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold'
                        placeholder='0.00'
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Transfer Method */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-3'>
                      Transfer Method
                    </label>
                    <div className='grid grid-cols-2 gap-4'>
                      <button
                        type='button'
                        onClick={() => setTransferMethod('instant')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          transferMethod === 'instant'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              transferMethod === 'instant'
                                ? 'border-blue-500'
                                : 'border-gray-300'
                            }`}>
                            {transferMethod === 'instant' && (
                              <div className='w-3 h-3 rounded-full bg-blue-500' />
                            )}
                          </div>
                          <div className='text-left'>
                            <p className='font-semibold text-gray-900'>
                              Instant
                            </p>
                            <p className='text-xs text-gray-500'>Fee: $1.50</p>
                          </div>
                        </div>
                      </button>
                      <button
                        type='button'
                        onClick={() => setTransferMethod('standard')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          transferMethod === 'standard'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              transferMethod === 'standard'
                                ? 'border-blue-500'
                                : 'border-gray-300'
                            }`}>
                            {transferMethod === 'standard' && (
                              <div className='w-3 h-3 rounded-full bg-blue-500' />
                            )}
                          </div>
                          <div className='text-left'>
                            <p className='font-semibold text-gray-900'>
                              Standard
                            </p>
                            <p className='text-xs text-gray-500'>
                              Free (1-3 days)
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor='description'
                      className='block text-sm font-medium text-gray-700 mb-2'>
                      Description (Optional)
                    </label>
                    <textarea
                      id='description'
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder="What's this for?"
                      rows={3}
                      disabled={loading}
                    />
                  </div>

                  {/* Message */}
                  {message && (
                    <div
                      className={`p-4 rounded-lg flex items-center gap-3 ${
                        message.type === 'success'
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                      {message.type === 'success' ? (
                        <svg
                          className='w-5 h-5 text-green-600'
                          fill='currentColor'
                          viewBox='0 0 20 20'>
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                      ) : (
                        <svg
                          className='w-5 h-5 text-red-600'
                          fill='currentColor'
                          viewBox='0 0 20 20'>
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                      <p
                        className={
                          message.type === 'success'
                            ? 'text-green-800'
                            : 'text-red-800'
                        }>
                        {message.text}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type='submit'
                    disabled={loading}
                    className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'>
                    {loading ? (
                      <>
                        <svg
                          className='animate-spin h-5 w-5 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'>
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                          />
                        </svg>
                        Send Money
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Recent Transfers */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
                <div className='p-6 border-b border-gray-200'>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Recent Transfers
                  </h2>
                </div>
                <div className='divide-y divide-gray-100'>
                  {recentTransfers.map(transfer => (
                    <div
                      key={transfer.id}
                      className='p-4 hover:bg-gray-50 transition-colors'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                            <span className='text-blue-600 font-semibold text-sm'>
                              {transfer.recipient
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </span>
                          </div>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {transfer.recipient}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {transfer.date}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-gray-900'>
                            -${transfer.amount}
                          </p>
                          <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            {transfer.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className='space-y-6'>
              {/* Balance Card */}
              <div className='bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm p-6 text-white'>
                <p className='text-blue-100 text-sm mb-2'>Available Balance</p>
                <p className='text-3xl font-bold mb-4'>$12,500.00</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className='w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-medium transition-colors'>
                  View Details
                </button>
              </div>

              {/* Quick Contacts */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h3 className='font-semibold text-gray-900 mb-4'>
                  Recent Recipients
                </h3>
                <div className='space-y-3'>
                  {recentRecipients.map(recipient => (
                    <button
                      key={recipient.id}
                      onClick={() => setReceiverId(recipient.id)}
                      className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left'>
                      <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                        <span className='text-gray-700 font-semibold text-sm'>
                          {recipient.avatar}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900 text-sm'>
                          {recipient.name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          ID: {recipient.id}
                        </p>
                      </div>
                      <svg
                        className='w-5 h-5 text-gray-400'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transfer Info */}
              <div className='bg-blue-50 rounded-lg border border-blue-200 p-4'>
                <div className='flex gap-3'>
                  <svg
                    className='w-5 h-5 text-blue-600 shrink-0 mt-0.5'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <div>
                    <p className='text-sm font-medium text-blue-900 mb-1'>
                      Transfer Tips
                    </p>
                    <ul className='text-xs text-blue-800 space-y-1'>
                      <li>• Instant transfers arrive within minutes</li>
                      <li>• Standard transfers are free</li>
                      <li>• Double-check recipient ID</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
