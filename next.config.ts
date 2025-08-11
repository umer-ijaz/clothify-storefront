import type { NextConfig } from "next";
import BundleAnalyzer from "@next/bundle-analyzer";

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
    useCache: true,
    serverActions: {
      allowedOrigins: ["firebasestorage.googleapis.com"],
    },
  },
};

// const withBundleAnalyzer = BundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// });

export default nextConfig;
