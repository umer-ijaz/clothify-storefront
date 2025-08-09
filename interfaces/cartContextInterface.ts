interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  stock?: number;
  isFlashSale: boolean;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, isFlashSale: boolean) => void; // updated
  updateQuantity: (id: string, isFlashSale: boolean, quantity: number) => void; // updated
  getCartCount: () => number;
  clearCart: () => void;
}

export type { CartState, CartItem };
