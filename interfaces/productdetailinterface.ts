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
  isFlashSale: boolean;
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

export interface ProductDetailState {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  selectedImage: number;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}
