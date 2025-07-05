"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ItemCard from "@/components/item-card";
import ItemCardSkeleton from "@/components/item-card-skeleton";
import TextBox from "@/components/text-box";
import Image from "next/image";
import CategoryProductsInterface from "@/interfaces/categoriesInterface";
import { getProducts } from "@/lib/products";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";

interface RelativeItemsProps {
  category?: string;
}

const RelativeItems: React.FC<RelativeItemsProps> = ({ category }) => {
  const sliderRef = useRef<Slider | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<CategoryProductsInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Initialize as true

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        const items = await getProducts();

        const mappedProducts: CategoryProductsInterface[] = items
          .filter(
            (product) =>
              !category || // Show all if no category specified
              product.category?.toLowerCase() === category.toLowerCase()
          )
          .map((product) => ({
            ...product,
            id: String(product.id),
            brand: product.brand || "Unbekannte Marke",
            material: product.material || "Unbekanntes Material",
          }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [category]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    sliderRef.current?.slickPrev();
  };

  const handleNext = () => {
    sliderRef.current?.slickNext();
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: isMobile ? 2 : 4,
    slidesToScroll: 1,
    initialSlide: 0,
    swipeToSlide: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <div className="relative mt-20 md:mt-10 w-full mb-20">
      <div className="flex justify-between items-center pr-2 sm:pr-4 md:pr-8 lg:pr-12">
        <TextBox text={"Ähnliche Produkte"} />
        {category && (
          <Link
            href={`/category/${category}`}
            className="text-sm text-red-500 md:text-lg flex justify-center items-center gap-2 hover:bg-red-500 hover:text-white px-3 py-1 rounded-full transition-all duration-300"
          >
            Alle anzeigen
            <IoIosArrowForward size={20} />
          </Link>
        )}
      </div>

      <div className="flex justify-between items-center mb-4 px-3 sm:px-4 lg:px-8 xl:px-12 mt-2">
        <h2 className="text-2xl font-bold">
          {category
            ? `${
                category === "men"
                  ? "Herren"
                  : category === "women"
                  ? "Damen"
                  : category.charAt(0).toUpperCase() + category.slice(1)
              } Produkte`
            : "Ähnliche Produkte"}
        </h2>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handlePrev}
            className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full cursor-pointer"
          >
            <FaChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full cursor-pointer"
          >
            <FaChevronRight size={16} />
          </button>
        </div>
      </div>

      <Slider
        ref={(slider) => {
          sliderRef.current = slider;
        }}
        {...settings}
        className="px-2 sm:px-4 lg:px-8 xl:px-12"
      >
        {isLoading ? (
          Array(4)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="px-2">
                <ItemCardSkeleton />
              </div>
            ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="px-2">
              <ItemCard {...product} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            Keine Produkte gefunden
            {category ? ` in ${category}` : ""}.
          </div>
        )}
      </Slider>

      <div className="absolute right-0 -bottom-48 -z-50">
        <Image
          src="/design.svg"
          alt="Design"
          width={200}
          height={200}
          priority
        />
      </div>
    </div>
  );
};

export default RelativeItems;
