import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";

export async function fetchDeliveryPrice(): Promise<number> {
  try {
    const docRef = doc(firestore, "settings", "deliveryPrice");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const price = data.price;
      console.log("Delivery price fetched:", price);
      return typeof price === "number" ? price : 10; // Default to 10 if not a number
    }
    return 10; // Default delivery price
  } catch (error) {
    console.error("Error fetching delivery price:", error);
    return 10; // Default delivery price
  }
}
