export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transfer/:path*',
    '/transactions/:path*',
    '/payments/:path*',
    '/account/:path*',
    '/settings/:path*',
  ],
};
