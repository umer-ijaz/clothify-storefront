"use client";

import { useState, useEffect } from "react";
import ProductList from "./home-product-list";
import FilterProducts from "./home-product-filter";
import DropDownFilter from "../drop-down-filter";
import { getProducts } from "@/lib/products";
import CategoryProductsInterface from "@/interfaces/categoriesInterface";
import TextBox from "../text-box";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { getFlashSaleItems } from "@/lib/flashSaleItems";

export default function ProductsPage() {
  const [products, setProducts] = useState<CategoryProductsInterface[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<
    CategoryProductsInterface[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortFilter, setSortFilter] = useState("");
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      let items = await getFlashSaleItems();
      const items2 = await getProducts();
      items = items.concat(items2).filter((item) => !item.isFlashSale);

      const mappedProducts: CategoryProductsInterface[] = items.map(
        (product) => ({
          ...product,
          id: String(product.id),
          brand: product.brand || "Unbekannte Marke",
          material: product.material || "Unbekanntes Material",
        })
      );

      setProducts(mappedProducts);
      setFilteredProducts(mappedProducts);
      setIsLoading(false);
    }

    fetchProducts();
  }, []);

  const handleFilterChange = ({
    category,
    searchTerm,
  }: {
    category: string;
    searchTerm: string;
  }) => {
    setCategory(category);
    setSearchTerm(searchTerm);
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      let updatedProducts = [...products];

      if (category !== "all") {
        updatedProducts = updatedProducts.filter(
          (product) => product.category.toLowerCase() === category.toLowerCase()
        );
      }

      if (searchTerm) {
        updatedProducts = updatedProducts.filter((product) =>
          product.name.toLowerCase().startsWith(searchTerm.toLowerCase())
        );
      }

      if (sortFilter) {
        updatedProducts = [...updatedProducts].sort((a, b) => {
          if (sortFilter === "Preis: Niedrig bis Hoch")
            return a.currentPrice - b.currentPrice;
          if (sortFilter === "Preis: Hoch bis Niedrig")
            return b.currentPrice - a.currentPrice;
          if (sortFilter === "Beste Bewertung") return b.rating - a.rating;
          return 0;
        });
      }

      setFilteredProducts(updatedProducts);
      setIsLoading(false);
    }, 500);
  }, [category, searchTerm, sortFilter, products]);

  return (
    <section className="h-auto w-full">
      {isLoading && (!products || products.length === 0) ? null : (
        <div className="mt-5">
          <div className="flex justify-between items-center pr-2 sm:pr-4 md:pr-8 lg:pr-12">
            <TextBox text={"Unsere Produkte"} />
            <Link
              href={"/allproducts"}
              className="body text-sm text-red-500 md:text-lg flex justify-center items-center gap-2 hover:bg-red-500 active:bg-red-500 active:text-white hover:text-white px-3 py-1 rounded-full transition-all duration-300"
            >
              Alle anzeigen
              <IoIosArrowForward size={20} />
            </Link>
          </div>
          <div className="p-6 px-4 lg:px-8 xl:px-12" id="products">
            <h2 className="text-2xl font-bold mb-4 heading-luxury">
              Aktuelle Trends
            </h2>
            <p className="text-gray-500 mb-6 subheading">
              Entdecken Sie die angesagtesten Produkte in unserem Shop.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pb-4 border-b border-gray-400">
              <FilterProducts
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
              />
              <div>
                <DropDownFilter onSortChange={setSortFilter} />
              </div>
            </div>
            <div className="mt-6">
              <ProductList products={filteredProducts} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
