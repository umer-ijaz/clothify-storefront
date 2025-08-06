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
        console.log("Product ID:", id);

        // Fetch the complete product data
        const productData = await getProductById(id);
        setProduct(productData);
        
        // Console log the whole product
        console.log("Complete Product Data:", productData);
        console.log("Product Name:", productData?.name);
        console.log("Product Category:", productData?.category);
        console.log("Product Price:", productData?.currentPrice);
        console.log("Product Stock:", productData?.stock);
        console.log("Product Variants:", productData?.variants);
        console.log("Product Reviews:", productData?.reviews);
        console.log("Product Reviews Count:", productData?.reviewsCount);
        console.log("Product Rating:", productData?.rating);
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
