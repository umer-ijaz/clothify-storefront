"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import ProductImages from "../productComponents/product-images";
import ProductInfo from "../productComponents/product-info";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
}: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.length > 0 ? product.colors[0].name : ""
  );
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.length > 0 ? product.sizes[0] : "XS"
  );

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product?.stock) {
      setQuantity(newQuantity);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/50 fixed inset-0 z-40" />
      <DialogContent className="max-w-[99vw]-lg md:max-w-[95vw] p-0 max-h-[90vh] overflow-y-auto scrollbar-hide bg-white z-50 rounded-lg">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        <div className="relative w-full overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-red-500">
            <h2 className="text-xl font-bold truncate">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-x-hidden w-full">
            {/* Product Images */}
            <div className="w-full md:w-1/2 overflow-hidden">
              <ProductImages
                product={product}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
              />
            </div>

            {/* Product Info */}
            <div className="w-full md:w-1/2 overflow-hidden">
              <ProductInfo
                product={product}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                quantity={quantity}
                handleQuantityChange={handleQuantityChange}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
