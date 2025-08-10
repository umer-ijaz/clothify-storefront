export interface ProductCardEnhancedProps {
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
  isFlashSale: boolean;
  isBoth: boolean;

  stock: number;
  rating: number;
  reviewsCount: number;
  reviews: any[]; // If reviews have a structure, define an interface

  sku: string;
  description: string;
  material: string;
  features: string[];

  createdAt: string;
  updatedAt: string;

  variants: Variant[];
}

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