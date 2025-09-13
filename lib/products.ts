"use cache";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";

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

// Helper function to filter out private products
function filterPublicProducts(products: Product[]): Product[] {
  return products.filter(product => !product.makeThisProductPrivate);
}

export async function getProducts(): Promise<Product[]> {
  try {
    const productsCollection = collection(firestore, "v_products");
    const snapshot = await getDocs(productsCollection);

    const allProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    // Filter out private products
    return filterPublicProducts(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getFlashProducts(): Promise<Product[]> {
  try {
    const productsCollection = collection(firestore, "v_flashSaleItems");
    const snapshot = await getDocs(productsCollection);

    const allProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    // Filter out private products
    return filterPublicProducts(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(productId: string): Promise<Product> {
  try {
    // Check both collections in parallel for better performance
    const productDocRef = doc(firestore, "v_products", productId);
    const flashSaleDocRef = doc(firestore, "v_flashSaleItems", productId);

    const [productSnapshot, flashSaleSnapshot] = await Promise.all([
      getDoc(productDocRef),
      getDoc(flashSaleDocRef),
    ]);

    // Check if product exists in products collection
    if (productSnapshot.exists()) {
      const productData = productSnapshot.data();
      const product = {
        id: productSnapshot.id,
        ...productData,
      } as Product;
      
      // Check if product is private
      if (product.makeThisProductPrivate) {
        throw new Error(`Product with ID ${productId} is not available`);
      }
      
      return product;
    }

    // Check if product exists in flashSaleItems collection
    if (flashSaleSnapshot.exists()) {
      const flashSaleData = flashSaleSnapshot.data();
      const product = {
        id: flashSaleSnapshot.id,
        ...flashSaleData,
      } as Product;
      
      // Check if product is private
      if (product.makeThisProductPrivate) {
        throw new Error(`Product with ID ${productId} is not available`);
      }
      
      return product;
    }
    throw new Error(`Product with ID ${productId} not found in any collection`);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
}

export async function getFlashSaleItemsProductsById(
  productIds: string[]
): Promise<Product[]> {
  try {
    const productsCollection = collection(firestore, "v_flashSaleItems");
    const snapshot = await getDocs(productsCollection);

    const allProducts = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
      .filter((product) => productIds.includes(product.id));

    // Filter out private products
    return filterPublicProducts(allProducts);
  } catch (error) {
    console.error("Error fetching flash sale items:", error);
    return [];
  }
}
