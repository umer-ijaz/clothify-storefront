"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import ProductQuickViewButton from "./product-quick-view-button";
import { useState } from "react";
import { ShoppingBag, Star } from "lucide-react";
import { ProductCardEnhancedProps } from "@/interfaces/productCardinterface";
import formatNames from "@/lib/formatNames";

export default function ItemCard(props: ProductCardEnhancedProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageSrc =
    props.image || props.variants?.[0]?.mainImage || "/placeholder.svg";
  return (
    <div
      className="group relative bg-white rounded-md md:rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-[0.01px] border-gray-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative aspect-square overflow-hidden bg-gray-100 p-2 rounded-md"
        style={{ position: "relative" }}
      >
        <Link
          href={`/product/${props.id}`}
          className="block relative w-full h-full"
          aria-label={`${props.name}`}
        >
          <Image
            src={imageSrc}
            alt={props.name}
            width={500}
            height={500}
            quality={65}
            loading="lazy"
            className={cn(
              "object-cover transition-transform duration-500 p-2 shadow-sm cursor-pointer w-full h-full rounded-md"
            )}
            unoptimized={false}
          />
        </Link>
        {props.discount > 0 && (
          <Badge className="body absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full text-xs md:text-sm">
            {props.discount.toFixed(0)}% OFF
          </Badge>
        )}
        {props.isFlashSale === true && (
          <div className="absolute top-0 right-0 w-full h-auto">
            {/* Sale Ribbon */}
            <div className="absolute right-[-30px] top-4 bg-green-600 text-white text-xs font-medium md:font-bold py-1 px-8 transform rotate-45 shadow-md">
              ANGEBOT
            </div>
          </div>
        )}

        {/* Stock indicator */}
        {props.stock <= 5 && props.stock > 0 && (
          <div className="body absolute bottom-2 left-2 bg-amber-100 text-amber-900 text-xs md:text-sm px-2 py-1 rounded-full">
            Nur noch {props.stock} verfügbar
          </div>
        )}
        {props.stock === 0 && (
          <div className="body absolute bottom-2 left-2 bg-red-100 text-red-900 text-xs md:text-sm px-2 py-1 rounded-full">
            Nicht auf Lager
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground mb-1 subheading">
            {props.category.charAt(0).toUpperCase() +
              props.category.slice(1).toLowerCase() ==
            "Men"
              ? "Herren"
              : props.category.charAt(0).toUpperCase() +
                  props.category.slice(1).toLowerCase() ==
                "Women"
              ? "Damen"
              : props.category.charAt(0).toUpperCase() +
                props.category.slice(1).toLowerCase()}
          </div>
          <div className="flex flex-col gap-4 z-0">
            <ProductQuickViewButton product={props} iconOnly />
          </div>
        </div>
        <h3 className="font-medium text-lg mb-1 line-clamp-1 group-hover:text-red-500 transition-colors heading">
          {formatNames(props.name)}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(props.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({props.reviewsCount})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {props.originalPrice && props.originalPrice > props.currentPrice ? (
            <>
              <span className="font-semibold text-green-500 heading">
                €{props.currentPrice.toFixed(2)}
              </span>
              <span className="text-muted-foreground text-sm line-through text-red-500">
                €{props.originalPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-green-500 heading">
              €{props.currentPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-white p-3 transition-transform duration-300 border-none shadow-xl",
          isHovered ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="w-full flex justify-center body">
          <Link
            className="w-full gap-2 flex flex-row justify-center items-center py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transform transition-transform active:scale-95 rounded-full"
            href={`/product/${props.id}`}
            aria-label={`${props.name}`}
          >
            <ShoppingBag className="h-4 w-4 text-sm md:text-md" />
            Jetzt kaufen
          </Link>
        </div>
      </div>
    </div>
  );
}
