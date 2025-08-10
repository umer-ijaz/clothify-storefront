export interface Service {
  id: string;
  name: string;
  details: string;
  mainImage: string;
  subImages: string[];
  video: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}
