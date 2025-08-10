import { firestore } from "@/lib/firebaseConfig";
import { CompanyInfo } from "@/interfaces/companyInfo";
import { doc, getDoc } from "firebase/firestore";

export const fetchCompanyImpression = async (): Promise<CompanyInfo | null> => {
  try {
    const companyDocRef = doc(firestore, "company_info", "impression");
    const docSnap = await getDoc(companyDocRef);

    if (docSnap.exists()) {
      return docSnap.data() as CompanyInfo;
    } else {
      console.warn("Impression data not found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching impression data:", error);
    throw error;
  }
};
