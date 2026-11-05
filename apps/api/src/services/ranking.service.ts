/**
 * RankingService — Implements the Bayesian Weighted Rating Algorithm
 *
 * Formula:
 *   Weighted Rating = (v / (v + m)) * R + (m / (v + m)) * C
 *
 * Where:
 *   - R = average rating of the place (arithmetic mean of its reviews)
 *   - v = number of reviews for the place
 *   - m = minimum review threshold (confidence parameter, default = 10)
 *   - C = global average rating across all places (prior mean)
 *
 * Why Bayesian:
 *   A place with a single 5-star review (v=1, R=5.0) would normally sit at #1 under
 *   simple arithmetic average. With Bayesian smoothing, the unproven place is pulled
 *   strongly toward the citywide prior C. Conversely, an established destination
 *   (e.g., National Museum with 312 reviews and 4.70 avg) carries high confidence (v >> m),
 *   retaining its high rank.
 */

export interface PlaceRatingInput {
  id: string;
  averageRating: number;
  reviewCount: number;
  [key: string]: any;
}

export class RankingService {
  public static readonly DEFAULT_M = 10;
  public static readonly FALLBACK_GLOBAL_C = 3.5;

  /**
   * Computes the Bayesian weighted score for a single place.
   *
   * @param R Place average rating (1.0 - 5.0)
   * @param v Number of reviews for the place
   * @param C Global average rating across all places (prior)
   * @param m Minimum review threshold (confidence weight)
   * @returns Bayesian score rounded to 2 decimal places
   */
  public static calculateBayesianRating(
    R: number,
    v: number,
    C: number = RankingService.FALLBACK_GLOBAL_C,
    m: number = RankingService.DEFAULT_M
  ): number {
    // Edge case: if no reviews exist for this place, baseline is the prior C
    if (v <= 0 || isNaN(v) || isNaN(R)) {
      const safeC = isNaN(C) || C <= 0 ? RankingService.FALLBACK_GLOBAL_C : C;
      return Number(safeC.toFixed(2));
    }

    // Safety guard against non-positive m
    const safeM = m > 0 ? m : RankingService.DEFAULT_M;
    const safeC = isNaN(C) || C <= 0 ? RankingService.FALLBACK_GLOBAL_C : C;

    // Bayesian calculation: (v / (v + m)) * R + (m / (v + m)) * C
    const weightV = v / (v + safeM);
    const weightM = safeM / (v + safeM);
    const weightedRating = weightV * R + weightM * safeC;

    // Check for NaN / Infinity
    if (!isFinite(weightedRating)) {
      return Number(safeC.toFixed(2));
    }

    return Number(weightedRating.toFixed(2));
  }

  /**
   * Computes the global average rating across all reviews in the dataset.
   * If total reviews is 0, returns the fallback baseline C.
   */
  public static computeGlobalAverage(places: { averageRating: number; reviewCount: number }[]): number {
    let totalReviews = 0;
    let weightedSum = 0;

    for (const place of places) {
      if (place.reviewCount > 0 && place.averageRating > 0) {
        totalReviews += place.reviewCount;
        weightedSum += place.averageRating * place.reviewCount;
      }
    }

    if (totalReviews === 0) {
      return RankingService.FALLBACK_GLOBAL_C;
    }

    return Number((weightedSum / totalReviews).toFixed(2));
  }

  /**
   * Ranks an array of places descending by Bayesian weighted rating.
   */
  public static rankPlaces<T extends PlaceRatingInput>(
    places: T[],
    globalMeanC?: number,
    m: number = RankingService.DEFAULT_M
  ): (T & { bayesianScore: number })[] {
    const C = globalMeanC !== undefined ? globalMeanC : RankingService.computeGlobalAverage(places);

    const scored = places.map((place) => {
      const bayesianScore = RankingService.calculateBayesianRating(
        place.averageRating,
        place.reviewCount,
        C,
        m
      );
      return {
        ...place,
        bayesianScore,
      };
    });

    // Sort descending by bayesianScore, breaking ties by reviewCount then averageRating
    return scored.sort((a, b) => {
      if (b.bayesianScore !== a.bayesianScore) {
        return b.bayesianScore - a.bayesianScore;
      }
      if (b.reviewCount !== a.reviewCount) {
        return b.reviewCount - a.reviewCount;
      }
      return b.averageRating - a.averageRating;
    });
  }
}
