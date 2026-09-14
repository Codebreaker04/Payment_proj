'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@repo/ui/components/sidebar';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/transfer': 'Transfer Money',
  '/payments': 'Payment History',
  '/account': 'Account',
  '/settings': 'Settings',
};

export function PageHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'PayPro';

  return (
    <div className='mb-6 flex items-center gap-3'>
      <SidebarTrigger />
      <h1 className='text-4xl font-semibold tracking-tight text-gray-900'>
        {title}
      </h1>
    </div>
  );
}

