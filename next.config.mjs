import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/_offline',
  },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Cache de páginas del dashboard (navegación)
      {
        urlPattern: /^https?:\/\/.*\/dashboard(\/.*)?$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'dashboard-pages',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      // Cache de llamadas a Supabase (GET)
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          networkTimeoutSeconds: 8,
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
        },
      },
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/**',
      },
    ],
  },
}

export default withPWA(nextConfig)
