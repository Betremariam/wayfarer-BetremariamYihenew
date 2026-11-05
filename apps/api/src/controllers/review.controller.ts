import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service.js";
import { prisma } from "../db.js";
import { CreateReviewSchema } from "@wayfarer/shared";
import { UnauthorizedUserError } from "../errors/app-error.js";

const reviewService = new ReviewService(prisma);

export class ReviewController {
  static async upsertReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: placeId } = req.params;
      const userId = (req.headers["x-user-id"] as string) || (req.body.userId as string);

      if (!userId) {
        throw new UnauthorizedUserError("X-User-Id header is required to submit a review");
      }

      const validatedData = CreateReviewSchema.parse(req.body);

      const review = await reviewService.upsertReview({
        placeId,
        userId,
        rating: validatedData.rating,
        body: validatedData.body,
      });

      return res.status(200).json(review);
    } catch (error) {
      next(error);
    }
  }

  static async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: placeId } = req.params;
      const reviews = await reviewService.getReviewsByPlace(placeId);
      return res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }
}
