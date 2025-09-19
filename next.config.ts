import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://firebasestorage.googleapis.com/**'),
    {
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com',
      pathname: '**',
    }
    ],
    qualities: [10, 20, 50, 75],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
