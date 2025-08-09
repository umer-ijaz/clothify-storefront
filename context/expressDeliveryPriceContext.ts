"use client";

import { fetchExpressDeliveryPrice } from "@/lib/deliveryPrice";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ExpressDeliveryPriceState {
  expressPrice: number;
  setDeliveryPrice: (price: number) => void;
  clearDeliveryPrice: () => void;
  initializeDeliveryPrice: () => Promise<void>;
}

const DELIVERY_PRICE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

export const useExpressDeliveryPriceStore = create<ExpressDeliveryPriceState>()(
  persist(
    (set, get) => ({
      expressPrice: 10, // Default delivery price

      setDeliveryPrice: (price) => {
        set({ expressPrice: price });
        setDeliveryPriceExpiry();
      },

      clearDeliveryPrice: () => {
        set({ expressPrice: 10 });
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("delivery_price_expiry");
        }
      },

      initializeDeliveryPrice: async () => {
        try {
          const expressPrice = await fetchExpressDeliveryPrice();
          set({ expressPrice: expressPrice || 10 });
        } catch (error) {
          console.error("Failed to fetch delivery price:", error);
          set({ expressPrice: 10 }); // fallback
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
      useExpressDeliveryPriceStore.getState().clearDeliveryPrice();
      return true;
    }
  }
  return false;
};

// Initialize delivery price when the store is created (client-side only)
if (typeof window !== "undefined") {
  const store = useExpressDeliveryPriceStore.getState();
  if (!checkDeliveryPriceExpiration()) {
    store.initializeDeliveryPrice();
  }
}
