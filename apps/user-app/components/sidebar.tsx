'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftRight,
  HandCoins,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Wallet,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@repo/ui/components/sidebar';

type SidebarItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type SidebarSection = {
  id: string;
  label: string;
  items: SidebarItem[];
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: 'menu',
    label: 'Menu',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
      { href: '/transfer', label: 'Transfer Money', icon: HandCoins },
      { href: '/payments', label: 'Payment History', icon: History },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { href: '/account', label: 'Account', icon: UserRound },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        {
          <a
            href='/dashboard'
            className='flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent'>
            <Wallet className='size-10 shrink-0 text-sidebar-foreground' />
            <span className='text-3xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden'>
              PayPro
            </span>
          </a>
        }
      </SidebarHeader>
      <SidebarContent>
        {SIDEBAR_SECTIONS.map(section => (
          <SidebarGroup key={section.id}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      size='lg'
                      isActive={pathname === href}
                      tooltip={label}
                      render={<a href={href} />}>
                      <Icon />
                      <span className='text-lg font-semibold'>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarSeparator />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Sign out'
              render={<Link href='/api/auth/signout' />}>
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

