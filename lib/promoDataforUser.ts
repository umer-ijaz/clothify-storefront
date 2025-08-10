// src/services/fetchPromoUsage.ts
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig"; // adjust path to your firebase config

export const fetchPromoUsage = async (userId: string) => {
  if (!userId) return {};

  const ordersRef = collection(firestore, `users/${userId}/orders`);
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const promoUsage: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const code = data.promoCode?.trim().toLowerCase();
    if (code) {
      promoUsage[code] = (promoUsage[code] || 0) + 1;
    }
  });

  return promoUsage;
};
