export interface CategoryProductsInterface {
  id: string;
  productId: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  isFlashSale: boolean;
  isBoth: boolean;
  image: string;
  images: string[];

  currentPrice: number;
  originalPrice: number;
  discount: number;

  stock: number;
  rating: number;
  reviewsCount: number;
  reviews: any[]; // Replace `any` with a proper `Review` interface if available

  sku: string;

  description: string;
  material: string;
  features: string[];

  createdAt: string;
  updatedAt: string;

  variants: Variant[];
  makeThisProductPrivate?: boolean; // Admin can make products private

  onBuyNow?: () => void;
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

export default CategoryProductsInterface;
