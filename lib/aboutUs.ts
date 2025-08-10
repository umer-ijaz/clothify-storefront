import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig"; // adjust path to your firebase config
import { AboutUsData } from "@/interfaces/aboutUs";

export const fetchAboutUsData = async (): Promise<AboutUsData | null> => {
  try {
    const docRef = doc(firestore, "settings", "aboutUs");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as AboutUsData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching about us data:", error);
    return null;
  }
};
