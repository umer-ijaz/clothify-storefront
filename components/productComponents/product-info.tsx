"use client";
import { Star, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/context/addToCartContext";
import Button from "../button";
import { toast } from "sonner";
import PaymentModal from "../paymentComponents/paymentModal";
import { useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { useUser } from "@/context/userContext";
import { useTaxStore } from "@/context/taxContext";
import formatName from "@/lib/formatNames";

interface ProductInfoProps {
  product: {
    id: string;
    productId: string;
    name: string;
    brand: string;
    category: string;
    subcategory: string;
    image: string;
    images: string[];
    currentPrice: number;
    originalPrice: number;
    discount: number;
    isBoth: boolean;
    stock: number;
    rating: number;
    isFlashSale: boolean;
    reviewsCount: number;
    reviews: any[];
    sku: string;
    description: string;
    material: string;
    features: string[];
    createdAt: string;
    updatedAt: string;
    variants: Variant[];
    // These will be the current variant's data passed from parent
    colors: { name: string; hex: string }[];
    sizes: string[];
    outOfStockSizes: string[];
  };
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  quantity: number;
  handleQuantityChange: (quantity: number) => void;
  currentVariant: Variant | null;
  hasVariants: boolean;
}

export interface Variant {
  color: {
    name: string;
    hex: string;
  };
  mainImage: string;
  subImages: string[];
  sizes: (string | number)[];
  outOfStockSizes?: (string | number)[];
}

export default function ProductInfo({
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  handleQuantityChange,
  currentVariant,
  hasVariants,
}: ProductInfoProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const fullStars = Math.floor(product.rating);
  const { taxRate } = useTaxStore();
  const hasHalfStar = product.rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  const [modal, setModal] = useState(false);
  const { user } = useUser();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Use the colors, sizes, and outOfStockSizes passed from parent (which are variant-specific)
  const availableColors = product.colors || [];
  const availableSizes = product.sizes || [];
  const outOfStockSizes = product.outOfStockSizes || [];

  // Enhanced validation function
  const validateSelection = () => {
    if (!hasVariants) {
      return { isValid: true, message: "" };
    }

    if (availableColors.length > 0 && !selectedColor) {
      return { isValid: false, message: "Bitte wählen Sie eine Farbe aus." };
    }

    if (availableSizes.length > 0 && !selectedSize) {
      return { isValid: false, message: "Bitte wählen Sie eine Größe aus." };
    }

    if (selectedSize && outOfStockSizes.includes(selectedSize)) {
      return {
        isValid: false,
        message: "Die ausgewählte Größe ist nicht verfügbar.",
      };
    }

    return { isValid: true, message: "" };
  };

  // Get the appropriate image for cart/purchase
  const getProductImage = () => {
    return currentVariant?.mainImage || product.image;
  };

  const handleAddToCart = () => {
    const validation = validateSelection();

    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.currentPrice,
      image: getProductImage(),
      quantity,
      color: selectedColor || "",
      size: selectedSize || "",
      stock: product.stock,
      isFlashSale: product.isFlashSale,
      isChecked: true,
    });
    toast.success("Produkt wurde zum Warenkorb hinzugefügt.");
  };

  const handleBuyNow = () => {
    if (!user) {
      setModal(true);
      setIsPaymentModalOpen(false);
      toast.error(
        "Der Benutzer muss angemeldet sein, um Zahlungen durchführen zu können."
      );
      return;
    }

    const validation = validateSelection();

    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    setIsPaymentModalOpen(true);
  };

  // Check if product is available for purchase
  const isProductAvailable = () => {
    return (
      product.stock > 0 &&
      (!selectedSize || !outOfStockSizes.includes(selectedSize))
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Title and Rating */}
      <header className="flex flex-col md:justify-between md:items-start gap-4">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex justify-between items-center gap-4">
            <h1 className="text-3xl font-semibold text-gray-900 heading-luxury">
              {formatName(product.name)}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-end gap-5">
            <span className="text-3xl font-bold text-green-500">
              €{product.currentPrice.toFixed(2)}
            </span>
            {product.originalPrice > product.currentPrice && (
              <span className="text-red-500 line-through text-lg">
                €{product.originalPrice.toFixed(2)}
              </span>
            )}
            {product.originalPrice > product.currentPrice && (
              <span className="bg-red-100 text-red-600 text-sm font-medium px-2 py-1 rounded-full">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Rating and Stock */}
          <div className="flex items-center gap-2">
            <div
              className="flex gap-1"
              role="img"
              aria-label={`Rating: ${product.rating} out of 5 stars`}
            >
              {Array.from({ length: fullStars }).map((_, i) => (
                <Star
                  key={`full-${i}`}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
              {hasHalfStar && (
                <div className="relative">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star
                    className="w-5 h-5 absolute top-0 left-0 fill-white text-yellow-400"
                    style={{
                      clipPath: "polygon(50% 0%, 50% 100%, 0% 100%, 0% 0%)",
                    }}
                  />
                </div>
              )}
              {Array.from({ length: emptyStars }).map((_, i) => (
                <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
              <span>({product.reviewsCount} Bewertungen)</span>
              <span
                className={`font-medium ${
                  isProductAvailable() ? "text-green-500" : "text-red-500"
                }`}
              >
                {isProductAvailable() ? "Auf Lager" : "Ausverkauft"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 heading">
            Details
          </h2>
          <pre className="text-gray-600 mb-4 mr-5 whitespace-pre-wrap body">
            {product.description}
          </pre>
          <div className="text-sm text-gray-500 space-y-1">
            <p className="subheading">
              <strong>SKU:</strong> {product.sku || "N/A"}
            </p>
          </div>
        </div>
      </header>

      {/* Product Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category and Subcategory */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 heading">
              Kategorie
            </h3>
            <p className="text-gray-600 body">
              {(product.category.toLowerCase() == "men" ||
                product.category.toLowerCase() == "herren" ||
                product.category.toLowerCase() == "women" ||
                product.category.toLowerCase() == "damen") &&
              product.isBoth == true
                ? "Herren & Damen"
                : product.category.toLowerCase() === "men" ||
                  product.category.toLowerCase() === "herren"
                ? "Herren"
                : product.category === "women" || product.category === "damen"
                ? "Damen"
                : formatName(
                    product.category.charAt(0).toUpperCase() +
                      product.category.slice(1)
                  )}
            </p>
          </div>
          {product.subcategory && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 heading">
                Unterkategorie
              </h3>
              <p className="text-gray-600 body">
                {(product.subcategory.toLowerCase() == "men" ||
                  product.subcategory.toLowerCase() == "herren" ||
                  product.subcategory.toLowerCase() == "women" ||
                  product.subcategory.toLowerCase() == "damen") &&
                product.isBoth == true
                  ? "Herren & Damen"
                  : product.subcategory.toLowerCase() === "men" ||
                    product.subcategory.toLowerCase() === "herren"
                  ? "Herren"
                  : product.subcategory.toLowerCase() == "women" ||
                    product.subcategory.toLowerCase() == "damen"
                  ? "Damen"
                  : formatName(
                      product.subcategory.charAt(0).toUpperCase() +
                        product.subcategory.slice(1)
                    )}
              </p>
            </div>
          )}
        </div>

        {/* Brand and Material */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 heading">
              Marke
            </h3>
            <p className="text-gray-600 body">{product.brand}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 heading">
              Material
            </h3>
            <p className="text-gray-600 body">{product.material}</p>
          </div>
        </div>
      </div>

      {/* Product Options */}
      <div className="space-y-6">
        {/* Colors - Only show if variants exist */}
        {availableColors.length > 0 && (
          <div>
            <p className="text-sm text-red-500 mb-2">
              Wählen Sie Farben aus, um relevante Fotos anzuzeigen
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 heading">
              Farben{" "}
              {!selectedColor && (
                <span className="text-red-500 text-sm">*</span>
              )}
            </h3>
            <div className="flex gap-3 flex-wrap">
              {availableColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-10 h-10 rounded-full transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 ${
                    selectedColor === color.name
                      ? "ring-2 ring-offset-2 ring-black border-black"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select color ${color.name}`}
                  title={color.name}
                />
              ))}
            </div>
            {selectedColor && (
              <p className="text-sm text-gray-600 mt-2">
                Ausgewählte Farbe:{" "}
                <span className="font-medium">{selectedColor}</span>
              </p>
            )}
          </div>
        )}

        {/* Sizes */}
        {availableSizes.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800 heading">
              Größe{" "}
              {!selectedSize && <span className="text-red-500 text-sm">*</span>}
            </h3>
            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size) => {
                const isOutOfStock = outOfStockSizes.includes(size);
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => !isOutOfStock && setSelectedSize(size)}
                    disabled={isOutOfStock}
                    className={`min-w-[3rem] px-3 h-10 rounded-full border font-medium transition-all duration-300 cursor-pointer ${
                      isSelected && !isOutOfStock
                        ? "bg-red-500 text-white border-red-500 shadow-md"
                        : isOutOfStock
                        ? "border-gray-300 text-gray-400 bg-gray-100 line-through cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-orange-400 hover:text-white hover:border-orange-400"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {selectedSize && (
              <p className="text-sm text-gray-600 mt-2">
                Ausgewählte Größe:{" "}
                <span className="font-medium">{selectedSize}</span>
              </p>
            )}
          </div>
        )}

        {/* Quantity */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Menge</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50 transition-all duration-300 hover:bg-red-500 hover:text-white disabled:hover:bg-gray-200 disabled:hover:text-current"
              aria-label="Decrease quantity"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-16 text-center text-lg font-semibold bg-gray-50 py-2 rounded-lg">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50 transition-all duration-300 hover:bg-red-500 hover:text-white disabled:hover:bg-gray-200 disabled:hover:text-current"
              aria-label="Increase quantity"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Verfügbar: {product.stock} Stück
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Button
          text="In den Warenkorb"
          onClick={handleAddToCart}
          disabled={!isProductAvailable()}
        />
        <Button
          text="Jetzt kaufen"
          onClick={handleBuyNow}
          disabled={!isProductAvailable()}
        />
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        taxRate={taxRate}
        products={[
          {
            id: product.id,
            color: selectedColor,
            size: selectedSize,
            quantity,
            name: product.name,
            price: product.currentPrice,
            isFlashSale: product.isFlashSale,
            image: getProductImage(),
          },
        ]}
      />
      <AuthModal isOpen={modal} onClose={() => setModal(false)} />
    </div>
  );
}
