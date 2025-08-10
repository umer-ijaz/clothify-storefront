import { firestore } from "@/lib/firebaseConfig"; // adjust path
import { doc, getDoc } from "firebase/firestore";

export const fetchReturnPolicyPeriod = async (): Promise<number | null> => {
  try {
    const docRef = doc(firestore, "settings", "deliveryWarranty");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.returnPolicy && data.returnPolicy.period) {
        return data.returnPolicy.period as number;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching return policy:", error);
    throw error;
  }
};
