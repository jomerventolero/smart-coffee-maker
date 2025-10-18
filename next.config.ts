import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure trailing slashes for better S3 compatibility
  trailingSlash: true,
  
  // Ensure proper asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX || '' : '',
};

export default nextConfig;

