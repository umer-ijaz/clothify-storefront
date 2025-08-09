import { collection, getDocs } from "firebase/firestore";
import { firestore } from "./firebaseConfig";

export interface PromoCode {
  id: string;
  code: string;
  createdAt?: any;
  discount: number;
  expiryDate: string;
  storeId: string;
  storeName: string;
  updatedAt?: any;
  noOfTimes: number | string | null;
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const querySnapshot = await getDocs(collection(firestore, "promocodes"));
    const promoList: PromoCode[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      promoList.push({
        id: doc.id,
        code: data.code,
        createdAt: data.createdAt,
        discount: data.discount,
        expiryDate: data.expiryDate,
        storeId: data.storeId,
        storeName: data.storeName,
        updatedAt: data.updatedAt,
        noOfTimes:data.noOfTimes,
      });
    });

    return promoList;
  } catch (error) {
    console.error("Error fetching promocodes:", error);
    return [];
  }
}
