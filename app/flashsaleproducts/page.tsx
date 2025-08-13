import { Metadata } from "next";
import FlashSalePageClient from "./flash-sale-client";

export const metadata: Metadata = {
  title: "🔥 FLASH SALE - Bis zu 70% Rabatt | Daniel's Believe",
  description: "⚡ FLASH SALE bei Daniel's Believe! 🔥 Bis zu 70% RABATT auf Premium-Produkte ✨ Limitierte Zeit ⏰ Express-Versand 🚀 Sichere Zahlung 💳 Jetzt zuschlagen!",
  keywords: "Flash Sale, Blitzangebot, Rabatt, Sale, Angebot, Daniel's Believe, Online Shopping, Deutschland, Express-Versand, PayPal, Stripe, Premium Produkte",
  openGraph: {
    title: "🔥 FLASH SALE - Bis zu 70% Rabatt bei Daniel's Believe!",
    description: "⚡ Limitierte FLASH SALE Angebote! Bis zu 70% RABATT auf Premium-Produkte. Express-Versand & sichere Zahlung. Jetzt sparen!",
    type: "website",
    url: "https://www.danielsbelieve.de/flashsaleproducts",
    images: [
      {
        url: "https://www.danielsbelieve.de/logo.webp",
        width: 1200,
        height: 630,
        alt: "Daniel's Believe Flash Sale - Bis zu 70% Rabatt",
      },
    ],
    siteName: "Daniel's Believe",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "🔥 FLASH SALE - Bis zu 70% Rabatt | Daniel's Believe",
    description: "⚡ Limitierte FLASH SALE Angebote! 🔥 Premium-Produkte • 🚀 Express-Versand • 💳 Sichere Zahlung • Jetzt sparen!",
    images: ["https://www.danielsbelieve.de/logo.webp"],
  },
  alternates: {
    canonical: "https://www.danielsbelieve.de/flashsaleproducts",
  },
};

export default function FlashSalePage() {
  return <FlashSalePageClient />;
}
