import { Metadata } from "next";
import FlashSalePageClient from "./flash-sale-client";

export const metadata: Metadata = {
  title: "🔥 Blitzangebote & Premium Online Shopping | Daniel's Believe",
  description: "Entdecke Blitzangebote und Premium-Produkte bei Daniel's Believe. Online Shopping und exklusive Services – alles aus einer Hand!",
  keywords: "Online Shopping, Blitzangebote, Premium Produkte, Daniel's Believe, Services, Dienstleistungen, Shop, Angebote, Deutschland",
  openGraph: {
    title: "Blitzangebote & Online Shopping | Daniel's Believe",
    description: "Jetzt Blitzangebote sichern! Daniel's Believe bietet Online Shopping und Services für dich – entdecke unsere Auswahl.",
    type: "website",
    url: "https://www.danielsbelieve.de/flashsaleproducts",
    images: [
      {
        url: "https://www.danielsbelieve.de/logo.webp",
        width: 1200,
        height: 630,
        alt: "Daniel's Believe Blitzangebote und Services",
      },
    ],
    siteName: "Daniel's Believe",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blitzangebote & Online Shopping | Daniel's Believe",
    description: "Blitzangebote und Premium-Produkte – Online Shopping & Services bei Daniel's Believe.",
    images: ["https://www.danielsbelieve.de/logo.webp"],
  },
  alternates: {
    canonical: "https://www.danielsbelieve.de/flashsaleproducts",
  },
};

export default function FlashSalePage() {
  return <FlashSalePageClient />;
}
