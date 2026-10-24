/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.API_PROXY_TARGET || 'http://127.0.0.1:3000'}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
