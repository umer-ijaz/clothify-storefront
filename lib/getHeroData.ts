"use client";

import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";

interface HeroData {
  title: string;
  subtitle: string;
}

export const getHeroData = async (): Promise<HeroData> => {
  try {
    // Clear old cache
    localStorage.removeItem("hero_data");

    const q = query(
      collection(firestore, "carouseltitle"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();

      const heroInfo: HeroData = {
        title: data.title || "",
        subtitle: data.subtitle || "",
      };

      // Store fresh hero data in localStorage
      localStorage.setItem("hero_data", JSON.stringify(heroInfo));

      return heroInfo;
    }

    // If no data in Firestore, return fallback
    const fallback: HeroData = {
      title:
        "Providing a high-quality textile range for your senior centers according to your wishes.",
      subtitle: "Find the best this season 🔥",
    };

    localStorage.setItem("hero_data", JSON.stringify(fallback));
    return fallback;
  } catch (error) {
    console.error("Error fetching hero data:", error);

    // Fallback on error
    const fallback: HeroData = {
      title:
        "Providing a high-quality textile range for your senior centers according to your wishes.",
      subtitle: "Find the best this season 🔥",
    };

    localStorage.setItem("hero_data", JSON.stringify(fallback));
    return fallback;
  }
};
