"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartState } from "@/interfaces/cartContextInterface";

const CART_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) => {
        set((state) => {
          const existingItem = state.cart.find(
            (cartItem) =>
              cartItem.id === item.id &&
              cartItem.color === item.color &&
              cartItem.size === item.size &&
              cartItem.isFlashSale === item.isFlashSale // also check flash sale status
          );

          if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            const maxQuantity = item.stock ?? Infinity;

            return {
              cart: state.cart.map((cartItem) =>
                cartItem.id === item.id &&
                cartItem.color === item.color &&
                cartItem.size === item.size &&
                cartItem.isFlashSale === item.isFlashSale
                  ? {
                      ...cartItem,
                      quantity:
                        newQuantity > maxQuantity ? maxQuantity : newQuantity,
                    }
                  : cartItem
              ),
            };
          }

          return {
            cart: [
              ...state.cart,
              {
                ...item,
                quantity:
                  item.stock !== undefined && item.quantity > item.stock
                    ? item.stock
                    : item.quantity,
                isFlashSale: !!item.isFlashSale, // ensure we store boolean
              },
            ],
          };
        });
      },

      removeFromCart: (id, isFlashSale) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.id === id && item.isFlashSale === isFlashSale)
          ),
        }));
      },

      updateQuantity: (id, isFlashSale, quantity) => {
        set((state) => ({
          cart: state.cart.map((item) => {
            const maxStock = item.stock ?? Infinity;
            return item.id === id && item.isFlashSale === isFlashSale
              ? {
                  ...item,
                  quantity: quantity > maxStock ? maxStock : quantity,
                }
              : item;
          }),
        }));
      },

      getCartCount: () => {
        return get().cart.reduce((acc, item) => acc + item.quantity, 0);
      },

      clearCart: () => {
        set({ cart: [] });
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("cart_expiry");
        }
      },
    }),
    {
      name: "cart-storage",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => sessionStorage)
          : undefined,
    }
  )
);

const checkCartExpiration = () => {
  if (typeof window !== "undefined") {
    const expiry = sessionStorage.getItem("cart_expiry");
    if (expiry && Date.now() > Number(expiry)) {
      useCartStore.getState().clearCart();
    }
  }
};

const setCartExpiry = () => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(
      "cart_expiry",
      String(Date.now() + CART_EXPIRATION_TIME)
    );
  }
};

if (typeof window !== "undefined") {
  checkCartExpiration();
  useCartStore.subscribe((state) => {
    if (state.cart.length > 0) {
      setCartExpiry();
    }
  });
}
