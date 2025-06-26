import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./firebaseConfig";

const FOOTER_COLLECTION = "footerInfo";
const FOOTER_DOC_ID = "contact";
const LOCAL_STORAGE_KEY = "footer_info";

/**
 * Get the footer information from Firestore and store in localStorage
 */
export const getFooterInfo = async () => {
  try {
    // Clear previous footer data (on every fresh load)
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    const footerRef = doc(firestore, FOOTER_COLLECTION, FOOTER_DOC_ID);
    const footerSnap = await getDoc(footerRef);

    if (footerSnap.exists()) {
      const data = footerSnap.data();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    } else {
      console.warn("Footer info does not exist in Firestore");
      return null;
    }
  } catch (error) {
    console.error("Error getting footer info:", error);
    throw error;
  }
};

/**
 * Read footer info from localStorage
 */
export const getFooterInfoFromLocalStorage = (): Record<
  string,
  string
> | null => {
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : null;
  } catch (error) {
    console.error("Failed to parse footer info from localStorage", error);
    return null;
  }
};
