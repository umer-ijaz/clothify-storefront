import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import TopBar from "@/components/TopBar";
import { Suspense } from "react";
import Loading from "./loading"; // Import global loading UI
import { UserProvider } from "@/context/userContext";
import ClearCategoriesClient from "@/components/clearCategory";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClientProviders from "@/components/client-provider";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Daniel's Believe - Premium Online Shopping | Flash Sales & Fast Delivery Pakistan",
    template: "%s | Daniel's Believe"
  },
  description:
    "🛍️ Daniel's Believe - Premium Online Shopping and Services! ✨ Discover high-quality products, flash deals, and exclusive services in Pakistan!",
  keywords: [
    "Daniel's Believe",
    "Online Shopping Pakistan",
    "Premium Products",
    "Services",
    "Flash Deals",
    "Online Shop",
    "E-Commerce Pakistan",
    "danielsbelieve.com",
    "Pakistan Shopping",
    "Online Shopping",
    "Service Offers"
  ].join(", "),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  authors: [{ name: "Daniel's Believe", url: "https://www.danielsbelieve.com" }],
  creator: "Daniel's Believe Team",
  publisher: "Daniel's Believe",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Daniel's Believe - Premium Online Shopping & Services 🛍️",
    description:
      "🛍️ Discover Premium Products and Services at Daniel's Believe! ⚡ Flash deals, Online Shopping, and exclusive services.",
    type: "website",
    locale: "en_US",
    url: "https://www.danielsbelieve.com",
    siteName: "Daniel's Believe",
    images: [
      {
        url: "https://www.danielsbelieve.com/logo.webp",
        width: 1200,
        height: 630,
        alt: "Daniel's Believe - Premium Online Shopping Pakistan"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@danielsbelieve",
    creator: "@danielsbelieve",
    title: "Daniel's Believe - Online Shopping & Services 🛍️",
    description:
      "⚡ Premium Products • 🛍️ Online Shopping • 🔧 Services • 🎯 Flash Deals • Discover now at Daniel's Believe!",
    images: ["https://www.danielsbelieve.com/logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your actual Google Search Console verification code
  },
  alternates: {
    canonical: "https://www.danielsbelieve.com",
    languages: {
      "en-US": "https://www.danielsbelieve.com",
    },
  },
  category: "E-Commerce",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "Daniel's Believe",
    "description": "Premium Online Shopping with Flash Sales, Express Delivery, and Secure Payment in Pakistan",
    "url": "https://www.danielsbelieve.com",
    "logo": "https://www.danielsbelieve.com/logo.webp",
    "sameAs": [
      "https://www.facebook.com/danielsbelieve",
      "https://www.instagram.com/danielsbelieve",
      "https://www.tiktok.com/@danielsbelieve"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-300-1234567", // Update with actual number if available, otherwise kept placeholder format
      "contactType": "customer service",
      "email": "info@danielsbelieve.com",
      "availableLanguage": ["English", "Urdu"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PK"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "PKR",
      "availability": "https://schema.org/InStock"
    },
    "paymentAccepted": ["PayPal", "Stripe", "Card", "Cash on Delivery"],
    "priceRange": "Rs",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <meta
        name="description"
        content="🛍️ Daniel's Believe - Pakistan's trusted Online Shop! ✨ Premium Products, Flash Sale Deals, Fast Delivery & Secure Payment. PayPal ✓ Stripe ✓ Express Delivery available!"
      ></meta>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <UserProvider>
          <ClearCategoriesClient />
          <TopBar />
          <Navbar />
          <ClientProviders>
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </ClientProviders>
          <Footer />
          <Toaster />
        </UserProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
