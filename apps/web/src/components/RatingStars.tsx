"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showScoreText?: boolean;
  scoreLabel?: string;
}

export function RatingStars({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showScoreText = false,
  scoreLabel,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const currentRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starValue = idx + 1;
          const isFilled = currentRating >= starValue;
          const isHalfFilled = !isFilled && currentRating >= starValue - 0.5;

          return (
            <button
              key={idx}
              type={interactive ? "button" : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${
                interactive
                  ? "cursor-pointer p-0.5 hover:scale-110 transition-transform"
                  : "cursor-default pointer-events-none"
              }`}
              aria-label={`Rate ${starValue} stars`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : isHalfFilled
                    ? "fill-amber-300 text-amber-400"
                    : "fill-slate-200 text-slate-300"
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showScoreText && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {rating > 0 ? rating.toFixed(1) : "New"}
          {scoreLabel && <span className="font-normal text-slate-500"> {scoreLabel}</span>}
        </span>
      )}
    </div>
  );
}
