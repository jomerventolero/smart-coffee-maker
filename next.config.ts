import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for S3 deployment
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Configure trailing slashes for better S3 compatibility
  trailingSlash: true,
  
  // Ensure proper asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX || '' : '',
};

export default nextConfig;

