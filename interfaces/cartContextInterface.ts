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
  isChecked: boolean;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, isFlashSale: boolean) => void;
  updateQuantity: (id: string, isFlashSale: boolean, quantity: number) => void;
  toggleChecked: (id: string, isFlashSale: boolean, checked: boolean) => void; // NEW
  getCartCount: () => number;
  clearCart: () => void;
}

export type { CartState, CartItem };
