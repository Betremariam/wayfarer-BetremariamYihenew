import { describe, it, expect } from "vitest";
import { RankingService } from "../services/ranking.service.js";

describe("RankingService — Bayesian Weighted Rating", () => {
  const globalAverage = 4.65;
  const m = 10;

  it("requirement 1: a place with one 5-star review should NOT outrank an established 4.7-star museum with 312 reviews", () => {
    const newCafeScore = RankingService.calculateBayesianRating(5.0, 1, globalAverage, m);
    const museumScore = RankingService.calculateBayesianRating(4.70, 312, globalAverage, m);

    expect(newCafeScore).toBe(4.68);
    expect(museumScore).toBe(4.70);
    expect(museumScore).toBeGreaterThan(newCafeScore);

    const places = [
      { id: "cafe", name: "Buna Heritage Cafe", averageRating: 5.0, reviewCount: 1 },
      { id: "museum", name: "National Museum", averageRating: 4.70, reviewCount: 312 },
    ];
    const ranked = RankingService.rankPlaces(places, globalAverage, m);
    expect(ranked[0].id).toBe("museum");
    expect(ranked[1].id).toBe("cafe");
  });

  it("requirement 2: a place with many positive reviews should receive a score close to its actual average", () => {
    const placeActualRating = 4.85;
    const largeReviewCount = 500;
    const score = RankingService.calculateBayesianRating(
      placeActualRating,
      largeReviewCount,
      globalAverage,
      m
    );

    expect(Math.abs(score - placeActualRating)).toBeLessThan(0.02);
    expect(score).toBe(4.85);
  });

  it("requirement 3: a place with no reviews should not produce NaN or Infinity", () => {
    const zeroReviewScore = RankingService.calculateBayesianRating(0, 0, globalAverage, m);
    expect(Number.isFinite(zeroReviewScore)).toBe(true);
    expect(Number.isNaN(zeroReviewScore)).toBe(false);
    expect(zeroReviewScore).toBe(globalAverage);

    const nanScore = RankingService.calculateBayesianRating(NaN, 0, globalAverage, m);
    expect(Number.isFinite(nanScore)).toBe(true);
    expect(nanScore).toBe(globalAverage);

    const emptyPlacesRanking = RankingService.rankPlaces([]);
    expect(emptyPlacesRanking).toEqual([]);
  });

  it("requirement 4: the ranking formula should handle different review counts correctly", () => {
    const score1 = RankingService.calculateBayesianRating(5.0, 1, 4.0, 10);
    const score5 = RankingService.calculateBayesianRating(5.0, 5, 4.0, 10);
    const score10 = RankingService.calculateBayesianRating(5.0, 10, 4.0, 10);
    const score50 = RankingService.calculateBayesianRating(5.0, 50, 4.0, 10);
    const score100 = RankingService.calculateBayesianRating(5.0, 100, 4.0, 10);

    expect(score1).toBeLessThan(score5);
    expect(score5).toBeLessThan(score10);
    expect(score10).toBeLessThan(score50);
    expect(score50).toBeLessThan(score100);
    expect(score10).toBe(4.5);
  });

  it("should compute global weighted average correctly", () => {
    const places = [
      { averageRating: 4.0, reviewCount: 10 },
      { averageRating: 5.0, reviewCount: 10 },
    ];
    const computedC = RankingService.computeGlobalAverage(places);
    expect(computedC).toBe(4.5);
  });
});
