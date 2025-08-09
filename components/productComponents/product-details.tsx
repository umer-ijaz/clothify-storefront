"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProductById } from "@/lib/products";
import ProductImages from "./product-images";
import ProductInfo from "./product-info";
import DeliveryOptions from "./delivery-options";
import ProductReviews from "../reviewsComponents/product-reviews";
import TextBox from "../text-box";
import TextField from "../text-field";
import HomeLink from "../home-link";
import RelativeItems from "../relativeComponent/relative-items";
import Loading from "../categoryComponents/loading";

// Updated interfaces
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
  category: string;
  subcategory: string;
  image: string; // main display image
  images: string[]; // all additional images
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

interface ProductDetailState {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  selectedImage: number;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const [state, setState] = useState<ProductDetailState>({
    product: null,
    isLoading: true,
    error: null,
    selectedImage: 0,
    quantity: 1,
    selectedColor: "",
    selectedSize: "",
  });


  const {
    product,
    isLoading,
    error,
    selectedImage,
    quantity,
    selectedColor,
    selectedSize,
  } = state;

  // Helper function to update state
  const updateState = (updates: Partial<ProductDetailState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Get current variant data based on selected color
  const getCurrentVariant = () => {
    if (!product?.variants?.length || !selectedColor) return null;
    return product.variants.find((v) => v.color.name === selectedColor) || null;
  };

  // Get current images based on selected color
  const getCurrentImages = () => {
    const currentVariant = getCurrentVariant();
    if (currentVariant) {
      const images = [
        currentVariant.mainImage,
        ...currentVariant.subImages,
      ].filter(Boolean);
      return images.length > 0
        ? images
        : [product?.image || ""].filter(Boolean);
    }
    // Fallback to main product images
    const fallbackImages = product?.images ? [...product.images] : [];
    if (product?.image && !fallbackImages.includes(product.image)) {
      fallbackImages.unshift(product.image);
    }
    return fallbackImages;
  };

  // Get current sizes based on selected color - ONLY from variant
  const getCurrentSizes = () => {
    const currentVariant = getCurrentVariant();
    if (currentVariant && currentVariant.sizes) {
      return currentVariant.sizes;
    }
    // If no variants exist, this product doesn't have size variations
    return [];
  };

  // Get current out of stock sizes based on selected color - ONLY from variant
  const getCurrentOutOfStockSizes = () => {
    const currentVariant = getCurrentVariant();
    if (currentVariant) {
      return currentVariant.outOfStockSizes || [];
    }
    // If no variants exist, no out of stock sizes
    return [];
  };

  // Get available colors from variants
  const getAvailableColors = () => {
    if (!product?.variants?.length) return [];
    return product.variants.map((v) => v.color);
  };

  // Check if product has variants
  const hasVariants = (): boolean => {
    return Array.isArray(product?.variants) && product.variants.length > 0;
  };

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    switch (category.toLowerCase()) {
      case "men":
        return "Herren";
      case "women":
        return "Damen";
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        updateState({ isLoading: true, error: null });
        const { productId } = await params;
        const firestoreProduct = await getProductById(productId);

        if (!firestoreProduct) {
          throw new Error("Product not found");
        }

        updateState({
          product: firestoreProduct as Product,
          isLoading: false,
        });

        // Set initial selected color to first variant if variants exist
        if (firestoreProduct.variants?.length > 0) {
          updateState({
            selectedColor: firestoreProduct.variants[0].color.name,
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        updateState({
          error:
            error instanceof Error ? error.message : "Failed to load product",
          isLoading: false,
        });
      }
    }
    fetchProduct();
  }, [params]);

  // Reset selected image when color changes
  useEffect(() => {
    updateState({ selectedImage: 0 });
  }, [selectedColor]);

  // Reset and set appropriate size when color changes
  useEffect(() => {
    if (!product || !selectedColor) return;

    const currentSizes = getCurrentSizes();
    const currentOutOfStock = getCurrentOutOfStockSizes();

    // Always reset size when color changes
    updateState({ selectedSize: "" });

    // If there are sizes available, try to select the first available one
    if (currentSizes.length > 0) {
      const firstAvailable = currentSizes.find(
        (size) => !currentOutOfStock.includes(size)
      );
      if (firstAvailable) {
        updateState({ selectedSize: String(firstAvailable) });
      }
    }
  }, [selectedColor, product]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      updateState({ quantity: newQuantity });
    }
  };

