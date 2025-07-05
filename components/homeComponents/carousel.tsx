"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { getCarouselImages } from "@/lib/carouselImg"; // Adjust path as needed
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";

interface CarouselImage {
  id: string;
  url: string;
  title: string;
}

const Carousel: React.FC = () => {
  const sliderRef = useRef<Slider>(null);
  const [images, setImages] = useState<CarouselImage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Step 1: Clear carousel images from localStorage on first load
        localStorage.removeItem("carousel_images");

        // Step 2: Fetch data from Firestore
        const data = await getCarouselImages();

        // Step 3: Format data
        const formattedData = data.map(
          (item: { id: string; url?: string ; title?: string}) => ({
            id: item.id,
            url: item.url || "",
            title: item.title || "", // fallback if URL is missing
          })
        );

        // Step 4: Store formatted data in localStorage
        localStorage.setItem("carousel_images", JSON.stringify(formattedData));

        // Step 5: Load from localStorage into state
        const storedImages = localStorage.getItem("carousel_images");
        if (storedImages) {
          setImages(JSON.parse(storedImages));
        } else {
          setImages(formattedData); // fallback
        }
      } catch (error) {
        console.error("Error fetching carousel images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
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

  return (
    <div className="relative w-full h-full bg-white">
      <Slider ref={sliderRef} {...settings} className="w-full h-full">
        {images.map((item) => (
          <div key={item.id} className="w-full h-full">
            <div className="w-full h-screen flex items-center justify-center p-4">
              <Image
                src={item.url || "/placeholder.svg"}
                alt={"Carousel Image"}
                width={800}
                height={600}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => router.push(`/product/${item.title}`)}
                priority
              />
            </div>
          </div>
        ))}
      </Slider>

      {/* Custom Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white bg-opacity-80 rounded-full shadow-lg transition-all duration-300 hover:bg-red-500 hover:bg-opacity-90 active:bg-red-600 hover:shadow-xl z-30"
        onClick={() => sliderRef.current?.slickPrev()}
      >
        <FaChevronLeft
          size={24}
          className="text-gray-800 hover:text-white transition-colors duration-300"
        />
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white bg-opacity-80 rounded-full shadow-lg transition-all duration-300 hover:bg-red-500 hover:bg-opacity-90 active:bg-red-600 hover:shadow-xl z-30"
        onClick={() => sliderRef.current?.slickNext()}
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
