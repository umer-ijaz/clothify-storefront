"use client";
import { useEffect, useState } from "react";
import ProductDetailPage from "@/components/productComponents/product-details";
import { getProductById } from "@/lib/products";

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const [productId, setProductId] = useState<string>("");
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    async function extractProductIdAndFetchProduct() {
      try {
        // Extract productId from params
        const { productId: id } = await params;
        setProductId(id);

        // Fetch the complete product data
        const productData = await getProductById(id);
        setProduct(productData);
        
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }

    extractProductIdAndFetchProduct();
  }, [params]);

  return (
    <div className="w-full">
      <ProductDetailPage params={params} />
    </div>
  );
}
