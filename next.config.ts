import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["firebasestorage.googleapis.com"],
    },
  },
};

export default nextConfig;
