"use client";
import FlashSaleItems from "@/components/flashSaleItems";
import HomeServices from "@/components/homeComponents/home-services";
import ProductsPage from "@/components/homeComponents/homePage-products";
import Hero from "@/components/homeComponents/mainHero";

export default function Home() {
  return (
    <main className="width-full overflow-hidden h-full">
      <Hero />
      <FlashSaleItems />
      <ProductsPage />
      <HomeServices />
    </main>
  );
}
