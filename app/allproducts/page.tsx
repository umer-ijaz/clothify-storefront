import { Metadata } from "next";
import AllProductsPageClient from "./all-products-client";

export const metadata: Metadata = {
  title: "Alle Produkte - Premium Online Shopping | Daniel's Believe",
  description: "🛍️ Entdecke alle Premium-Produkte bei Daniel's Believe! ✨ Große Auswahl, faire Preise, Express-Versand 🚀 PayPal ✓ Stripe ✓ Rechnung ✓ Sichere Zahlung & Top Bewertungen!",
  keywords: "Alle Produkte, Premium Produkte, Online Shopping, Daniel's Believe, Deutschland, Express-Versand, PayPal, Stripe, Rechnung, sichere Zahlung, Kundenbewertungen",
  openGraph: {
    title: "Alle Produkte - Premium Online Shopping bei Daniel's Believe",
    description: "🛍️ Entdecke alle Premium-Produkte! Große Auswahl, Express-Versand & sichere Zahlung. Jetzt bei Daniel's Believe shoppen!",
    type: "website",
    url: "https://www.danielsbelieve.de/allproducts",
    images: [
      {
        url: "https://www.danielsbelieve.de/logo.webp",
        width: 1200,
        height: 630,
        alt: "Daniel's Believe - Alle Premium Produkte",
      },
    ],
    siteName: "Daniel's Believe",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alle Produkte - Premium Shopping | Daniel's Believe",
    description: "🛍️ Premium-Produkte • 🚀 Express-Versand • 💳 Sichere Zahlung • ⭐ Top Bewertungen • Jetzt shoppen!",
    images: ["https://www.danielsbelieve.de/logo.webp"],
  },
  alternates: {
    canonical: "https://www.danielsbelieve.de/allproducts",
  },
};

export default function AllProductsPage() {
  return <AllProductsPageClient />;
}
