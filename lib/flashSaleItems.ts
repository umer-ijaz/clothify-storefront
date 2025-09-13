"use cache";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";

export interface FlashSaleItem {
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
  makeThisProductPrivate?: boolean; // Admin can make products private
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

// Helper function to filter out private flash sale items
function filterPublicFlashSaleItems(items: FlashSaleItem[]): FlashSaleItem[] {
  return items.filter(item => !item.makeThisProductPrivate);
}

export async function getFlashSaleItems(): Promise<FlashSaleItem[]> {
  try {
    const flashSaleCollection = collection(firestore, "v_flashSaleItems");
    const snapshot = await getDocs(flashSaleCollection);

    const allItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FlashSaleItem[];

    // Filter out private products
    return filterPublicFlashSaleItems(allItems);
  } catch (error) {
    console.error("Error fetching flash sale items:", error);
    return [];
  }
}
