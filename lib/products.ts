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
  isFlashSale:boolean;
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

export async function getProducts(): Promise<Product[]> {
  try {
    const productsCollection = collection(firestore, "v_products");
    const snapshot = await getDocs(productsCollection);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getFlashProducts(): Promise<Product[]> {
  try {
    const productsCollection = collection(firestore, "v_flashSaleItems");
    const snapshot = await getDocs(productsCollection);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
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
      console.log("Product found in 'products' collection");
      // Make sure we're returning a valid Product by using proper type assertion
      const productData = productSnapshot.data();
      return {
        id: productSnapshot.id,
        ...productData,
      } as Product;
    }

    // Check if product exists in flashSaleItems collection
    if (flashSaleSnapshot.exists()) {
      console.log("Product found in 'flashSaleItems' collection");
      // Make sure we're returning a valid Product by using proper type assertion
      const flashSaleData = flashSaleSnapshot.data();
      return {
        id: flashSaleSnapshot.id,
        ...flashSaleData,
      } as Product;
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

    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
      .filter((product) => productIds.includes(product.id));
  } catch (error) {
    console.error("Error fetching flash sale items:", error);
    return [];
  }
}
