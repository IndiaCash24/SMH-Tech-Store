export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  likes: number;
  thumbnail: string;
  isFlashDeal?: boolean;
  description: string;
  features: string[];
  screenshots: string[];
  demoUrl?: string;
  reviews?: Review[];
}

export type Category = 'All' | 'Business' | 'Communication' | 'Tools' | 'Games' | 'Admin';
