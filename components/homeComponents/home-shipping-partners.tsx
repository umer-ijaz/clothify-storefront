"use client";

import Image from "next/image";

interface ShippingPartnersProps {
  images: { src: string; alt: string }[];
}

export default function ShippingPartners({ images }: ShippingPartnersProps) {
  // Repeat images enough times so we can slice later
  const repeatedImages = Array.from({ length: 8 }).map(
    (_, i) => images[i % images.length]
  );

  return (
    <section
      className="bg-white max-w-full"
      aria-labelledby="shipping-partners-title"
    >
      <div className="py-4 container m-auto shadow-md my-10">
        <ul
          className="flex gap-10 justify-center items-center flex-wrap"
          role="list"
        >
          {repeatedImages.map((image, index) => (
            <li
              key={index}
              className={`
                ${index >= 6 ? "hidden md:block" : ""} 
                list-none
              `}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={70}
                height={40}
                className="h-[30px] md:h-[40px] w-[50px] md:w-[70px] object-contain"
                loading={index < 2 ? "eager" : "lazy"}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
