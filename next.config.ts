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
    ignoreDuringBuilds: true, // ✅ Disables ESLint in Next.js builds
  },
  images: {
    domains: [
      "v0.blob.com",
      "picsum.photos",
      "images.unsplash.com",
      "firebasestorage.googleapis.com", // ✅ Added for Firebase images
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/**",
      },
    ],
    // Increase timeout for image optimization
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add timeout and memory configurations
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    loader: 'default',
    // Increase timeouts
    unoptimized: false,
  },
  // Add experimental features for better image handling
  experimental: {
    serverActions: {
      allowedOrigins: ["firebasestorage.googleapis.com"],
    },
  },
};

export default nextConfig;
