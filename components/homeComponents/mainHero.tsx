"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import "../../style/HeroStyle.css";
import Button from "../button";
import Carousel from "./carousel";
import { getHeroData } from "@/lib/getHeroData";
import Loading from "@/app/loading";

const Hero = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [heroData, setHeroData] = useState({
    title: "",
    subtitle: "",
  });

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      const data = await getHeroData();
      setHeroData(data);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <section className="w-full h-1/2 md:h-auto flex">
      <div className="w-full h-full flex flex-col md:flex-row justify-center items-center">
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center md:items-start text-center md:text-left px-8 py-8">
          <h1 className="heading-luxury-title text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold bg-clip-text leading-tight bg-gradient-to-r text-transparent from-[#EB1E24] via-[#F05021] to-[#F8A51B] transition-all duration-300 hover:text-opacity-80 mb-6">
            {heroData.title}
          </h1>
          <p className="subheading text-md md:text-lg text-red-600 transition-all duration-300 mb-10">
            {heroData.subtitle}
          </p>
          <Link href="#products" className="inline-block">
            <Button text="Jetzt einkaufen" />
          </Link>
        </div>
        <div className="w-full md:w-1/2 h-1/2 md:h-full">
          <Carousel />
        </div>
      </div>
    </section>
  );
};

export default Hero;
