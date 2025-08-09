"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../../style/HeroStyle.css";
import Button from "../button";
import Carousel from "./carousel";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { firestore } from "@/lib/firebaseConfig";

const Hero = () => {
  const [heroData, setHeroData] = useState({
    title: "",
    subtitle: "",
    loading: true,
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        // Step 1: Remove any existing hero data from localStorage on each load
        localStorage.removeItem("hero_data");

        // Step 2: Fetch the latest document from Firestore
        const q = query(
          collection(firestore, "carouseltitle"),
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();

          const heroInfo = {
            title: data.title || "",
            subtitle: data.subtitle || "",
          };

          // Step 3: Store fresh hero data in localStorage
          localStorage.setItem("hero_data", JSON.stringify(heroInfo));

          // Step 4: Set state from the new data
          setHeroData({
            ...heroInfo,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching hero data:", error);

        // Optional fallback values on error
        const fallback = {
          title:
            "Providing a high-quality textile range for your senior centers according to your wishes.",
          subtitle: "Find the best this season 🔥",
        };

        setHeroData({
          ...fallback,
          loading: false,
        });

        // Also save fallback to localStorage in case needed for offline
        localStorage.setItem("hero_data", JSON.stringify(fallback));
      }
    };

    fetchHeroData();
  }, []);

  return (
    <div className=" w-full h-1/2 md:h-auto flex">
      <div className=" w-full h-full flex flex-col md:flex-row justify-center items-center">
        {/* Left Side - Text Content - Exactly Half Width */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center md:items-start text-center md:text-left px-8 py-8">
          {/* Heading with Hover Effect */}
          {heroData.loading ? (
            <div className="animate-pulse h-20 md:h-40 w-4/5 bg-gray-200 rounded"></div>
          ) : (
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold bg-clip-text leading-tight bg-gradient-to-r text-transparent from-[#EB1E24] via-[#F05021] to-[#F8A51B] transition-all duration-300 hover:text-opacity-80 mb-6">
              {heroData.title}
            </h1>
          )}

          {/* Subtext with Hover Effect */}
          {heroData.loading ? (
            <div className="animate-pulse h-6 md:h-10 w-3/5 bg-gray-200 rounded mb-8 mt-5"></div>
          ) : (
            <p className="text-md md:text-lg text-red-600 transition-all duration-300 mb-10">
              {heroData.subtitle}
            </p>
          )}

          {/* Button with Hover, Active & Shadow Effects */}
          <Link href="#products" className="inline-block">
            <Button text="Jetzt einkaufen" />
          </Link>
        </div>

        {/* Right Side - Carousel Component - Exactly Half Width, Full Height */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full">
          <Carousel />
        </div>
      </div>
    </div>
  );
};

export default Hero;
