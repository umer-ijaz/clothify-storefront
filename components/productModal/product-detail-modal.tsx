"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import ProductImages from "../productComponents/product-images";
import ProductInfo from "../productComponents/product-info";

// Import the interfaces from the detail page
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

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
}: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

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

  // Check if product has variants - ensure it always returns boolean
  const hasVariants = (): boolean => {
    return Boolean(product?.variants && product.variants.length > 0);
  };

  // Initialize state when product changes or modal opens
  useEffect(() => {
    if (product && isOpen) {
      setSelectedImage(0);
      setQuantity(1);

      // Set initial color if variants exist
      if (product.variants?.length > 0) {
        setSelectedColor(product.variants[0].color.name);
      } else {
        setSelectedColor("");
      }
      setSelectedSize("");
    }
  }, [product, isOpen]);

  // Reset selected image when color changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  // Reset and set appropriate size when color changes
  useEffect(() => {
    if (!product || !selectedColor) return;

    const currentSizes = getCurrentSizes();
    const currentOutOfStock = getCurrentOutOfStockSizes();

    // Always reset size when color changes
    setSelectedSize("");

    // If there are sizes available, try to select the first available one
    if (currentSizes.length > 0) {
      const firstAvailable = currentSizes.find(
        (size) => !currentOutOfStock.includes(size)
      );
      if (firstAvailable) {
        setSelectedSize(String(firstAvailable));
      }
    }
  }, [selectedColor, product]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  if (!product) return null;

  const currentImages = getCurrentImages();
  const currentSizes = getCurrentSizes();
  const currentOutOfStockSizes = getCurrentOutOfStockSizes();
  const availableColors = getAvailableColors();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/50 fixed inset-0 z-40" />
      <DialogContent className="max-w-[99vw] md:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[90vw] p-0 max-h-[90vh] overflow-y-auto scrollbar-hide bg-white z-50 rounded-lg">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="relative w-full overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-red-500 shadow-sm">
            <h2 className="text-xl font-bold truncate pr-4">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 overflow-x-hidden w-full">
            {/* Product Images */}
            <div className="w-full lg:w-1/2 overflow-hidden">
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
            <div className="w-full lg:w-1/2 overflow-hidden pl-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
