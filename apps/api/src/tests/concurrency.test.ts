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
    if (testPlaceId) {
      await prisma.place.delete({ where: { id: testPlaceId } }).catch(() => {});
    }
    for (const uid of userIds) {
      await prisma.user.delete({ where: { id: uid } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("CRITICAL CONCURRENCY TEST: Exactly 2 of 20 concurrent requests succeed for 2 remaining seats", async () => {
    const slot = await prisma.tourSlot.create({
      data: {
        placeId: testPlaceId,
        startsAt: new Date(Date.now() + 86400000),
        capacity: 10,
      },
    });
    testSlotId = slot.id;

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

    const initialAggregate = await prisma.booking.aggregate({
      where: { slotId: testSlotId },
      _sum: { seats: true },
    });
    expect(initialAggregate._sum.seats).toBe(8);

    const concurrentRequests = 20;
    const bookingPromises: Promise<request.Response>[] = [];

    for (let i = 0; i < concurrentRequests; i++) {
      const travelerUserId = userIds[i + 2];
      const reqPromise = request(app)
        .post(`/api/tour-slots/${testSlotId}/bookings`)
        .set("X-User-Id", travelerUserId)
        .send({ seats: 1 });
      bookingPromises.push(reqPromise);
    }

    const results = await Promise.all(bookingPromises);

    const successfulResponses = results.filter((res) => res.status === 201);
    const rejectedResponses = results.filter((res) => res.status === 409 || res.status === 400);
    const serverErrorResponses = results.filter((res) => res.status >= 500);

    expect(serverErrorResponses.length).toBe(0);
    expect(successfulResponses.length).toBe(2);
    expect(rejectedResponses.length).toBe(18);

    for (const rejected of rejectedResponses) {
      expect(rejected.body).toHaveProperty("error");
      expect(rejected.body).toHaveProperty("code");
      expect(["SLOT_FULLY_BOOKED", "INSUFFICIENT_CAPACITY"]).toContain(rejected.body.code);
      expect(rejected.body.error).not.toMatch(/prisma|sql|syntax|violates/i);
    }

    const finalAggregate = await prisma.booking.aggregate({
      where: { slotId: testSlotId },
      _sum: { seats: true },
    });
    expect(finalAggregate._sum.seats).toBe(10);
  });

  it("Subsequent booking on fully booked slot returns friendly 409 error", async () => {
    const res = await request(app)
      .post(`/api/tour-slots/${testSlotId}/bookings`)
      .set("X-User-Id", userIds[24])
      .send({ seats: 1 });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("SLOT_FULLY_BOOKED");
    expect(res.body.error).toContain("fully booked");
  });

  it("Rejects booking request exceeding remaining capacity", async () => {
    const newSlot = await prisma.tourSlot.create({
      data: {
        placeId: testPlaceId,
        startsAt: new Date(Date.now() + 86400000 * 2),
        capacity: 4,
      },
    });

    const res = await request(app)
      .post(`/api/tour-slots/${newSlot.id}/bookings`)
      .set("X-User-Id", userIds[0])
      .send({ seats: 5 });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("INSUFFICIENT_CAPACITY");
    expect(res.body.error).toContain("Insufficient seats available");

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
