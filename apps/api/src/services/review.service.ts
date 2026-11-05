import { PrismaClient } from "@prisma/client";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedUserError,
} from "../errors/app-error.js";

export interface UpsertReviewInput {
  placeId: string;
  userId: string;
  rating: number;
  body: string;
}

export class ReviewService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Upsert a user review for a place.
   * If the user already reviewed this place, the existing record is updated.
   * Otherwise, a new review is created.
   * Uses Prisma's upsert relying on the database unique constraint @@unique([placeId, userId]).
   */
  async upsertReview(input: UpsertReviewInput) {
    const { placeId, userId, rating, body } = input;

    // Validate inputs
    if (!placeId || typeof placeId !== "string" || placeId.trim() === "") {
      throw new ValidationError("Place ID is required");
    }

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      throw new UnauthorizedUserError("Valid user ID must be provided via X-User-Id header");
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ValidationError("Rating must be an integer between 1 and 5");
    }

    const trimmedBody = (body || "").trim();
    if (trimmedBody.length < 3) {
      throw new ValidationError("Review body must be at least 3 characters");
    }
    if (trimmedBody.length > 1000) {
      throw new ValidationError("Review body cannot exceed 1000 characters");
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedUserError(`User with ID '${userId}' does not exist.`);
    }

    // Verify place exists
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });
    if (!place) {
      throw new NotFoundError(`Place with ID '${placeId}' not found.`);
    }

    // Upsert review
    const review = await this.prisma.review.upsert({
      where: {
        placeId_userId: {
          placeId,
          userId,
        },
      },
      update: {
        rating,
        body: trimmedBody,
      },
      create: {
        placeId,
        userId,
        rating,
        body: trimmedBody,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      id: review.id,
      placeId: review.placeId,
      userId: review.userId,
      rating: review.rating,
      body: review.body,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      user: review.user,
    };
  }

  /**
   * Get all reviews for a place.
   */
  async getReviewsByPlace(placeId: string) {
    if (!placeId || typeof placeId !== "string") {
      throw new ValidationError("Place ID is required");
    }

    const reviews = await this.prisma.review.findMany({
      where: { placeId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map((r) => ({
      id: r.id,
      placeId: r.placeId,
      userId: r.userId,
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      user: r.user,
    }));
  }
}
