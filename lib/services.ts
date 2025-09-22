"use cache";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig"; // adjust the path to your firebase config
import { Service } from "@/interfaces/services";

export const fetchServices = async (
  limitCount?: number
): Promise<Service[]> => {
  try {
    const querySnapshot = await getDocs(collection(firestore, "services"));
    const fetchedServices: Service[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      fetchedServices.push({
        id: docSnap.id,
        name: data.name,
        mainImage: data.mainImage,
        details: data.details,
      });
    });

    // Shuffle the services
    const shuffled = fetchedServices.sort(() => 0.5 - Math.random());
    
    // Return all services if no limit specified, otherwise limit
    return limitCount ? shuffled.slice(0, limitCount) : shuffled;
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};
