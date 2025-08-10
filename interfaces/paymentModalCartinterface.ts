export interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  isFlashSale: boolean;
}
