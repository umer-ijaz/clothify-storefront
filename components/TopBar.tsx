"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import formatName from "@/lib/formatNames";
import { fetchServices } from "@/lib/services";
import { Service } from "@/interfaces/services";
import { resizeImageUrl } from "@/lib/imagesizeadjutment";

const TopBar: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const getServices = async () => {
      try {
        const data = await fetchServices(); // Get all services without limit
        console.log("Fetched services:", data);
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    getServices();
  }, []);

  if (!services.length) {
    console.log("No services found, TopBar will not render");
    return null;
  }

  console.log("Rendering TopBar with services:", services.length);

  return (
    <section
      className="py-3 px-6 flex flex-col md:flex-row justify-between items-center shadow-xl gap-4 h-auto"
      aria-label="Top services"
    >
      {services.map((service, index) => (
        <article
          key={service.id}
          className="flex items-center space-x-4 w-full flex-1"
        >
          <Image
            src={
              service.mainImage
                ? resizeImageUrl(service.mainImage, "200x200")
                : service.mainImage
            }
            alt={`Image of ${service.name}`}
            width={50}
            height={50}
            priority={index === 0} // first one is above fold
            loading={index === 0 ? "eager" : "lazy"}
            className="rounded-md object-cover w-[50px] h-[50px]"
            onError={(e) => {
              e.currentTarget.src = service.mainImage;
            }}
          />
          <div>
            <h2 className="font-semibold text-gray-800 heading-luxury text-base">
              {formatName(service.name)}
            </h2>

            <Link
              href={`/services/${service.id}`}
              className="text-blue-600 text-sm hover:underline body"
              aria-label={`${service.name}`}
            >
              Read more about {service.name}
            </Link>
          </div>
        </article>
      ))}

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: services.map((service, i) => ({
              "@type": "Service",
              name: service.name,
              description: service.details,
              image: service.mainImage,
              position: i + 1,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/services/${service.id}`,
            })),
          }),
        }}
      />
    </section>
  );
};

export default TopBar;
