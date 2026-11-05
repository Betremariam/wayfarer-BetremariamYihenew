export interface PlaceRatingInput {
  id: string;
  averageRating: number;
  reviewCount: number;
  [key: string]: any;
}

export class RankingService {
  public static readonly DEFAULT_M = 10;
  public static readonly FALLBACK_GLOBAL_C = 3.5;

  public static calculateBayesianRating(
    R: number,
    v: number,
    C: number = RankingService.FALLBACK_GLOBAL_C,
    m: number = RankingService.DEFAULT_M
  ): number {
    if (v <= 0 || isNaN(v) || isNaN(R)) {
      const safeC = isNaN(C) || C <= 0 ? RankingService.FALLBACK_GLOBAL_C : C;
      return Number(safeC.toFixed(2));
    }

    const safeM = m > 0 ? m : RankingService.DEFAULT_M;
    const safeC = isNaN(C) || C <= 0 ? RankingService.FALLBACK_GLOBAL_C : C;

    const weightV = v / (v + safeM);
    const weightM = safeM / (v + safeM);
    const weightedRating = weightV * R + weightM * safeC;

    if (!isFinite(weightedRating)) {
      return Number(safeC.toFixed(2));
    }

    return Number(weightedRating.toFixed(2));
  }

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
