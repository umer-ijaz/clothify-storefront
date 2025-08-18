"use client";
import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/context/addToCartContext";
import { toast } from "sonner";
import ProductDetailModal from "./product-detail-modal";

// Import the Product interface
export interface Variant {
  color: {
    name: string;
    hex: string;
  };
  mainImage: string;
  subImages: string[];
  sizes: (string | number)[];
  outOfStockSizes?: (string | number)[];
}

export interface Product {
  id: string;
  productId: string;
  name: string;
  brand: string;
  isFlashSale: boolean;
  isBoth: boolean;
  category: string;
  subcategory: string;
  image: string;
  images: string[];
  currentPrice: number;
  originalPrice: number;
  discount: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  reviews: any[];
  sku: string;
  description: string;
  material: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
  variants: Variant[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCardWithModal({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  // Get the first available variant for default selection
  const getDefaultVariant = () => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0];
    }
    return null;
  };

  // Get the default image (from first variant or main product image)
  const getDefaultImage = () => {
    const defaultVariant = getDefaultVariant();
    if (defaultVariant?.mainImage) {
      return defaultVariant.mainImage;
    }
    return product.image || product.images?.[0] || "/placeholder.svg";
  };

  // Get default color and size for cart
  const getDefaultSelections = () => {
    const defaultVariant = getDefaultVariant();
    if (defaultVariant) {
      const availableSizes = defaultVariant.sizes || [];
      const outOfStockSizes = defaultVariant.outOfStockSizes || [];
      const firstAvailableSize = availableSizes.find(
        (size) => !outOfStockSizes.includes(size)
      );

      return {
        color: defaultVariant.color.name,
        size: firstAvailableSize ? String(firstAvailableSize) : "",
        image: defaultVariant.mainImage,
      };
    }
    return {
      color: "",
      size: "",
      image: product.image || product.images?.[0] || "/placeholder.svg",
    };
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaults = getDefaultSelections();

    // Check if product has variants and requires selection
    if (product.variants && product.variants.length > 0) {
      if (!defaults.color || !defaults.size) {
        toast.error(
          "Bitte öffnen Sie die Produktdetails, um Farbe und Größe auszuwählen."
        );
        setIsModalOpen(true);
        return;
      }
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.currentPrice,
      image: defaults.image,
      quantity: 1,
      isFlashSale: product.isFlashSale,
      color: defaults.color,
      size: defaults.size,
      isChecked: true,
    });
    toast.success("Produkt wurde in den Warenkorb gelegt");
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  // Calculate discount percentage
  const discountPercentage =
    product.originalPrice > product.currentPrice
      ? Math.round(
          ((product.originalPrice - product.currentPrice) /
            product.originalPrice) *
            100
        )
      : 0;

  // Render star rating
  const renderStars = () => {
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-3 h-3 fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <Star
              className="w-3 h-3 absolute top-0 left-0 fill-white text-yellow-400"
              style={{
                clipPath: "polygon(50% 0%, 50% 100%, 0% 100%, 0% 0%)",
              }}
            />
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="group relative rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-gray-300">
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <Image
              src={getDefaultImage() || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Quick actions overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <button
                  onClick={handleQuickView}
                  className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label={`Quick view ${product.name}`}
                >
                  <Eye className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingCart className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discountPercentage > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{discountPercentage}%
                </div>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Nur {product.stock} übrig
                </div>
              )}
              {product.stock === 0 && (
                <div className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Ausverkauft
                </div>
              )}
            </div>

            {/* Color variants indicator */}
            {product.variants && product.variants.length > 1 && (
              <div className="absolute top-2 right-2">
                <div className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded">
                  +{product.variants.length} Farben
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            {/* Brand */}
            {product.brand && (
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {product.brand}
              </p>
            )}

            {/* Product name */}
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-2">
                {renderStars()}
                <span className="text-xs text-gray-500">
                  ({product.reviewsCount})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-lg text-gray-900">
                €{product.currentPrice.toFixed(2)}
              </span>
              {product.originalPrice > product.currentPrice && (
                <span className="text-sm text-gray-500 line-through">
                  €{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="text-xs">
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">Auf Lager</span>
              ) : (
                <span className="text-red-600 font-medium">Ausverkauft</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </>
  );
}
