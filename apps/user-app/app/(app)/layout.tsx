'use client';

import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider, SidebarTrigger } from '@repo/ui/components/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen bg-gray-50'>
      <SidebarProvider>
        <AppSidebar />
        <main className='flex-1 p-8'>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}