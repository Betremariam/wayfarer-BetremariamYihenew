import { PrismaClient } from "@prisma/client";
import { RankingService } from "./ranking.service.js";
import { NotFoundError } from "../errors/app-error.js";
import { SortOption } from "@wayfarer/shared";

export interface GetPlacesFilter {
  category?: string;
  sort?: string;
  search?: string;
}

export class PlaceService {
  constructor(private prisma: PrismaClient) {}

  async getPlaces(filters: GetPlacesFilter = {}) {
    const { category, sort = SortOption.TOP_RATED, search } = filters;

    const whereClause: any = {};

    if (category && category !== "All" && category !== "all") {
      whereClause.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    if (search && search.trim() !== "") {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        { address: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const places = await this.prisma.place.findMany({
      where: whereClause,
      include: {
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const globalReviewsAggregate = await this.prisma.review.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });

    const globalC =
      globalReviewsAggregate._avg.rating !== null && globalReviewsAggregate._count.rating > 0
        ? Number(globalReviewsAggregate._avg.rating.toFixed(2))
        : RankingService.FALLBACK_GLOBAL_C;

    const placesWithStats = places.map((place) => {
      const reviewCount = place.reviews.length;
      const ratingSum = place.reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = reviewCount > 0 ? Number((ratingSum / reviewCount).toFixed(2)) : 0;

      const { reviews, ...placeData } = place;
      return {
        ...placeData,
        createdAt: placeData.createdAt.toISOString(),
        updatedAt: placeData.updatedAt.toISOString(),
        averageRating,
        reviewCount,
      };
    });

    const scoredPlaces = RankingService.rankPlaces(placesWithStats, globalC);

    let sortedPlaces = [...scoredPlaces];

    if (sort === SortOption.TOP_RATED) {
      sortedPlaces = scoredPlaces;
    } else if (sort === SortOption.MOST_REVIEWS) {
      sortedPlaces.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sort === SortOption.NEWEST) {
      sortedPlaces.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sortedPlaces.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      openingHours: p.openingHours,
      address: p.address,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      ratingStats: {
        averageRating: p.averageRating,
        reviewCount: p.reviewCount,
        bayesianScore: p.bayesianScore,
      },
    }));
  }

  async getPlaceById(id: string) {
    if (!id || typeof id !== "string") {
      throw new NotFoundError("Place ID is required");
    }

    const place = await this.prisma.place.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        tourSlots: {
          include: {
            bookings: {
              select: { seats: true },
            },
          },
          orderBy: { startsAt: "asc" },
        },
      },
    });

    if (!place) {
      throw new NotFoundError(`Place with ID '${id}' was not found`);
    }

    const globalReviewsAggregate = await this.prisma.review.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });

    const globalC =
      globalReviewsAggregate._avg.rating !== null && globalReviewsAggregate._count.rating > 0
        ? Number(globalReviewsAggregate._avg.rating.toFixed(2))
        : RankingService.FALLBACK_GLOBAL_C;

    const reviewCount = place.reviews.length;
    const ratingSum = place.reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviewCount > 0 ? Number((ratingSum / reviewCount).toFixed(2)) : 0;
    const bayesianScore = RankingService.calculateBayesianRating(averageRating, reviewCount, globalC);

    const tourSlots = place.tourSlots.map((slot) => {
      const bookedSeats = slot.bookings.reduce((sum, b) => sum + b.seats, 0);
      const remainingSeats = Math.max(0, slot.capacity - bookedSeats);
      return {
        id: slot.id,
        placeId: slot.placeId,
        startsAt: slot.startsAt.toISOString(),
        capacity: slot.capacity,
        bookedSeats,
        remainingSeats,
        isFullyBooked: remainingSeats === 0,
        createdAt: slot.createdAt.toISOString(),
      };
    });

    const reviews = place.reviews.map((r) => ({
      id: r.id,
      placeId: r.placeId,
      userId: r.userId,
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      user: r.user,
    }));

    return {
      id: place.id,
      name: place.name,
      category: place.category,
      description: place.description,
      openingHours: place.openingHours,
      address: place.address,
      imageUrl: place.imageUrl,
      createdAt: place.createdAt.toISOString(),
      updatedAt: place.updatedAt.toISOString(),
      ratingStats: {
        averageRating,
        reviewCount,
        bayesianScore,
      },
      reviews,
      tourSlots,
    };
  }
}
