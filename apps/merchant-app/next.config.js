/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@repo/database', '@repo/recoil'],
};

export default nextConfig;
