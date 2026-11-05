import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../db.js";

const app = createApp();

describe("Places API", () => {
  beforeAll(async () => {});

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /api/places should return all seeded places with Bayesian scores and stats", async () => {
    const res = await request(app).get("/api/places");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(10);

    const first = res.body[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("category");
    expect(first).toHaveProperty("ratingStats");
    expect(first.ratingStats).toHaveProperty("averageRating");
    expect(first.ratingStats).toHaveProperty("reviewCount");
    expect(first.ratingStats).toHaveProperty("bayesianScore");

    for (let i = 0; i < res.body.length - 1; i++) {
      expect(res.body[i].ratingStats.bayesianScore).toBeGreaterThanOrEqual(
        res.body[i + 1].ratingStats.bayesianScore
      );
    }
  });

  it("GET /api/places?category=History should filter by category on the backend", async () => {
    const res = await request(app).get("/api/places?category=History");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((place: any) => {
      expect(place.category).toBe("History");
    });
  });

  it("GET /api/places?category=Nature should filter Nature places", async () => {
    const res = await request(app).get("/api/places?category=Nature");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((place: any) => {
      expect(place.category).toBe("Nature");
    });
  });

  it("Demonstrates Bayesian vs Arithmetic ranking: National Museum vs Buna Heritage Coffee House", async () => {
    const res = await request(app).get("/api/places?sort=top-rated");
    expect(res.status).toBe(200);

    const museum = res.body.find((p: any) => p.name === "National Museum of Ethiopia");
    const cafe = res.body.find((p: any) => p.name === "Buna Heritage Coffee House");

    expect(museum).toBeDefined();
    expect(cafe).toBeDefined();

    expect(cafe.ratingStats.averageRating).toBe(5.0);
    expect(cafe.ratingStats.reviewCount).toBe(1);

    expect(museum.ratingStats.averageRating).toBeCloseTo(4.7, 1);
    expect(museum.ratingStats.reviewCount).toBeGreaterThanOrEqual(300);

    expect(museum.ratingStats.bayesianScore).toBeGreaterThan(cafe.ratingStats.bayesianScore);

    const museumIdx = res.body.findIndex((p: any) => p.id === museum.id);
    const cafeIdx = res.body.findIndex((p: any) => p.id === cafe.id);
    expect(museumIdx).toBeLessThan(cafeIdx);
  });

  it("GET /api/places/:id should return single place with details, reviews, and tour slots", async () => {
    const placesRes = await request(app).get("/api/places");
    const placeId = placesRes.body[0].id;

    const res = await request(app).get(`/api/places/${placeId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(placeId);
    expect(res.body).toHaveProperty("reviews");
    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body).toHaveProperty("tourSlots");
    expect(Array.isArray(res.body.tourSlots)).toBe(true);

    if (res.body.tourSlots.length > 0) {
      const slot = res.body.tourSlots[0];
      expect(slot).toHaveProperty("capacity");
      expect(slot).toHaveProperty("bookedSeats");
      expect(slot).toHaveProperty("remainingSeats");
      expect(slot).toHaveProperty("isFullyBooked");
      expect(slot.capacity).toBe(slot.bookedSeats + slot.remainingSeats);
    }
  });

  it("GET /api/places/:id should return 404 for nonexistent ID", async () => {
    const res = await request(app).get("/api/places/nonexistent-id-000000");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
