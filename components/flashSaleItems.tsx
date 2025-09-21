"use client";

import React, { useRef, useEffect, useState } from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ItemCard from "@/components/item-card";
import TextBox from "@/components/text-box";
import Image from "next/image";
import ItemCardSkeleton from "./item-card-skeleton";
import { getFlashSaleItems, FlashSaleItem } from "@/lib/flashSaleItems";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { getProducts } from "@/lib/products";

const FlashSaleCarousel = () => {
  const sliderRef = useRef<Slider | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<FlashSaleItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [skeletonCount, setSkeletonCount] = useState(4); // Default to 4

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      // Set skeleton count based on screen size
      if (width < 768) {
        setSkeletonCount(2); // mobile
      } else if (width < 1024) {
        setSkeletonCount(3); // md
      } else {
        setSkeletonCount(4); // lg and above
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchFlashSaleItems() {
      setLoading(true);
      let items = await getFlashSaleItems();
      const items2 = await getProducts();
      items = items.concat(items2).filter((item) => item.isFlashSale == true);

      setProducts(items);
      setLoading(false);

      setShowSkeleton(true);
      setTimeout(() => setShowSkeleton(false), 2000);
    }

    fetchFlashSaleItems();
  }, []);

  const settings = {
    mobileFirst: true,
    infinite: true,
    speed: 500,
    cssEase: "ease-in-out",
    slidesToShow: isMobile ? 2 : 4,
    slidesToScroll: 1,
    swipeToSlide: true,
    arrows: false,
    touchMove: true,
    draggable: true,
    autoplay: true,
    autoplaySpeed: 3000,
    lazyLoad: "ondemand" as const, // Fix TypeScript type
    waitForAnimate: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <section className="relative mt-0 md:mt-10 w-full overflow-x-hidden pt-20 md:pt-10 h-auto">
      {loading && (!products || products.length == null || 0) ? null : (
        <div>
          <div className="flex justify-between items-center pr-2 sm:pr-4 md:pr-8 lg:pr-12">
            <TextBox text={"Angebote des Tages"} />
            <Link
              href={"/flashsaleproducts"}
              className="body text-sm text-red-500 md:text-lg flex justify-center items-center gap-2 hover:bg-red-500 active:bg-red-500 active:text-white hover:text-white px-3 py-1 rounded-full transition-all duration-300"
            >
              Alle anzeigen
              <IoIosArrowForward size={20} />
            </Link>
          </div>

          <div className="flex justify-between items-center mb-4 px-3 sm:px-4 lg:px-8 xl:px-12 mt-4">
            <h2 className="text-2xl font-bold heading-luxury">Blitzangebote</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => sliderRef.current?.slickPrev()}
                className="p-2 bg-gray-200 hover:bg-red-500 active:bg-red-500 rounded-full cursor-pointer"
                aria-label="Left Slide"
              >
                <FaChevronLeft
                  size={16}
                  className="text-gray-900 hover:text-white active:text-white"
                />
              </button>
              <button
                type="button"
                onClick={() => sliderRef.current?.slickNext()}
                className="p-2 bg-gray-200 hover:bg-red-500 active:bg-red-500 rounded-full cursor-pointer"
                aria-label="Right Slide"
              >
                <FaChevronRight
                  size={16}
                  className="text-gray-900 hover:text-white active:text-white"
                />
              </button>
            </div>
          </div>

          <div className="relative">
            <Slider
              className="px-2 sm:px-4 lg:px-6 xl:px-8"
              ref={sliderRef}
              {...settings}
              key={isMobile ? "mobile" : "desktop"}
            >
              {(loading || showSkeleton) && products?.length
                ? Array(skeletonCount)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="px-2">
                        <ItemCardSkeleton />
                      </div>
                    ))
                : products?.map((product) => {
                    if (!product.id) {
                      return null;
                    }
                    return (
                      <div key={product.id} className="px-2">
                        <ItemCard {...product} id={product.id.toString()} />
                      </div>
                    );
                  })}
            </Slider>
          </div>

          <div className="absolute right-0 bottom-0 -z-50">
            <Image
              src="/design.svg"
              alt="Design"
              width={200}
              height={200}
              priority
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default FlashSaleCarousel;
