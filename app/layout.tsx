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
    default:
      "Daniel's Believe - Premium Online Shopping | Flash Sales & Fast Delivery Germany",
    template: "%s | Daniel's Believe",
  },
  description:
    "🛍️ Daniel's Believe - Deutschlands vertrauenswürdiger Online-Shop! ✨ Premium Produkte, Flash-Sale Deals, schnelle Lieferung & sichere Zahlung. PayPal ✓ Stripe ✓ Rechnung ✓ Express-Versand verfügbar!",
  keywords: [
    "Daniel's Believe",
    "Online Shop Deutschland",
    "E-Commerce Germany",
    "Flash Sale",
    "Blitzangebote",
    "schnelle Lieferung",
    "PayPal",
    "Stripe",
    "Rechnung",
    "Express Versand",
    "Premium Produkte",
    "danielsbelieve.de",
    "sichere Zahlung",
    "Kundenbewertungen",
    "24h Versand",
    "Deutschland Shopping",
    "Online Einkaufen",
  ].join(", "),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  authors: [{ name: "Daniel's Believe", url: "https://www.danielsbelieve.de" }],
  creator: "Daniel's Believe Team",
  publisher: "Daniel's Believe",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Daniel's Believe - Premium Online Shopping mit Flash Sales 🔥",
    description:
      "🛍️ Entdecke Premium Produkte bei Daniel's Believe! ⚡ Flash-Sale Deals, Express-Versand, sichere Zahlung & top Kundenbewertungen. Jetzt sparen!",
    type: "website",
    locale: "de_DE",
    url: "https://www.danielsbelieve.de",
    siteName: "Daniel's Believe",
    images: [
      {
        url: "https://www.danielsbelieve.de/logo.webp",
        width: 1200,
        height: 630,
        alt: "Daniel's Believe - Premium Online Shopping Deutschland",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@danielsbelieve",
    creator: "@danielsbelieve",
    title:
      "Daniel's Believe - Premium Online Shopping 🛍️ Flash Sales Deutschland",
    description:
      "⚡ Flash-Sale Deals • 🚀 Express-Versand • 💳 Sichere Zahlung (PayPal, Stripe, Rechnung) • ⭐ Top Bewertungen • Jetzt bei Daniel's Believe!",
    images: ["https://www.danielsbelieve.de/logo.webp"],
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
  alternates: {
    canonical: "https://www.danielsbelieve.de",
    languages: {
      "de-DE": "https://www.danielsbelieve.de",
      "en-US": "https://www.danielsbelieve.de/en",
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
    name: "Daniel's Believe",
    description:
      "Premium Online Shopping mit Flash Sales, Express-Versand und sicherer Zahlung in Deutschland",
    url: "https://www.danielsbelieve.de",
    logo: "https://www.danielsbelieve.de/logo.webp",
    sameAs: [
      "https://www.facebook.com/danielsbelieve",
      "https://www.instagram.com/danielsbelieve",
      "https://www.tiktok.com/@danielsbelieve",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+49-152-23815822",
      contactType: "customer service",
      email: "info@danielsbelieve.de",
      availableLanguage: ["German", "English"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "DE",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
    paymentAccepted: ["PayPal", "Stripe", "Credit Card", "Invoice"],
    priceRange: "€€",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "500",
    },
  };

  return (
    <html lang="de">
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
        content="🛍️ Daniel's Believe - Deutschlands vertrauenswürdiger Online-Shop! ✨ Premium Produkte, Flash-Sale Deals, schnelle Lieferung & sichere Zahlung. PayPal ✓ Stripe ✓ Rechnung ✓ Express-Versand verfügbar!"
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
        <SpeedInsights />
      </body>
    </html>
  );
}
