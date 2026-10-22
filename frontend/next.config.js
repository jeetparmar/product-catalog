// Browser calls /api/* on the Next.js origin; Next proxies to Spring Boot (no CORS setup needed).
const backend = process.env.BACKEND_URL || 'http://localhost:8080';

/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { proxyTimeout: 180000 }, // seeding 500k rows can take a while
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${backend}/api/:path*` }];
  },
};
