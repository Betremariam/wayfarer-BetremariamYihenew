import { Request, Response, NextFunction } from "express";
import { BookingService } from "../services/booking.service.js";
import { prisma } from "../db.js";
import { CreateBookingSchema } from "@wayfarer/shared";
import { UnauthorizedUserError } from "../errors/app-error.js";

const bookingService = new BookingService(prisma);

export class BookingController {
  static async getTourSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: placeId } = req.params;
      const slots = await bookingService.getSlotsByPlace(placeId);
      return res.status(200).json(slots);
    } catch (error) {
      next(error);
    }
  }

  static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: slotId } = req.params;
      const userId = (req.headers["x-user-id"] as string) || (req.body.userId as string);

      if (!userId) {
        throw new UnauthorizedUserError("X-User-Id header is required to book a tour");
      }

      const validated = CreateBookingSchema.parse(req.body);

      const result = await bookingService.bookSeats(slotId, userId, validated.seats);

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

