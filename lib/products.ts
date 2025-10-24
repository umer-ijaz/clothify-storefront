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

  image: string;
  images: string[];

  currentPrice: number;
  originalPrice: number;
  discount: number;
  isFlashSale: boolean;
  isBoth: boolean;
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
  makeThisProductPrivate?: boolean;
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

// 🔹 Helper to filter and sort
function filterAndSortProducts(products: Product[]): Product[] {
  return products
    .filter((product) => !product.makeThisProductPrivate)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

// 🔹 Fetch all products
export async function getProducts(): Promise<Product[]> {
  try {
    const productsCollection = collection(firestore, "v_products");
    const snapshot = await getDocs(productsCollection);

    const allProducts = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Product)
    );

    return filterAndSortProducts(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// 🔹 Fetch all flash sale products
export async function getFlashProducts(): Promise<Product[]> {
  try {
    const productsCollection = collection(firestore, "v_flashSaleItems");
    const snapshot = await getDocs(productsCollection);

    const allProducts = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Product)
    );

    return filterAndSortProducts(allProducts);
  } catch (error) {
    console.error("Error fetching flash sale products:", error);
    return [];
  }
}

// 🔹 Fetch single product by ID (checks both collections)
export async function getProductById(productId: string): Promise<Product> {
  try {
    const productDocRef = doc(firestore, "v_products", productId);
    const flashSaleDocRef = doc(firestore, "v_flashSaleItems", productId);

    const [productSnapshot, flashSaleSnapshot] = await Promise.all([
      getDoc(productDocRef),
      getDoc(flashSaleDocRef),
    ]);

    let productData: Product | null = null;

    if (productSnapshot.exists()) {
      productData = {
        id: productSnapshot.id,
        ...productSnapshot.data(),
      } as Product;
    } else if (flashSaleSnapshot.exists()) {
      productData = {
        id: flashSaleSnapshot.id,
        ...flashSaleSnapshot.data(),
      } as Product;
    }

    if (!productData) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    if (productData.makeThisProductPrivate) {
      throw new Error(`Product with ID ${productId} is not available`);
    }

    return productData;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
}

// 🔹 Fetch multiple flash sale items by IDs
export async function getFlashSaleItemsProductsById(
  productIds: string[]
): Promise<Product[]> {
  try {
    const productsCollection = collection(firestore, "v_flashSaleItems");
    const snapshot = await getDocs(productsCollection);

    const allProducts = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
      .filter((product) => productIds.includes(product.id));

    return filterAndSortProducts(allProducts);
  } catch (error) {
    console.error("Error fetching flash sale items:", error);
    return [];
  }
}
