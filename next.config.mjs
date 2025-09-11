/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['api.leonardo.ai', 'cdn.leonardo.ai'],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'writeourheart.com', '*.vercel.app'],
    },
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/html; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' https://api.v0.dev https://cdn.jsdelivr.net https://*.pusher.com;
              connect-src 'self' https://api.v0.dev https://baqnsdpdqhvvqlepydlm.supabase.co https://api.stripe.com https://api.brevo.com;
              img-src 'self' data: https://*.supabase.co;
              style-src 'self' 'unsafe-inline';
              font-src 'self' https://*.vusercontent.net;
              frame-src 'self' https://js.stripe.com;
            `,
          },
        ],
      },
    ];
  },
}

export default nextConfig
