'use client';

import { ReactNode, useState, useEffect } from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href: string;
  badge?: string | number;
}

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  items?: SidebarItem[];
  sections?: SidebarSection[];
  logo?: ReactNode;
  logoText?: string;
  currentPath?: string;
  onNavigate?: (href: string) => void;
  footer?: ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
  showSearch?: boolean;
}

export const Sidebar = ({
  items = [],
  sections = [],
  logo,
  logoText = 'PayPro',
  currentPath = '',
  onNavigate,
  footer,
  className = '',
  defaultCollapsed = false,
  showSearch = false,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [currentPath]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const handleItemClick = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
    setIsMobileOpen(false);
  };

  const SidebarContent = ({
    isMobileView = false,
  }: {
    isMobileView?: boolean;
  }) => {
    const showCollapsed = !isMobileView && isCollapsed;

    return (
      <>
        {/* Logo Section */}
        <div className='flex items-center gap-3 p-4 border-b border-gray-200'>
          <div className='flex items-center gap-3 overflow-hidden'>
            {logo && !showCollapsed && (
              <div className='flex-shrink-0'>{logo}</div>
            )}
            {!showCollapsed && (
              <span className='text-xl font-bold text-gray-800 whitespace-nowrap'>
                {logoText}
              </span>
            )}
          </div>
          {/* Desktop collapse toggle - only show on desktop */}
          {!isMobileView && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className='flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ml-auto'
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>
          )}
          {/* Mobile close button */}
          {isMobileView && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className='flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ml-auto'
              aria-label='Close menu'>
              <svg
                className='w-5 h-5 text-gray-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search Bar */}
        {showSearch && !showCollapsed && (
          <div className='p-4 border-b border-gray-200'>
            <div className='relative'>
              <svg
                className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
              <input
                type='text'
                placeholder='Search'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
              />
              <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400'>
                ⌘F
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className='flex-1 overflow-y-auto p-4 space-y-1'>
          {sections.length > 0
            ? // Render sections with Headers
              sections.map(section => (
                <div key={section.id} className='mb-6'>
                  {!isCollapsed && (
                    <div className='flex items-center justify-between mb-2 px-4'>
                      <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                        {section.title}
                      </h3>
                      <button className='text-gray-400 hover:text-gray-600'>
                        <svg
                          className='w-4 h-4'
                          fill='currentColor'
                          viewBox='0 0 20 20'>
                          <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className='space-y-1'>
                    {section.items.map(item => {
                      const isActive =
                        currentPath === item.href ||
                        currentPath.startsWith(item.href + '/');
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item.href)}
                          className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200 group relative
                        ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                          title={isCollapsed ? item.label : undefined}>
                          {/* Icon */}
                          {item.icon && (
                            <div
                              className={`flex-shrink-0 w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                              {item.icon}
                            </div>
                          )}

                          {/* Label */}
                          {!isCollapsed && (
                            <span className='flex-1 text-left truncate text-sm'>
                              {item.label}
                            </span>
                          )}

                          {/* Badge */}
                          {!isCollapsed && item.badge && (
                            <span className='px-2 py-0.5 text-xs font-semibold rounded bg-gray-200 text-gray-700'>
                              {item.badge}
                            </span>
                          )}

                          {/* Tooltip for collapsed state */}
                          {isCollapsed && (
                            <div className='absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none'>
                              {item.label}
                              {item.badge && (
                                <span className='ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500'>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            : // Render flat items for backward compatibility
              items.map(item => {
                const isActive =
                  currentPath === item.href ||
                  currentPath.startsWith(item.href + '/');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.href)}
                    className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 group relative
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                    title={isCollapsed ? item.label : undefined}>
                    {/* Icon */}
                    {item.icon && (
                      <div
                        className={`flex-shrink-0 w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                        {item.icon}
                      </div>
                    )}

                    {/* Label */}
                    {!isCollapsed && (
                      <span className='flex-1 text-left truncate text-sm'>
                        {item.label}
                      </span>
                    )}

                    {/* Badge */}
                    {!isCollapsed && item.badge && (
                      <span className='px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white'>
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className='absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none'>
                        {item.label}
                        {item.badge && (
                          <span className='ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500'>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
        </nav>

        {/* Footer */}
        {footer && (
          <div
            className={`p-4 border-t border-gray-200 ${
              showCollapsed ? 'flex justify-center' : ''
            }`}>
            {footer}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className='lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors border border-gray-200'
        aria-label='Open menu'>
        <svg
          className='w-6 h-6 text-gray-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 6h16M4 12h16M4 18h16'
          />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity'
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col
          fixed left-0 top-0 h-screen
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out z-30
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${className}
        `}>
        <SidebarContent isMobileView={false} />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden flex flex-col
          fixed left-0 top-0 h-screen w-64
          bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out z-50
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className}
        `}>
        <SidebarContent isMobileView={true} />
      </aside>

      {/* Spacer for desktop layout */}
      <div
        className={`hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
      />
    </>
  );
};

// Optional: Export individual icon components for convenience
export const HomeIcon = () => (
  <svg
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    className='w-full h-full'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    />
  </svg>
);

export const DashboardIcon = () => (
  <svg
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    className='w-full h-full'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    />
  </svg>
);

export const TransferIcon = () => (
  <svg
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    className='w-full h-full'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
    />
  </svg>
);

export const TransactionsIcon = () => (
  <svg
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    className='w-full h-full'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
    />
  </svg>
);

export const SettingsIcon = () => (
  <svg
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    className='w-full h-full'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    />
  </svg>
);

export const PaymentsIcon = () => (
  <svg
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    className='w-full h-full'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
    />
  </svg>
);

export const UsersIcon = () => (
  <svg
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    className='w-full h-full'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    />
  </svg>
);

export const LogoutIcon = () => (
  <svg
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    className='w-full h-full'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
    />
  </svg>
);
