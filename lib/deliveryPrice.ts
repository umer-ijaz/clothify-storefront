import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";

/**
 * Generic function to fetch a price from a document in the "settings" collection.
 * @param documentId - The ID of the document to fetch (e.g., "deliveryPrice", "expressDelivery")
 * @param defaultPrice - Fallback price if something fails or the price is invalid
 */
async function fetchSettingPrice(
  documentId: string,
  defaultPrice: number = 10
): Promise<number> {
  try {
    const docRef = doc(firestore, "settings", documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const price = data?.price;


      return typeof price === "number" ? price : defaultPrice;
    } else {
      console.warn(`Document "${documentId}" not found in settings.`);
    }
  } catch (error) {
    console.error(`Error fetching ${documentId} price:`, error);
  }

  return defaultPrice;
}

/**
 * Fetch the standard delivery price from Firestore
 */
export const fetchDeliveryPrice = () => fetchSettingPrice("deliveryPrice");

/**
 * Fetch the express delivery price from Firestore
 */
export const fetchExpressDeliveryPrice = () =>
  fetchSettingPrice("expressDelivery");
