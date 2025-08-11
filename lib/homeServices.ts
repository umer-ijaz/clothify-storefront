"use cache";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig"; // adjust import path to your firebase config
import { HomeService } from "@/interfaces/homeserviceinterface";

export const fetchHomeServices = async (): Promise<HomeService[]> => {
  try {
    const querySnapshot = await getDocs(collection(firestore, "homeservice"));

    return querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Omit<HomeService, "createdAt">),
      createdAt: doc.data().createdAt?.toDate?.().toString() || "",
    }));
  } catch (error) {
    console.error("Error fetching home services:", error);
    return [];
  }
};
