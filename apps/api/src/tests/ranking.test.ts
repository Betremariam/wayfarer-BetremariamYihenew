import { describe, it, expect } from "vitest";
import { RankingService } from "../services/ranking.service.js";

describe("RankingService — Bayesian Weighted Rating", () => {
  const globalAverage = 4.65; // realistic Addis Ababa destination average
  const m = 10; // confidence threshold

  it("requirement 1: a place with one 5-star review should NOT outrank an established 4.7-star museum with 312 reviews", () => {
    // Fictional local cafe: 1 review, 5.0 rating
    const newCafeScore = RankingService.calculateBayesianRating(5.0, 1, globalAverage, m);

    // National Museum of Ethiopia: 312 reviews, 4.70 average rating
    const museumScore = RankingService.calculateBayesianRating(4.70, 312, globalAverage, m);

    // Cafe score should be pulled strongly toward global mean (4.65)
    // Formula for cafe: (1/11)*5.0 + (10/11)*4.65 = 0.4545 + 4.2272 = 4.68
    expect(newCafeScore).toBe(4.68);

    // Formula for museum: (312/322)*4.70 + (10/322)*4.65 = 4.5540 + 0.1444 = 4.70
    expect(museumScore).toBe(4.70);

    // The established museum MUST outrank the single-review 5-star cafe!
    expect(museumScore).toBeGreaterThan(newCafeScore);

    // Ranking list check
    const places = [
      { id: "cafe", name: "Buna Heritage Cafe", averageRating: 5.0, reviewCount: 1 },
      { id: "museum", name: "National Museum", averageRating: 4.70, reviewCount: 312 },
    ];
    const ranked = RankingService.rankPlaces(places, globalAverage, m);
    expect(ranked[0].id).toBe("museum");
    expect(ranked[1].id).toBe("cafe");
  });

  it("requirement 2: a place with many positive reviews should receive a score close to its actual average", () => {
    // When review count v is very large (e.g. 500 reviews, 4.85 avg), weight of R dominates: v / (v + m) = 500/510 ≈ 0.980
    const placeActualRating = 4.85;
    const largeReviewCount = 500;
    const score = RankingService.calculateBayesianRating(
      placeActualRating,
      largeReviewCount,
      globalAverage,
      m
    );

    // Difference between Bayesian score and actual average should be minimal (< 0.02)
    expect(Math.abs(score - placeActualRating)).toBeLessThan(0.02);
    expect(score).toBe(4.85);
  });

  it("requirement 3: a place with no reviews should not produce NaN or Infinity", () => {
    const zeroReviewScore = RankingService.calculateBayesianRating(0, 0, globalAverage, m);
    expect(Number.isFinite(zeroReviewScore)).toBe(true);
    expect(Number.isNaN(zeroReviewScore)).toBe(false);
    expect(zeroReviewScore).toBe(globalAverage);

    // Test with missing or undefined ratings
    const nanScore = RankingService.calculateBayesianRating(NaN, 0, globalAverage, m);
    expect(Number.isFinite(nanScore)).toBe(true);
    expect(nanScore).toBe(globalAverage);

    // Test with empty places list
    const emptyPlacesRanking = RankingService.rankPlaces([]);
    expect(emptyPlacesRanking).toEqual([]);
  });

  it("requirement 4: the ranking formula should handle different review counts correctly", () => {
    // Test progression of scores as reviews accumulate with same 5.0 rating
    const score1 = RankingService.calculateBayesianRating(5.0, 1, 4.0, 10);
    const score5 = RankingService.calculateBayesianRating(5.0, 5, 4.0, 10);
    const score10 = RankingService.calculateBayesianRating(5.0, 10, 4.0, 10);
    const score50 = RankingService.calculateBayesianRating(5.0, 50, 4.0, 10);
    const score100 = RankingService.calculateBayesianRating(5.0, 100, 4.0, 10);

    // As review count increases, confidence increases and score asymptotically approaches 5.0
    expect(score1).toBeLessThan(score5);
    expect(score5).toBeLessThan(score10);
    expect(score10).toBeLessThan(score50);
    expect(score50).toBeLessThan(score100);

    // At v = m (10 reviews), score is exact midpoint between R and C: (10/20)*5.0 + (10/20)*4.0 = 4.5
    expect(score10).toBe(4.5);
  });

  it("should compute global weighted average correctly", () => {
    const places = [
      { averageRating: 4.0, reviewCount: 10 }, // 40
      { averageRating: 5.0, reviewCount: 10 }, // 50
    ];
    // Total reviews = 20, weighted sum = 90 => 90/20 = 4.5
    const computedC = RankingService.computeGlobalAverage(places);
    expect(computedC).toBe(4.5);
  });
});
