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
import AnnouncementPage from "./pop-up/page";
import { SpeedInsights } from "@vercel/speed-insights/next";
import MobileSearch from "./mobilesearch/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daniel's Believe We Ensure - Premium E-commerce Store",
  description:
    "Discover premium products at Daniel's Believe We Ensure. Shop our curated collection with fast shipping, secure checkout, and exceptional customer service. Your trusted online shopping destination.",
  keywords:
    "ecommerce, online shopping, premium products, fast shipping, secure checkout, Daniel's store",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  authors: [{ name: "Daniel's Believe We Ensure" }],
  openGraph: {
    title: "Daniel's Believe We Ensure - Premium E-commerce Store",
    description:
      "Discover premium products with fast shipping and secure checkout. Your trusted online shopping destination.",
    type: "website",
    locale: "en_US",
    siteName: "Daniel's Believe We Ensure",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel's Believe We Ensure - Premium E-commerce Store",
    description:
      "Discover premium products with fast shipping and secure checkout.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <UserProvider>
          <ClearCategoriesClient />
          <TopBar />
          <Navbar />
          <MobileSearch />
          <AnnouncementPage />
          <Suspense fallback={<Loading />}>{children}</Suspense>
          <Footer />
          <div>
            <a
              href="https://wa.me/923324257764"
              target="_blank"
              className="whatsapp-float"
            >
              <img
                src="https://img.icons8.com/color/24/000000/whatsapp--v1.png"
                alt="WhatsApp"
              />
              <span className="body">Chatten Sie mit uns</span>
            </a>
          </div>
          <Toaster />
        </UserProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
