"use client";

import React from "react";
import { PlaceSummary } from "../lib/types";
import { PlaceCard } from "./PlaceCard";
import { Search, ArrowUpDown, X, Compass } from "lucide-react";

interface PlaceListProps {
  places: PlaceSummary[];
  selectedPlaceId: string | null;
  onSelectPlace: (place: PlaceSummary) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentSort: string;
  onSortChange: (sort: string) => void;
  isLoading: boolean;
}

export function PlaceList({
  places,
  selectedPlaceId,
  onSelectPlace,
  searchQuery,
  onSearchChange,
  currentSort,
  onSortChange,
  isLoading,
}: PlaceListProps) {
  return (
    <div className="flex flex-col h-full bg-slate-50/60 border-r border-slate-200">
      {/* Search & Sort Controls Header */}
      <div className="p-4 border-b border-slate-200 bg-white space-y-3 shrink-0">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search destinations in Addis Ababa..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Count Bar */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 font-medium">
            {isLoading ? (
              <span>Loading destinations...</span>
            ) : (
              <span>
                <strong className="text-slate-900 font-bold">{places.length}</strong> {places.length === 1 ? "place" : "places"} found
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer hover:text-slate-900"
            >
              <option value="top-rated">Honest Ranking (Bayesian)</option>
              <option value="most-reviews">Most Reviews</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Places Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white border border-slate-200 p-3 flex gap-3 animate-pulse"
            >
              <div className="w-24 h-full bg-slate-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-1/3 pt-2" />
              </div>
            </div>
          ))
        ) : places.length === 0 ? (
          // Empty State
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No destinations found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search keywords or switching category filters.
            </p>
          </div>
        ) : (
          // Place Cards List
          places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              isSelected={place.id === selectedPlaceId}
              onSelect={onSelectPlace}
            />
          ))
        )}
      </div>
    </div>
  );
}
