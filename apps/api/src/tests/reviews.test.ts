import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../db.js";

const app = createApp();

describe("Reviews API", () => {
  const testUserId = "00000000-0000-0000-0000-000000000001";

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("POST /api/places/:id/reviews should create a new review", async () => {
    const placesRes = await request(app).get("/api/places");
    const meskel = placesRes.body.find((p: any) => p.name.includes("Meskel Square"));
    expect(meskel).toBeDefined();

    await prisma.review.deleteMany({
      where: { placeId: meskel.id, userId: testUserId },
    });

    const res = await request(app)
      .post(`/api/places/${meskel.id}/reviews`)
      .set("X-User-Id", testUserId)
      .send({
        rating: 5,
        body: "Meskel Square is vibrant, central, and has great energy during public festivals!",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.rating).toBe(5);
    expect(res.body.userId).toBe(testUserId);
    expect(res.body.placeId).toBe(meskel.id);
  });

  it("POST /api/places/:id/reviews should update existing review rather than create duplicate", async () => {
    const placesRes = await request(app).get("/api/places");
    const meskel = placesRes.body.find((p: any) => p.name.includes("Meskel Square"));

    const firstRes = await request(app)
      .post(`/api/places/${meskel.id}/reviews`)
      .set("X-User-Id", testUserId)
      .send({
        rating: 4,
        body: "First version of my review: great city center.",
      });
    expect(firstRes.status).toBe(200);
    const existingReviewId = firstRes.body.id;

    const updatedRes = await request(app)
      .post(`/api/places/${meskel.id}/reviews`)
      .set("X-User-Id", testUserId)
      .send({
        rating: 5,
        body: "Updated version: Absolutely love the atmosphere here in the morning!",
      });

    expect(updatedRes.status).toBe(200);
    expect(updatedRes.body.id).toBe(existingReviewId);
    expect(updatedRes.body.rating).toBe(5);
    expect(updatedRes.body.body).toContain("Updated version");

    const reviewCount = await prisma.review.count({
      where: {
        placeId: meskel.id,
        userId: testUserId,
      },
    });
    expect(reviewCount).toBe(1);
  });

  it("PUT /api/places/:id/reviews also updates the review seamlessly", async () => {
    const placesRes = await request(app).get("/api/places");
    const meskel = placesRes.body.find((p: any) => p.name.includes("Meskel Square"));

    const putRes = await request(app)
      .put(`/api/places/${meskel.id}/reviews`)
      .set("X-User-Id", testUserId)
      .send({
        rating: 4,
        body: "PUT update: Solid 4 stars after recent renovation.",
      });

    expect(putRes.status).toBe(200);
    expect(putRes.body.rating).toBe(4);
    expect(putRes.body.body).toContain("PUT update");
  });

  it("should reject review without X-User-Id header", async () => {
    const placesRes = await request(app).get("/api/places");
    const placeId = placesRes.body[0].id;

    const res = await request(app)
      .post(`/api/places/${placeId}/reviews`)
      .send({
        rating: 5,
        body: "Great tour!",
      });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED_USER");
  });

  it("should reject invalid ratings (< 1 or > 5 or non-integer)", async () => {
    const placesRes = await request(app).get("/api/places");
    const placeId = placesRes.body[0].id;

    const resLow = await request(app)
      .post(`/api/places/${placeId}/reviews`)
      .set("X-User-Id", testUserId)
      .send({ rating: 0, body: "Too low rating" });
    expect(resLow.status).toBe(400);

    const resHigh = await request(app)
      .post(`/api/places/${placeId}/reviews`)
      .set("X-User-Id", testUserId)
      .send({ rating: 6, body: "Too high rating" });
    expect(resHigh.status).toBe(400);

    const resFloat = await request(app)
      .post(`/api/places/${placeId}/reviews`)
      .set("X-User-Id", testUserId)
      .send({ rating: 4.5, body: "Fractional rating" });
    expect(resFloat.status).toBe(400);
  });

  it("should reject empty or whitespace review body", async () => {
    const placesRes = await request(app).get("/api/places");
    const placeId = placesRes.body[0].id;

    const res = await request(app)
      .post(`/api/places/${placeId}/reviews`)
      .set("X-User-Id", testUserId)
      .send({ rating: 5, body: "  " });

    expect(res.status).toBe(400);
  });
});
