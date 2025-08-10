"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import formatName from "@/lib/formatNames";
import { fetchServices } from "@/lib/services";
import { Service } from "@/interfaces/services";

const TopBar: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const getServices = async () => {
      const data = await fetchServices(2); // limit to 2
      setServices(data);
    };

    getServices();
  }, []);

  return (
    <div className="py-3 px-6 flex flex-col md:flex-row justify-between items-center shadow-xl gap-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-center space-x-4 w-full md:w-1/2"
        >
          <Image
            src={service.mainImage}
            alt={service.name}
            width={50}
            height={50}
            className="rounded-md object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-800 heading-luxury">
              {formatName(service.name)}
            </h4>
            <p className="hidden md:block md:h-[40px] line-clamp-0 text-sm text-gray-600 overflow-hidden body">
              {service.details}
            </p>
            <Link
              href={`/services/${service.id}`}
              className="text-blue-600 text-sm hover:underline body"
            >
              Mehr lesen
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopBar;
