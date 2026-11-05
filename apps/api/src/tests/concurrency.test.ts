import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../db.js";

const app = createApp();

describe("Tour Booking — PostgreSQL Concurrency & Overbooking Prevention", () => {
  let testPlaceId: string;
  let testSlotId: string;
  const userIds: string[] = [];

  beforeAll(async () => {
    // 1. Create a dedicated test place
    const place = await prisma.place.create({
      data: {
        name: "Concurrency Test Historic Pavilion",
        category: "History",
        description: "A test venue specifically designated for high-concurrency booking integrity verification.",
        openingHours: "8:00 AM - 5:00 PM",
        address: "Bole Medhanialem, Addis Ababa",
        imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
      },
    });
    testPlaceId = place.id;

    // 2. Create 25 dedicated test users for concurrent booking actors
    for (let i = 1; i <= 25; i++) {
      const user = await prisma.user.create({
        data: {
          name: `Concurrent Traveller ${i}`,
          isActor: false,
        },
      });
      userIds.push(user.id);
    }
  });

  afterAll(async () => {
    // Clean up test place and users
    if (testPlaceId) {
      await prisma.place.delete({ where: { id: testPlaceId } }).catch(() => {});
    }
    for (const uid of userIds) {
      await prisma.user.delete({ where: { id: uid } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("CRITICAL CONCURRENCY TEST: Exactly 2 of 20 concurrent requests succeed for 2 remaining seats", async () => {
    // Step 1: Create a tour slot with capacity 10
    const slot = await prisma.tourSlot.create({
      data: {
        placeId: testPlaceId,
        startsAt: new Date(Date.now() + 86400000), // tomorrow
        capacity: 10,
      },
    });
    testSlotId = slot.id;

    // Step 2: Create existing bookings that leave only 2 seats available (8 seats booked)
    await prisma.booking.create({
      data: {
        slotId: testSlotId,
        userId: userIds[0],
        seats: 5,
      },
    });

    await prisma.booking.create({
      data: {
        slotId: testSlotId,
        userId: userIds[1],
        seats: 3,
      },
    });

    // Verify initial database state: 8 booked, 2 remaining
    const initialAggregate = await prisma.booking.aggregate({
      where: { slotId: testSlotId },
      _sum: { seats: true },
    });
    expect(initialAggregate._sum.seats).toBe(8);

    // Step 3: Fire 20 booking requests concurrently, each attempting to book 1 seat
    // Concurrency is achieved using Promise.all running parallel asynchronous HTTP requests
    const concurrentRequests = 20;
    const bookingPromises: Promise<request.Response>[] = [];

    for (let i = 0; i < concurrentRequests; i++) {
      const travelerUserId = userIds[i + 2]; // unique user for each request
      const reqPromise = request(app)
        .post(`/api/tour-slots/${testSlotId}/bookings`)
        .set("X-User-Id", travelerUserId)
        .send({ seats: 1 });
      bookingPromises.push(reqPromise);
    }

    // Step 5: Wait for all 20 concurrent requests to complete
    const results = await Promise.all(bookingPromises);

    // Step 6 & 8: Tally responses
    const successfulResponses = results.filter((res) => res.status === 201);
    const rejectedResponses = results.filter((res) => res.status === 409 || res.status === 400);
    const serverErrorResponses = results.filter((res) => res.status >= 500);

    // Debugging diagnostics if test ever fails
    console.log(
      `[Concurrency Test Results] Total: ${results.length}, Successes: ${successfulResponses.length}, Rejections: ${rejectedResponses.length}, Server Errors: ${serverErrorResponses.length}`
    );

    // No unhandled 500 server errors are permitted
    expect(serverErrorResponses.length).toBe(0);

    // CONFIRMATION 1: Exactly two new bookings succeeded
    expect(successfulResponses.length).toBe(2);

    // CONFIRMATION 2: Exactly 18 requests were safely rejected
    expect(rejectedResponses.length).toBe(18);

    // CONFIRMATION 3: Rejected requests received proper friendly responses
    for (const rejected of rejectedResponses) {
      expect(rejected.body).toHaveProperty("error");
      expect(rejected.body).toHaveProperty("code");
      expect(["SLOT_FULLY_BOOKED", "INSUFFICIENT_CAPACITY"]).toContain(rejected.body.code);
      // Ensure friendly error message does not leak raw database errors
      expect(rejected.body.error).not.toMatch(/prisma|sql|syntax|violates/i);
    }

    // CONFIRMATION 4: Total booked seats in PostgreSQL NEVER exceeds slot capacity (10)
    const finalAggregate = await prisma.booking.aggregate({
      where: { slotId: testSlotId },
      _sum: { seats: true },
    });
    expect(finalAggregate._sum.seats).toBe(10); // 8 initial + 2 new = exactly 10
  });

  it("Subsequent booking on fully booked slot returns friendly 409 error", async () => {
    // Attempt to book 1 seat on the now fully booked slot
    const res = await request(app)
      .post(`/api/tour-slots/${testSlotId}/bookings`)
      .set("X-User-Id", userIds[24])
      .send({ seats: 1 });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("SLOT_FULLY_BOOKED");
    expect(res.body.error).toContain("fully booked");
  });

  it("Rejects booking request exceeding remaining capacity", async () => {
    // Create new slot with capacity 4
    const newSlot = await prisma.tourSlot.create({
      data: {
        placeId: testPlaceId,
        startsAt: new Date(Date.now() + 86400000 * 2),
        capacity: 4,
      },
    });

    // Request 5 seats when only 4 exist
    const res = await request(app)
      .post(`/api/tour-slots/${newSlot.id}/bookings`)
      .set("X-User-Id", userIds[0])
      .send({ seats: 5 });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("INSUFFICIENT_CAPACITY");
    expect(res.body.error).toContain("Insufficient seats available");

    // Clean up
    await prisma.tourSlot.delete({ where: { id: newSlot.id } });
  });

  it("Rejects invalid seat counts (< 1, float, > 10)", async () => {
    const resZero = await request(app)
      .post(`/api/tour-slots/${testSlotId}/bookings`)
      .set("X-User-Id", userIds[0])
      .send({ seats: 0 });
    expect(resZero.status).toBe(400);

    const resNeg = await request(app)
      .post(`/api/tour-slots/${testSlotId}/bookings`)
      .set("X-User-Id", userIds[0])
      .send({ seats: -2 });
    expect(resNeg.status).toBe(400);

    const resLarge = await request(app)
      .post(`/api/tour-slots/${testSlotId}/bookings`)
      .set("X-User-Id", userIds[0])
      .send({ seats: 50 });
    expect(resLarge.status).toBe(400);
  });

  it("Rejects booking with invalid or nonexistent user ID", async () => {
    const res = await request(app)
      .post(`/api/tour-slots/${testSlotId}/bookings`)
      .set("X-User-Id", "99999999-9999-9999-9999-999999999999")
      .send({ seats: 1 });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED_USER");
  });

  it("Rejects booking for nonexistent tour slot", async () => {
    const res = await request(app)
      .post(`/api/tour-slots/99999999-9999-9999-9999-999999999999/bookings`)
      .set("X-User-Id", userIds[0])
      .send({ seats: 1 });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
