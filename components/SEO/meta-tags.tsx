"use client";

import Head from "next/head";

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  price?: number;
  currency?: string;
  availability?: "in stock" | "out of stock" | "limited stock";
  brand?: string;
  category?: string;
  productId?: string;
}

export default function MetaTags({
  title,
  description,
  keywords,
  image = "https://www.danielsbelieve.de/logo.webp",
  url,
  type = "website",
  price,
  currency = "EUR",
  availability = "in stock",
  brand,
  category,
  productId,
}: MetaTagsProps) {
  const siteUrl = "https://www.danielsbelieve.de";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  
  const defaultTitle = "Daniel's Believe - Premium Online Shopping Deutschland";
  const defaultDescription = "🛍️ Premium Produkte, Flash-Sale Deals, Express-Versand & sichere Zahlung bei Daniel's Believe! ⚡ PayPal ✓ Stripe ✓ Rechnung ✓";
  
  const metaTitle = title ? `${title} | Daniel's Believe` : defaultTitle;
  const metaDescription = description || defaultDescription;

  // Create structured data based on type
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === "product" ? "Product" : "WebPage",
      "name": metaTitle,
      "description": metaDescription,
      "url": fullUrl,
      "image": image,
    };

    if (type === "product" && price) {
      return {
        ...baseData,
        "@type": "Product",
        "brand": {
          "@type": "Brand",
          "name": brand || "Daniel's Believe"
        },
        "category": category,
        "sku": productId,
        "offers": {
          "@type": "Offer",
          "price": price,
          "priceCurrency": currency,
          "availability": `https://schema.org/${availability === "in stock" ? "InStock" : availability === "out of stock" ? "OutOfStock" : "LimitedAvailability"}`,
          "seller": {
            "@type": "Organization",
            "name": "Daniel's Believe"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "50"
        }
      };
    }

    return baseData;
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Daniel's Believe" />
      <meta property="og:locale" content="de_DE" />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@danielsbelieve" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />

      {/* Product-specific meta tags */}
      {type === "product" && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
          {brand && <meta property="product:brand" content={brand} />}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData()),
        }}
      />
    </Head>
  );
}
