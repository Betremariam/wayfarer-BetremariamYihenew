"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "../components/Header";
import { PlaceList } from "../components/PlaceList";
import { PlaceDetail } from "../components/PlaceDetail";
import { BayesianExplainerModal } from "../components/BayesianExplainerModal";
import { PlaceSummary, PlaceDetail as PlaceDetailType } from "../lib/types";
import { api } from "../lib/api";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentSort, setCurrentSort] = useState<string>("top-rated");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState<PlaceDetailType | null>(null);

  const [isPlacesLoading, setIsPlacesLoading] = useState<boolean>(true);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBayesianModalOpen, setIsBayesianModalOpen] = useState<boolean>(false);

  const loadPlaces = useCallback(async () => {
    setIsPlacesLoading(true);
    setErrorMessage(null);
    try {
      const fetchedPlaces = await api.getPlaces({
        category: selectedCategory,
        sort: currentSort,
        search: searchQuery,
      });
      setPlaces(fetchedPlaces);

      if (fetchedPlaces.length > 0) {
        if (!selectedPlaceId || !fetchedPlaces.some((p) => p.id === selectedPlaceId)) {
          setSelectedPlaceId(fetchedPlaces[0].id);
        }
      } else {
        setSelectedPlaceId(null);
        setSelectedPlaceDetail(null);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to load destinations from the server."
      );
    } finally {
      setIsPlacesLoading(false);
    }
  }, [selectedCategory, currentSort, searchQuery, selectedPlaceId]);

  const loadPlaceDetail = useCallback(async (id: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await api.getPlaceById(id);
      setSelectedPlaceDetail(detail);
    } catch (err: any) {
      console.error("Failed to load place detail:", err);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [selectedCategory, currentSort, searchQuery]);

  useEffect(() => {
    if (selectedPlaceId) {
      loadPlaceDetail(selectedPlaceId);
    }
  }, [selectedPlaceId, loadPlaceDetail]);

  const handleDataRefresh = useCallback(async () => {
    if (selectedPlaceId) {
      await loadPlaceDetail(selectedPlaceId);
    }
    const refreshedPlaces = await api.getPlaces({
      category: selectedCategory,
      sort: currentSort,
      search: searchQuery,
    });
    setPlaces(refreshedPlaces);
  }, [selectedPlaceId, selectedCategory, currentSort, searchQuery, loadPlaceDetail]);

  const handleSelectPlace = (place: PlaceSummary) => {
    setSelectedPlaceId(place.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenBayesianInfo={() => setIsBayesianModalOpen(true)}
      />

      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => loadPlaces()}
            className="flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl w-full mx-auto shadow-xs border-x border-slate-200/80 bg-white">
        <section
          aria-label="Destinations List"
          className="w-full lg:w-[420px] xl:w-[460px] shrink-0 h-[480px] lg:h-[calc(100vh-4rem)] border-b lg:border-b-0"
        >
          <PlaceList
            places={places}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={handleSelectPlace}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentSort={currentSort}
            onSortChange={setCurrentSort}
            isLoading={isPlacesLoading}
          />
        </section>

        <section
          aria-label="Destination Details and Guided Tours"
          className="flex-1 h-[calc(100vh-4rem)] overflow-hidden"
        >
          <PlaceDetail
            place={selectedPlaceDetail}
            isLoading={isDetailLoading}
            onRefresh={handleDataRefresh}
            onOpenBayesianInfo={() => setIsBayesianModalOpen(true)}
          />
        </section>
      </main>

      <BayesianExplainerModal
        isOpen={isBayesianModalOpen}
        onClose={() => setIsBayesianModalOpen(false)}
      />
    </div>
  );
}

