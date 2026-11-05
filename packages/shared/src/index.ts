import { z } from "zod";

export const PlaceCategory = {
  ALL: "All",
  HISTORY: "History",
  FOOD: "Food",
  NATURE: "Nature",
  CULTURE: "Culture",
} as const;

export type PlaceCategoryType = (typeof PlaceCategory)[keyof typeof PlaceCategory];

export const SortOption = {
  TOP_RATED: "top-rated",
  MOST_REVIEWS: "most-reviews",
  NEWEST: "newest",
} as const;

export type SortOptionType = (typeof SortOption)[keyof typeof SortOption];

export interface UserDto {
  id: string;
  name: string;
  createdAt: string;
}

export interface ReviewDto {
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

export interface TourSlotDto {
  id: string;
  placeId: string;
  startsAt: string;
  capacity: number;
  bookedSeats: number;
  remainingSeats: number;
  isFullyBooked: boolean;
  createdAt: string;
}

export interface PlaceSummaryDto {
  id: string;
  name: string;
  category: string;
  description: string;
  openingHours: string;
  address: string;
  imageUrl: string;
  ratingStats: {
    averageRating: number;
    reviewCount: number;
    bayesianScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PlaceDetailDto extends PlaceSummaryDto {
  reviews: ReviewDto[];
  tourSlots: TourSlotDto[];
}

export interface BookingDto {
  id: string;
  slotId: string;
  userId: string;
  seats: number;
  createdAt: string;
  slot?: {
    id: string;
    placeId: string;
    startsAt: string;
    capacity: number;
  };
}

export const PlacesQuerySchema = z.object({
  category: z.string().optional(),
  sort: z.enum([SortOption.TOP_RATED, SortOption.MOST_REVIEWS, SortOption.NEWEST]).optional(),
  search: z.string().optional(),
});

export type PlacesQuery = z.infer<typeof PlacesQuerySchema>;

export const CreateReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  body: z
    .string()
    .trim()
    .min(3, "Review text must be at least 3 characters")
    .max(1000, "Review text cannot exceed 1000 characters"),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const CreateBookingSchema = z.object({
  seats: z
    .number()
    .int("Seats must be a positive integer")
    .min(1, "You must book at least 1 seat")
    .max(10, "You cannot book more than 10 seats per request"),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const BAYESIAN_M_DEFAULT = 10;
export const BAYESIAN_DEFAULT_C = 3.5;

export function calculateBayesianRating(
  R: number,
  v: number,
  C: number = BAYESIAN_DEFAULT_C,
  m: number = BAYESIAN_M_DEFAULT
): number {
  if (v <= 0) {
    return Number(C.toFixed(2));
  }
  const weighted = (v / (v + m)) * R + (m / (v + m)) * C;
  return Number(weighted.toFixed(2));
}
