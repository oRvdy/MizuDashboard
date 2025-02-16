/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react', 'react-icons']
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    domains: ['cdn.discordapp.com', 'mc-heads.net'],
    unoptimized: true
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true
}

module.exports = nextConfig
