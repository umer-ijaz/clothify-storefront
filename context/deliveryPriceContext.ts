"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { fetchDeliveryPrice } from "@/lib/deliveryPrice";

interface DeliveryPriceState {
  deliveryPrice: number;
  setDeliveryPrice: (price: number) => void;
  clearDeliveryPrice: () => void;
  initializeDeliveryPrice: () => Promise<void>;
}

const DELIVERY_PRICE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

export const useDeliveryPriceStore = create<DeliveryPriceState>()(
  persist(
    (set, get) => ({
      deliveryPrice: 10, // Default delivery price

      setDeliveryPrice: (price) => {
        set({ deliveryPrice: price });
        setDeliveryPriceExpiry();
      },

      clearDeliveryPrice: () => {
        set({ deliveryPrice: 10 });
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("delivery_price_expiry");
        }
      },

      initializeDeliveryPrice: async () => {
        try {
          const deliveryPrice = await fetchDeliveryPrice();
          console.log("Delivery price fetched:", deliveryPrice);
          set({ deliveryPrice: deliveryPrice || 10 });
        } catch (error) {
          console.error("Failed to fetch delivery price:", error);
          set({ deliveryPrice: 10 }); // fallback
        }
      },
    }),
    {
      name: "delivery-price-storage",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => sessionStorage)
          : undefined,
    }
  )
);

const setDeliveryPriceExpiry = () => {
  if (typeof window !== "undefined") {
    const expiry = new Date().getTime() + DELIVERY_PRICE_EXPIRATION_TIME;
    sessionStorage.setItem("delivery_price_expiry", expiry.toString());
  }
};

const checkDeliveryPriceExpiration = () => {
  if (typeof window !== "undefined") {
    const expiry = sessionStorage.getItem("delivery_price_expiry");
    if (expiry && new Date().getTime() > parseInt(expiry)) {
      useDeliveryPriceStore.getState().clearDeliveryPrice();
      return true;
    }
  }
  return false;
};

// Initialize delivery price when the store is created (client-side only)
if (typeof window !== "undefined") {
  const store = useDeliveryPriceStore.getState();
  if (!checkDeliveryPriceExpiration()) {
    store.initializeDeliveryPrice();
  }
}
