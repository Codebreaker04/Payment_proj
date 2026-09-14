'use client';

import { AppSidebar } from '@/components/sidebar';
import { PageHeader } from '@/components/page-header';
import { SidebarProvider } from '@repo/ui/components/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen bg-gray-50'>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '12rem',
            '--sidebar-width-mobile': '15rem',
          } as React.CSSProperties
        }>
        <AppSidebar />
        <main className='flex-1 px-8 pt-3 pb-8'>
          <PageHeader />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}

