"use client";

import React, { useState, useEffect } from "react";
import { PlaceDetail as PlaceDetailType } from "../lib/types";
import { RatingStars } from "./RatingStars";
import { TourBookingCard } from "./TourBookingCard";
import { ReviewSection } from "./ReviewSection";
import {
  MapPin,
  Clock,
  ShieldCheck,
  Compass,
  Calendar,
  MessageSquare,
  Sparkles,
  Info,
} from "lucide-react";

interface PlaceDetailProps {
  place: PlaceDetailType | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenBayesianInfo: () => void;
}

export function PlaceDetail({
  place,
  isLoading,
  onRefresh,
  onOpenBayesianInfo,
}: PlaceDetailProps) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="w-full h-72 bg-slate-200 rounded-3xl" />
        <div className="space-y-3">
          <div className="h-8 bg-slate-200 rounded-lg w-2/3" />
          <div className="h-4 bg-slate-100 rounded-lg w-1/3" />
          <div className="h-20 bg-slate-100 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center bg-slate-50/40">
        <div className="max-w-sm space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Select a Destination</h3>
          <p className="text-xs text-slate-500">
            Choose any destination from the list on the left to explore honest reviews, Bayesian ranking, and book guided tour slots.
          </p>
        </div>
      </div>
    );
  }

  const {
    id,
    name,
    category,
    description,
    openingHours,
    address,
    imageUrl,
    ratingStats,
    reviews,
    tourSlots,
  } = place;

  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(imageUrl);
    setHasError(false);
  }, [imageUrl]);

  const categoryColors: Record<string, string> = {
    History: "bg-blue-600/90 text-white",
    Nature: "bg-emerald-600/90 text-white",
    Food: "bg-amber-600/90 text-white",
    Culture: "bg-purple-600/90 text-white",
  };

  const badgeColor = categoryColors[category] || "bg-slate-800 text-white";

  return (
    <div className="h-full overflow-y-auto bg-slate-50/40">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="relative w-full h-72 sm:h-84 md:h-96 rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-slate-900">
          <img
            src={imgSrc}
            alt={name}
            onError={() => {
              if (!hasError) {
                setHasError(true);
                setImgSrc("https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=80");
              }
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${badgeColor}`}
            >
              {category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-900 shadow-md backdrop-blur-md flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" /> Addis Ababa
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">
              {name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-200 font-medium">
              <span className="flex items-center gap-1.5 drop-shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {address}
              </span>
              <span className="flex items-center gap-1.5 drop-shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {openingHours}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {ratingStats.averageRating.toFixed(1)}
              </div>
              <div className="space-y-1">
                <RatingStars rating={ratingStats.averageRating} size="lg" />
                <div className="text-xs text-slate-500 font-medium">
                  Based on <strong>{ratingStats.reviewCount}</strong> {ratingStats.reviewCount === 1 ? "verified review" : "verified reviews"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/80 px-4 py-2.5 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  <span>Honest Bayesian Score</span>
                  <button
                    onClick={onOpenBayesianInfo}
                    className="p-0.5 hover:text-amber-700 text-amber-600 transition-colors cursor-pointer"
                    title="How this score is calculated"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-lg font-extrabold text-amber-700 leading-none mt-0.5">
                  {ratingStats.bayesianScore.toFixed(2)}
                  <span className="text-xs font-semibold text-amber-900/60 ml-1">/ 5.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 text-[11px] text-slate-500 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>
              {ratingStats.reviewCount < 10 ? (
                <>
                  <strong className="text-slate-800">Early Destination:</strong> With only {ratingStats.reviewCount} review{ratingStats.reviewCount === 1 ? "" : "s"}, the score is balanced toward citywide confidence to prevent single ratings from skewing the rank.
                </>
              ) : (
                <>
                  <strong className="text-slate-800">High Confidence:</strong> With {ratingStats.reviewCount} reviews, the Bayesian score closely reflects traveller consensus with robust empirical confidence.
                </>
              )}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            About This Destination
          </h3>
          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Guided Tour Schedules
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Concurrency-Safe PostgreSQL Seat Reservations
            </span>
          </div>

          <TourBookingCard
            slots={tourSlots}
            onBookingSuccess={onRefresh}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              Traveller Reviews & Feedback
            </h3>
          </div>

          <ReviewSection
            placeId={id}
            reviews={reviews}
            onReviewSubmitted={onRefresh}
          />
        </div>
      </div>
    </div>
  );
}
