import { Metadata } from "next";
import { getProductById } from "@/lib/products";
import ProductDetailPage from "@/components/productComponents/product-details";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  try {
    const { productId } = await params;
    const product = await getProductById(productId);

    if (!product) {
      return {
        title: "Produkt nicht gefunden | Daniel's Believe",
        description: "Das angeforderte Produkt konnte nicht gefunden werden.",
      };
    }

    const isFlashSale = product.isFlashSale;
    const discount = product.discount || 0;
    const originalPrice = product.originalPrice || product.currentPrice;
    const currentPrice = product.currentPrice;

    const title = `${product.name} ${isFlashSale ? '🔥 FLASH SALE' : ''} - ${product.brand || 'Daniel\'s Believe'}`;
    const description = `${isFlashSale ? `⚡ FLASH SALE ${discount}% RABATT! ` : ''}${product.description || `${product.name} von ${product.brand || 'Daniel\'s Believe'}`}. ✅ Express-Versand ✅ Sichere Zahlung ✅ ${product.rating || 4.8}⭐ Bewertung. Nur €${currentPrice}${originalPrice !== currentPrice ? ` statt €${originalPrice}` : ''}!`;

    const productImage = product.image || product.images?.[0] || "https://www.danielsbelieve.de/logo.webp";

    return {
      title,
      description,
      keywords: [
        product.name,
        product.brand,
        product.category,
        product.subcategory,
        product.material,
        isFlashSale ? 'Flash Sale' : '',
        isFlashSale ? 'Blitzangebot' : '',
        'Daniel\'s Believe',
        'Online Shop',
        'Deutschland',
        'Express-Versand',
        'PayPal',
        'Stripe'
      ].filter(Boolean).join(", "),
      openGraph: {
        title: `${title} | Daniel's Believe`,
        description,
        type: "website",
        url: `https://www.danielsbelieve.de/product/${productId}`,
        images: [
          {
            url: productImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        siteName: "Daniel's Believe",
        locale: "de_DE",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Daniel's Believe`,
        description,
        images: [productImage],
      },
      alternates: {
        canonical: `https://www.danielsbelieve.de/product/${productId}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Produkt | Daniel's Believe",
      description: "Entdecken Sie Premium-Produkte bei Daniel's Believe mit Express-Versand und sicherer Zahlung.",
    };
  }
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  return (
    <div className="w-full">
      <ProductDetailPage params={params} />
    </div>
  );
}
