'use client';

import { FormEvent, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@repo/ui/sidebar';
import { api, Transaction } from '@/lib/api';
import { getSidebarSections } from '@/lib/sidebar';

function toIdempotencyKey() {
  return `p2p_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function TransferPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [receiverUserId, setReceiverUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentTransfers, setRecentTransfers] = useState<Transaction[]>([]);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const recentTransfersCount = recentTransfers?.length ?? 0;
  const sidebarSections = getSidebarSections(recentTransfersCount);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    void (async () => {
      try {
        const response = await api.getTransactions(userId, 5, 0);
        setRecentTransfers(
          Array.isArray(response.transactions) ? response.transactions : [],
        );
      } catch {
        setRecentTransfers([]);
      }
    })();
  }, [session?.user?.id]);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const senderUserId = session?.user?.id;
    if (!senderUserId) {
      setMessage({ type: 'error', text: 'Session not found. Please sign in again.' });
      return;
    }

    if (!receiverUserId || !amount) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setMessage({ type: 'error', text: 'Amount must be greater than 0.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await api.sendP2PTransaction({
        senderUserId,
        receiverUserId,
        amount: parsedAmount,
        description: description || undefined,
        idempotencyKey: toIdempotencyKey(),
      });

      setMessage({
        type: 'success',
        text: `${response.message} (Ref: ${response.transaction.referenceId})`,
      });
      setReceiverUserId('');
      setAmount('');
      setDescription('');

      const latest = await api.getTransactions(senderUserId, 5, 0);
      setRecentTransfers(
        Array.isArray(latest.transactions) ? latest.transactions : [],
      );
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Transfer failed';
      setMessage({ type: 'error', text });
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

      <main className='flex-1 p-8'>
        <h1 className='text-3xl font-bold mb-6 text-gray-900'>Transfer Money</h1>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <section className='lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6'>Send Money</h2>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label htmlFor='receiverUserId' className='block text-sm font-medium mb-2'>
                  Receiver User ID
                </label>
                <input
                  id='receiverUserId'
                  type='text'
                  value={receiverUserId}
                  onChange={e => setReceiverUserId(e.target.value)}
                  disabled={loading}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                  placeholder='Enter receiver user id'
                />
              </div>

              <div>
                <label htmlFor='amount' className='block text-sm font-medium mb-2'>
                  Amount
                </label>
                <input
                  id='amount'
                  type='number'
                  step='0.01'
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={loading}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                  placeholder='0.00'
                />
              </div>

              <div>
                <label htmlFor='description' className='block text-sm font-medium mb-2'>
                  Description
                </label>
                <textarea
                  id='description'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                  placeholder='Optional'
                />
              </div>

              {message && (
                <p
                  className={`rounded-lg px-3 py-2 text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                  {message.text}
                </p>
              )}

              <button
                type='submit'
                disabled={loading}
                className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400'>
                {loading ? 'Processing...' : 'Send Money'}
              </button>
            </form>
          </section>

          <aside className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h3 className='font-semibold text-gray-900 mb-4'>Recent Transfers</h3>
            {recentTransfersCount === 0 ? (
              <p className='text-sm text-gray-500'>No transfers found.</p>
            ) : (
              <div className='space-y-3'>
                {recentTransfers.map(tx => (
                  <div key={tx.id} className='border border-gray-200 rounded-lg p-3'>
                    <p className='text-sm font-medium text-gray-900 truncate'>{tx.id}</p>
                    <p className='text-sm text-gray-600'>${tx.amount.toLocaleString()}</p>
                    <p className='text-xs text-gray-500'>{tx.createdAt.split('T')[0]}</p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
