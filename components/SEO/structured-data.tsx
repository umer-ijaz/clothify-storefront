"use client";

interface StructuredDataProps {
  type: "Organization" | "Product" | "LocalBusiness" | "WebSite" | "BreadcrumbList";
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generateStructuredData = () => {
    const baseContext = {
      "@context": "https://schema.org",
      "@type": type,
    };

    switch (type) {
      case "Organization":
        return {
          ...baseContext,
          name: "Daniel's Believe",
          url: "https://www.danielsbelieve.de",
          logo: "https://www.danielsbelieve.de/logo.webp",
          description: "Premium Online Shopping mit Flash Sales, Express-Versand und sicherer Zahlung in Deutschland",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+49-152-23815822",
            contactType: "customer service",
            email: "info@danielsbelieve.de",
            availableLanguage: ["German", "English"]
          },
          address: {
            "@type": "PostalAddress",
            addressCountry: "DE"
          },
          sameAs: [
            "https://www.facebook.com/danielsbelieve",
            "https://www.instagram.com/danielsbelieve",
            "https://www.tiktok.com/@danielsbelieve"
          ],
          ...data
        };

      case "Product":
        return {
          ...baseContext,
          name: data.name,
          description: data.description,
          image: data.image,
          brand: {
            "@type": "Brand",
            name: data.brand || "Daniel's Believe"
          },
          offers: {
            "@type": "Offer",
            price: data.price,
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            seller: {
              "@type": "Organization",
              name: "Daniel's Believe"
            }
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: data.rating || "4.8",
            reviewCount: data.reviewCount || "50"
          },
          ...data
        };

      case "LocalBusiness":
        return {
          ...baseContext,
          "@type": ["LocalBusiness", "OnlineStore"],
          name: "Daniel's Believe",
          description: "Premium Online Shopping mit Flash Sales und Express-Versand",
          url: "https://www.danielsbelieve.de",
          telephone: "+49-152-23815822",
          email: "info@danielsbelieve.de",
          address: {
            "@type": "PostalAddress",
            addressCountry: "DE"
          },
          openingHours: "Mo-Su 00:00-24:00",
          paymentAccepted: ["PayPal", "Credit Card", "Invoice"],
          priceRange: "€€",
          ...data
        };

      case "WebSite":
        return {
          ...baseContext,
          name: "Daniel's Believe",
          url: "https://www.danielsbelieve.de",
          description: "Premium Online Shopping mit Flash Sales, Express-Versand und sicherer Zahlung",
          publisher: {
            "@type": "Organization",
            name: "Daniel's Believe"
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://www.danielsbelieve.de/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
          ...data
        };

      case "BreadcrumbList":
        return {
          ...baseContext,
          itemListElement: data.breadcrumbs?.map((item: any, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url
          })) || []
        };

      default:
        return { ...baseContext, ...data };
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateStructuredData()),
      }}
    />
  );
}
