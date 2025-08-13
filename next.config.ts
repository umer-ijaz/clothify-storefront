import type { NextConfig } from "next";
import BundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  webpack(config, { dev, isServer }) {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Firebase chunk
            firebase: {
              name: 'firebase',
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              chunks: 'all',
              priority: 10,
            },
            // PayPal chunk
            paypal: {
              name: 'paypal',
              test: /[\\/]node_modules[\\/](@paypal)[\\/]/,
              chunks: 'all',
              priority: 10,
            },
            // Stripe chunk
            stripe: {
              name: 'stripe',
              test: /[\\/]node_modules[\\/](@stripe|stripe)[\\/]/,
              chunks: 'all',
              priority: 10,
            },
            // UI Library chunk
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              chunks: 'all',
              priority: 9,
            },
            // React chunk
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              chunks: 'all',
              priority: 8,
            },
            // Commons
            commons: {
              name: 'commons',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
    }

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
