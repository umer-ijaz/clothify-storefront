"use client";

import { useCategoryFilter } from "@/context/useCategoryFilter";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Button from "../button";

const categoryMap = {
  "/category/men": [
    "T-Shirts & Polos",
    "Hoodies & Sweaters",
    "Jackets & Coats",
    "Shorts",
    "Shirts (Casual & Formal)",
    "Shoes & Accessories",
  ],
  "/category/women": [
    "Dresses",
    "Skirts",
    "Blouses & Tops",
    "Jeans",
    "Activewear",
    "Swimwear",
  ],
  "/category/footwear": [
    "Sneakers",
    "Formal Shoes",
    "Boots",
    "Sandals & Flip-Flops",
    "Slippers",
  ],
  "/category/leather": [
    "Leather Jackets",
    "Leather Bags",
    "Leather Shoes",
    "Leather Accessories",
  ],
  "/category/workwear": [
    "Safety Boots",
    "Industrial Wear",
    "Office Formal Wear",
    "Durable Jackets",
  ],
};

interface ProductListProps {
  brands: string[];
  size: (string | number)[];
  materials: string[];
  setIsLoading?: (loading: boolean) => void;
}
const SideBar = ({ brands, size, materials }: ProductListProps) => {
  const {
    selectedFilters,
    setPriceFilter,
    toggleSizeFilter,
    setBrandFilter,
    setMaterialFilter,
    clearFilters,
  } = useCategoryFilter();

  const pathname = usePathname();
  const categories = useMemo(
    () => categoryMap[pathname as keyof typeof categoryMap] || [],
    [pathname]
  );

  return (
    <div className="w-full font-sans p-4">
      {/* Clear Filters */}
      <div className="flex w-full justify-center items-center flex-wrap mb-2">
        <Button
          text={"Filter zurücksetzen"}
          onClick={clearFilters}
        />
      </div>

      {/* Filters Section */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-3 heading">
          Filters
        </h2>

        {/* Size Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 heading">
            Größe
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from(
              new Set(
                size
                  .filter(
                    (s) =>
                      s !== null && s !== undefined && String(s).trim() !== ""
                  )
                  .map((s) => String(s).trim())
              )
            )
              .sort((a, b) => {
                const aNum = Number(a);
                const bNum = Number(b);
                const aIsNum = !isNaN(aNum);
                const bIsNum = !isNaN(bNum);

                if (aIsNum && bIsNum) {
                  return aNum - bNum; // sort numbers ascending
                } else if (aIsNum) {
                  return -1; // numbers come before strings
                } else if (bIsNum) {
                  return 1;
                } else {
                  // both are strings → sort case-insensitively
                  return a.toLowerCase().localeCompare(b.toLowerCase());
                }
              })
              .map((sizeValue) => (
                <button
                  key={sizeValue}
                  onClick={() => toggleSizeFilter(sizeValue)}
                  className={`text-sm px-4 py-1 border rounded-full transition-all duration-200 cursor-pointer body ${
                    selectedFilters.sizes
                      .map((s) => String(s).toLowerCase())
                      .includes(sizeValue.toLowerCase())
                      ? "bg-red-500 text-white border-red-500"
                      : "text-gray-600 border-gray-300 hover:border-red-500"
                  }`}
                >
                  {sizeValue.charAt(0).toUpperCase() +
                    sizeValue.slice(1).toLowerCase()}
                </button>
              ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 heading">
            Marken
          </h3>
          <ul className="space-y-2 ">
            {Array.from(
              new Set(
                brands
                  .filter((b) => typeof b === "string" && b.trim() !== "") // remove null/undefined/empty
                  .map((b) => b.trim().toLowerCase())
              )
            ).map((brand) => (
              <button
                key={brand}
                onClick={() => setBrandFilter(brand)}
                className={`text-sm w-full text-left py-1 px-2 rounded-md transition-all duration-200 cursor-pointer ${
                  selectedFilters.brand?.toLowerCase() === brand
                    ? "bg-red-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {brand.charAt(0).toUpperCase() + brand.slice(1)}
              </button>
            ))}
          </ul>
        </div>

        {/* Material Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Material</h3>
          <ul className="space-y-2 ">
            {Array.from(new Set(materials.map((m) => m.trim()))).map(
              (material) => (
                <button
                  key={material}
                  onClick={() => setMaterialFilter(material)}
                  className={`text-sm w-full text-left py-1 px-2 rounded-md transition-all duration-200 cursor-pointer ${
                    selectedFilters.material === material
                      ? "bg-red-500 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {material}
                </button>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
