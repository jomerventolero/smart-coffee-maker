/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Enables static export
  output: 'export',

  // ✅ Required for static hosting
  images: { unoptimized: true },

  // ✅ Keeps URLs consistent for Android or file:// usage
  trailingSlash: true,

  // ✅ Asset prefix fix for static export
  // Must start with a slash, NOT './'
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : undefined,

  // Optional environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
