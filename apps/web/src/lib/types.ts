export interface User {
  id: string;
  name: string;
  createdAt: string;
}

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface TourSlot {
  id: string;
  placeId: string;
  startsAt: string;
  capacity: number;
  bookedSeats: number;
  remainingSeats: number;
  isFullyBooked: boolean;
  createdAt: string;
}

export interface RatingStats {
  averageRating: number;
  reviewCount: number;
  bayesianScore: number;
}

export interface PlaceSummary {
  id: string;
  name: string;
  category: string;
  description: string;
  openingHours: string;
  address: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  ratingStats: RatingStats;
}

export interface PlaceDetail extends PlaceSummary {
  reviews: Review[];
  tourSlots: TourSlot[];
}
