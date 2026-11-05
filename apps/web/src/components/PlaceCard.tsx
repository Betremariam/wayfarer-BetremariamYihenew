"use client";

import React from "react";
import { PlaceSummary } from "../lib/types";
import { RatingStars } from "./RatingStars";
import { Clock, ShieldCheck, MapPin } from "lucide-react";

interface PlaceCardProps {
  place: PlaceSummary;
  isSelected: boolean;
  onSelect: (place: PlaceSummary) => void;
}

export function PlaceCard({ place, isSelected, onSelect }: PlaceCardProps) {
  const { name, category, openingHours, address, imageUrl, ratingStats } = place;

  const categoryColors: Record<string, string> = {
    History: "bg-blue-50 text-blue-700 border-blue-200",
    Nature: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Food: "bg-amber-50 text-amber-700 border-amber-200",
    Culture: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const badgeColor = categoryColors[category] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div
      onClick={() => onSelect(place)}
      className={`group cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
        isSelected
          ? "border-amber-500 shadow-md ring-2 ring-amber-500/20 bg-amber-50/10"
          : "border-slate-200/90 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex p-3 sm:p-3.5 gap-3.5 items-start">
        {/* Thumbnail Image */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <span
            className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md shadow-xs ${badgeColor}`}
          >
            {category}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-24 sm:h-28">
          <div>
            <h3
              className={`text-sm sm:text-base font-bold truncate leading-snug transition-colors ${
                isSelected ? "text-amber-600" : "text-slate-900 group-hover:text-slate-800"
              }`}
              title={name}
            >
              {name}
            </h3>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          </div>

          <div className="pt-1.5">
            {/* Star Rating & Review Count */}
            <div className="flex items-center gap-2">
              <RatingStars rating={ratingStats.averageRating} size="sm" />
              <span className="text-xs font-semibold text-slate-800">
                {ratingStats.averageRating.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-500">
                ({ratingStats.reviewCount} {ratingStats.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Honest Score Pill & Hours */}
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px]">
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200"
                title="Bayesian weighted rating balances actual reviews against citywide confidence"
              >
                <ShieldCheck className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Honest: {ratingStats.bayesianScore.toFixed(2)}</span>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-slate-400 text-[11px]">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[120px]">{openingHours.split("(")[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
