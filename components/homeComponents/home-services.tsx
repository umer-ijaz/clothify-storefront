"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import TextBox from "../text-box";
import ShippingPartners from "./home-shipping-partners";
import { shippingPartnersImages } from "@/data/shippingPartnersImages";
import { fetchHomeServices } from "@/lib/homeServices";
import { HomeService } from "@/interfaces/homeserviceinterface";
import formatName from "@/lib/formatNames";

export default function HomeServices() {
  const [homeServices, setHomeServices] = useState<HomeService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      const services = await fetchHomeServices();
      setHomeServices(services);
      setIsLoading(false);
    };

    loadServices();
  }, []);

  const chunkArray = (array: HomeService[], size: number) => {
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArr.push(array.slice(i, i + size));
    }
    return chunkedArr;
  };

  const serviceRows = chunkArray(homeServices, 2);

  const SkeletonCard = () => (
    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-start flex-1 animate-pulse">
      <div className="flex flex-row items-center justify-between gap-2 w-full">
        <div className="bg-gray-300 rounded-full w-14 h-14"></div>
        <div className="bg-gray-300 h-8 w-12 rounded"></div>
      </div>
      <div className="bg-gray-300 h-5 w-3/4 mt-3 rounded"></div>
      <div className="bg-gray-300 h-4 w-full mt-2 rounded"></div>
      <div className="bg-gray-300 h-4 w-5/6 mt-2 rounded"></div>
    </div>
  );

  return (
    <section>
      <TextBox text="Dienstleistungen" />
      <ShippingPartners images={shippingPartnersImages} />

      <h2 className="text-2xl md:text-3xl font-bold px-4 sm:px-6 md:px-8 lg:px-12 py-4 md:py-6 heading-luxury">
        Wir bieten Ihnen das Beste
        <span className="text-red-500">,</span>
      </h2>

      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col lg:flex-row items-start gap-8 py-4">
        <div className="flex flex-col gap-6 lg:w-3/5">
          {isLoading ? (
            <>
              {[serviceRows].map((_, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-6">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ))}
            </>
          ) : (
            serviceRows.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="flex flex-col sm:flex-row gap-6"
              >
                {row.map((service) => (
                  <div
                    key={service.number}
                    className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-start flex-1 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                  >
                    <div className="flex flex-row items-center justify-between gap-2 w-full">
                      <div className="relative w-14 h-14">
                        <Image
                          src={service.imageUrl || "/placeholder.svg"}
                          fill
                          sizes="(max-width: 768px) 50px, 56px"
                          alt={service.name}
                          className="object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-gray-300 text-4xl md:text-5xl font-extrabold">
                        {service.number}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mt-3 heading">
                      {formatName(service.name)}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base mt-2 body">
                      {service.content}
                    </p>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="lg:w-2/5 mt-6 lg:mt-0">
          <div className="relative overflow-hidden rounded-xl shadow-xl">
            <Image
              src="/route.svg"
              width={600}
              height={600}
              alt="Delivery route"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
