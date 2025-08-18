import { Metadata } from "next";
import AllProductsPageClient from "./all-products-client";

export const metadata: Metadata = {
  title: "Alle Produkte - Premium Online Shopping | Daniel's Believe",
  description: "🛍️ Entdecke alle Premium-Produkte bei Daniel's Believe! ✨ Große Auswahl an hochwertigen Produkten und Services für jeden Bedarf.",
  keywords: "Alle Produkte, Premium Produkte, Online Shopping, Daniel's Believe, Services, Dienstleistungen, Deutschland, Shop",
  openGraph: {
    title: "Alle Produkte - Premium Online Shopping bei Daniel's Believe",
    description: "🛍️ Entdecke alle Premium-Produkte! Große Auswahl und Services bei Daniel's Believe.",
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
    description: "🛍️ Premium-Produkte • � Services • �️ Online Shopping • Jetzt bei Daniel's Believe!",
    images: ["https://www.danielsbelieve.de/logo.webp"],
  },
  alternates: {
    canonical: "https://www.danielsbelieve.de/allproducts",
  },
};

export default function AllProductsPage() {
  return <AllProductsPageClient />;
}
