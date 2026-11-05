import { PrismaClient, Prisma } from "@prisma/client";
import {
  NotFoundError,
  ValidationError,
  SlotFullyBookedError,
  InsufficientCapacityError,
  UnauthorizedUserError,
} from "../errors/app-error.js";

export interface BookingResult {
  booking: {
    id: string;
    slotId: string;
    userId: string;
    seats: number;
    createdAt: Date;
    user?: {
      id: string;
      name: string;
    };
  };
  remainingSeats: number;
  capacity: number;
  isFullyBooked: boolean;
}

export class BookingService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Concurrency-safe seat reservation.
   *
   * Utilizes a PostgreSQL interactive transaction with explicit row-level locking:
   * `SELECT ... FOR UPDATE` on the target TourSlot.
   *
   * This guarantees that concurrent booking attempts for the same tour slot
   * are strictly serialized at the database row level, preventing race conditions
   * and double-allocation of seats.
   */
  async bookSeats(
    slotId: string,
    userId: string,
    requestedSeats: number
  ): Promise<BookingResult> {
    if (!slotId || typeof slotId !== "string" || slotId.trim() === "") {
      throw new ValidationError("Tour slot ID is required and must be a valid string");
    }

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      throw new UnauthorizedUserError("Valid user ID must be provided via X-User-Id header");
    }

    if (!Number.isInteger(requestedSeats) || requestedSeats <= 0) {
      throw new ValidationError("Requested seats must be a positive integer greater than zero");
    }

    if (requestedSeats > 10) {
      throw new ValidationError("Cannot book more than 10 seats in a single request");
    }

    return await this.prisma.$transaction(
      async (tx) => {
        // Step 1: Validate active user
        const user = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new UnauthorizedUserError(`User with ID '${userId}' does not exist.`);
        }

        // Step 2: Acquire an exclusive row lock on the target TourSlot using parameterized raw SQL.
        // `SELECT ... FOR UPDATE` acquires an exclusive row-level lock in PostgreSQL.
        // Any other concurrent transaction trying to lock or update this row will block
        // until this transaction commits or rolls back.
        const lockedSlots = await tx.$queryRaw<
          Array<{ id: string; capacity: number; placeId: string; startsAt: Date }>
        >`
          SELECT id, capacity, "placeId", "startsAt"
          FROM tour_slots
          WHERE id = ${slotId}
          FOR UPDATE
        `;

        if (!lockedSlots || lockedSlots.length === 0) {
          throw new NotFoundError(`Tour slot with ID '${slotId}' was not found`);
        }

        const slot = lockedSlots[0];

        // Step 3: Compute current total booked seats under the held lock
        const bookingsAggregate = await tx.booking.aggregate({
          where: { slotId },
          _sum: { seats: true },
        });

        const bookedSeats = bookingsAggregate._sum.seats ?? 0;
        const remainingSeats = slot.capacity - bookedSeats;

        // Step 4: Validate capacity constraints
        if (remainingSeats <= 0) {
          throw new SlotFullyBookedError(
            `This tour slot is fully booked. There are 0 remaining seats available.`
          );
        }

        if (requestedSeats > remainingSeats) {
          throw new InsufficientCapacityError(
            `Insufficient seats available. Only ${remainingSeats} seat${
              remainingSeats === 1 ? "" : "s"
            } left, but ${requestedSeats} requested.`
          );
        }

        // Step 5: Insert booking
        const newBooking = await tx.booking.create({
          data: {
            slotId,
            userId,
            seats: requestedSeats,
          },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        });

        const updatedRemainingSeats = remainingSeats - requestedSeats;

        return {
          booking: newBooking,
          remainingSeats: updatedRemainingSeats,
          capacity: slot.capacity,
          isFullyBooked: updatedRemainingSeats <= 0,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 10000,
      }
    );
  }

  /**
   * Retrieves all tour slots for a given place with real-time remaining seats.
   */
  async getSlotsByPlace(placeId: string) {
    if (!placeId || typeof placeId !== "string") {
      throw new ValidationError("Place ID is required");
    }

    const slots = await this.prisma.tourSlot.findMany({
      where: { placeId },
      include: {
        bookings: {
          select: { seats: true },
        },
      },
      orderBy: { startsAt: "asc" },
    });

    return slots.map((slot) => {
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
  }
}
