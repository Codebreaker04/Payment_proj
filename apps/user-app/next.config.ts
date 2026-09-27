import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/recoil'],
  // user.Dockerfile copies .next/standalone and runs
  // `node apps/user-app/server.js`, so standalone output is required.
  output: 'standalone',
};

export default nextConfig;