  const handleImageSelect = (index: number) => {
    updateState({ selectedImage: index });
  };

  const handleColorSelect = (color: string) => {
    updateState({ selectedColor: color });
  };

  const handleSizeSelect = (size: string) => {
    updateState({ selectedSize: size });
  };

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Product not found"}
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentImages = getCurrentImages();
  const currentSizes = getCurrentSizes();
  const currentOutOfStockSizes = getCurrentOutOfStockSizes();
  const availableColors = getAvailableColors();

  return (
    <div className="w-full overflow-hidden">
      <div className="pt-5 pb-20">
        {/* Breadcrumb */}
        <nav
          className="text-sm md:text-xl font-small mb-10 capitalize flex gap-1 md:gap-2 px-2 sm:px-4 md:px-8 lg:px-12"
          aria-label="Breadcrumb"
        >
          <HomeLink />
          <span className="mx-2 text-gray-400" aria-hidden="true">
            /
          </span>
          <Link
            href={`/category/${product.category}`}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {getCategoryDisplayName(product.category)}
          </Link>
          <span className="mx-2 text-gray-400" aria-hidden="true">
            /
          </span>
          <span className="text-red-500 font-medium">{product.name}</span>
        </nav>

        <TextField text={product.name} />

        <div className="px-0 sm:px-2 md:px-4 lg:px-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 sm:p-6 md:p-8 rounded-xl justify-center shadow-sm md:shadow-md">
            {/* Product Images */}
            <div className="w-full lg:w-1/2">
              <ProductImages
                product={{
                  name: product.name,
                  images: currentImages,
                }}
                selectedImage={selectedImage}
                setSelectedImage={handleImageSelect}
              />
            </div>

            {/* Product Info */}
            <div className="px-0 sm:px-2 md:px-4 lg:px-8 mb-8 w-full md:w-1/2">
              <div className="bg-white p-4 sm:p-6 md:p-8">
                <ProductInfo
                  product={{
                    ...product,
                    // Pass variant-specific data
                    colors: availableColors,
                    sizes: currentSizes.map(String),
                    outOfStockSizes: currentOutOfStockSizes.map(String),
                  }}
                  selectedColor={selectedColor}
                  setSelectedColor={handleColorSelect}
                  selectedSize={selectedSize}
                  setSelectedSize={handleSizeSelect}
                  quantity={quantity}
                  handleQuantityChange={handleQuantityChange}
                  currentVariant={getCurrentVariant()}
                  hasVariants={hasVariants()}
                />
              </div>
            </div>

            {/* Delivery Options */}
            <div className="w-full lg:w-1/4">
              <DeliveryOptions />
            </div>
          </div>
        </div>

        {/* Features Section */}
        {product.features && product.features.length > 0 && (
          <section className="mt-10">
            <TextBox text="Merkmale" />
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm md:shadow-md mt-4">
              <ul className="grid gap-2 text-gray-700 text-sm" role="list">
                {product.features.map((feature: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg shadow-sm"
                  >
                    <span
                      className="text-green-500 text-lg flex-shrink-0"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="relative mt-10">
          <TextBox text="Bewertungen" />
          <Image
            src="/bubble.svg"
            alt=""
            width={400}
            height={400}
            className="absolute right-0 w-30 h-30 md:w-60 md:h-60 top-5 pointer-events-none"
            aria-hidden="true"
          />
          <div className="px-2 sm:px-4 md:px-8 lg:px-12">
            <ProductReviews product={product} />
          </div>
        </section>

        {/* Related Items */}
        <section className="mt-10">
          <RelativeItems category={product.category} />
        </section>
      </div>
    </div>
  );
}
