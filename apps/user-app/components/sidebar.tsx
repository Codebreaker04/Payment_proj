'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/lib/api';
import {
  ArrowLeftRight,
  ChevronsUpDownIcon,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@repo/ui/components/sidebar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';

import { Avatar, AvatarFallback } from '@repo/ui/components/avatar';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog';

import { toast } from '@repo/ui/components/toast';

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

function initialsOf(name: string) {
  const parts = name.trim().replace(/\s+/g, ' ').split(' ');
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase() || 'U';
}

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name ?? session?.user?.email ?? 'User';
  const userEmail = session?.user?.email ?? '';
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    setLogoutOpen(false);

    // Revoke the backend token before clearing the NextAuth cookie.
    // Fire-and-forget: local sign-out proceeds even if the backend is
    // unreachable (the token then dies at its 15-day expiry anyway).
    const token = session?.accessToken;
    if (token) {
      void fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    toast.add({ type: 'success', title: 'Logged out successfully' });

    void signOut({ redirect: true, callbackUrl: 'localhost:3002/auth/logout' });
  };

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              className='group-data-[collapsible=icon]:justify-center gap-2'
              render={<Link href='/dashboard' />}>
              <Wallet style={{ width: '1.9rem', height: '1.9rem' }} />
              <span className='text-3xl font-bold tracking-tight [font-family:var(--font-brand)] group-data-[collapsible=icon]:hidden'>
                Pay<span className='text-primary'>Pro</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {SIDEBAR_SECTIONS.map(section => (
          <SidebarGroup key={section.id}>
            <SidebarGroupLabel className='text-md font-semibold text-sidebar-foreground/60'>
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={pathname === href}
                      tooltip={label}
                      size='lg'
                      className='group-data-[collapsible=icon]:justify-center'
                      render={<a href={href} />}>
                      <Icon />
                      <span className='text-base font-medium group-data-[collapsible=icon]:hidden'>
                        {label}
                      </span>
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
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size='lg'
                    className='group-data-[collapsible=icon]:justify-center'
                  />
                }>
                <Avatar
                  size='lg'
                  className='shrink-0 group-data-[collapsible=icon]:size-8'>
                  <AvatarFallback className='bg-sidebar-accent font-semibold text-sidebar-accent-foreground'>
                    {initialsOf(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className='flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden'>
                  <span className='w-full truncate text-sm font-semibold text-sidebar-foreground'>
                    {userName}
                  </span>
                  <span className='w-full truncate text-xs text-sidebar-foreground/60'>
                    {userEmail}
                  </span>
                </div>
                <ChevronsUpDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent side='right'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm font-semibold'>
                        {userName}
                      </span>
                      <span className='truncate text-xs font-normal'>
                        {userEmail}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href='/account' />}>
                  <UserRound />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href='/settings' />}>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant='destructive'
                  onClick={() => setLogoutOpen(true)}>
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Log out of PayPro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll need to sign back in to access your wallet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant='destructive'
                    onClick={handleLogout}>
                    Log out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

