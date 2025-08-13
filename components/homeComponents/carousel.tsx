"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { getCarouselImages } from "@/lib/carouselImg";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";
import { resizeImageUrl } from "@/lib/imagesizeadjutment";

interface CarouselImage {
  id: string;
  url: string;
  title: string;
}

const Carousel: React.FC = () => {
  const sliderRef = useRef<Slider>(null);
  const [images, setImages] = useState<CarouselImage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getCarouselImages();
        const formattedData = data.map(
          (item: { id: string; url?: string; title?: string }) => ({
            id: item.id,
            url: item.url || "",
            title: item.title || "",
          })
        );
        setImages(formattedData);
      } catch (error) {
        console.error("Error fetching carousel images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    beforeChange: (_: number, next: number) => setCurrentIndex(next),
    dotsClass:
      "slick-dots flex justify-center gap-3 absolute bottom-8 w-full z-20",
  };

  if (loading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  if (!images || images.length === 0)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">Keine Karussellbilder gefunden.</div>
      </div>
    );

  // Only render current + 2 buffer slides
  const buffer = 2;
  const visibleImages = images.filter((_, idx) => {
    const diff = Math.abs(idx - currentIndex);
    return diff <= buffer || diff >= images.length - buffer;
  });

  return (
    <div className="relative w-full h-full bg-white">
      <Slider ref={sliderRef} {...settings} className="w-full h-full">
        {images.map((item, idx) =>
          visibleImages.includes(item) ? (
            <div key={item.id} className="w-full h-full">
              <div className="w-full h-screen items-center justify-center p-2 hidden md:flex">
                <Image
                  src={
                    resizeImageUrl(item.url, "1000x1000") ||
                    item.url ||
                    "/placeholder.svg"
                  }
                  alt={"Carousel Image"}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="w-full h-full object-contain cursor-pointer "
                  onClick={() => router.push(`/product/${item.title}`)}
                  onError={(e) => {
                    e.currentTarget.src = item.url; // fallback to original
                  }}
                />
              </div>
              <div className="w-full h-screen items-center justify-center p-2 flex md:hidden">
                <Image
                  src={
                    resizeImageUrl(item.url, "500x500") ||
                    item.url ||
                    "/placeholder.svg"
                  }
                  alt={"Carousel Image"}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="w-full h-full object-contain cursor-pointer "
                  onClick={() => router.push(`/product/${item.title}`)}
                  onError={(e) => {
                    e.currentTarget.src = item.url; // fallback to original
                  }}
                />
              </div>
            </div>
          ) : (
            // Placeholder div keeps layout intact without loading all images
            <div key={item.id} className="w-full h-full" />
          )
        )}
      </Slider>

      {/* Custom Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white bg-opacity-80 rounded-full shadow-lg transition-all duration-300 hover:bg-red-500 hover:bg-opacity-90 active:bg-red-600 hover:shadow-xl z-30"
        onClick={() => sliderRef.current?.slickPrev()}
        aria-label="Left Slide"
      >
        <FaChevronLeft
          size={24}
          className="text-gray-800 hover:text-white transition-colors duration-300"
        />
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white bg-opacity-80 rounded-full shadow-lg transition-all duration-300 hover:bg-red-500 hover:bg-opacity-90 active:bg-red-600 hover:shadow-xl z-30"
        onClick={() => sliderRef.current?.slickNext()}
        aria-label="Right Slide"
      >
        <FaChevronRight
          size={24}
          className="text-gray-800 hover:text-white transition-colors duration-300"
        />
      </button>
    </div>
  );
};

export default Carousel;
