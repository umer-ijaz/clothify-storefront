export interface Review {
  id: number;
  name: string;
  text: string;
  image?: string;
}

export interface ReviewsProps {
  reviews: Review[];
}
