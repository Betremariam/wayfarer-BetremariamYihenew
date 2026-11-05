"use client";

import React, { useState } from "react";
import { TourSlot } from "../lib/types";
import { api } from "../lib/api";
import { Calendar, Users, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useActiveUser } from "../context/UserContext";

interface TourBookingCardProps {
  slots: TourSlot[];
  onBookingSuccess: () => void;
}

export function TourBookingCard({ slots, onBookingSuccess }: TourBookingCardProps) {
  const { currentUser } = useActiveUser();
  const [selectedSeats, setSelectedSeats] = useState<Record<string, number>>({});
  const [bookingLoadingSlotId, setBookingLoadingSlotId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ slotId: string; text: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ slotId: string; text: string } | null>(null);

  const handleSeatChange = (slotId: string, count: number) => {
    setSelectedSeats((prev) => ({ ...prev, [slotId]: count }));
  };

  const handleBook = async (slot: TourSlot) => {
    if (!currentUser) {
      alert("Please select an active user first");
      return;
    }

    const seatsToBook = selectedSeats[slot.id] || 1;
    setBookingLoadingSlotId(slot.id);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.bookSeats(slot.id, seatsToBook);
      setSuccessMessage({
        slotId: slot.id,
        text: `Successfully reserved ${seatsToBook} seat(s)! Remaining seats: ${res.remainingSeats}`,
      });
      onBookingSuccess();
    } catch (err: any) {
      setErrorMessage({
        slotId: slot.id,
        text: err.message || "Failed to complete reservation. Please try again.",
      });
    } finally {
      setBookingLoadingSlotId(null);
    }
  };

  const formatSlotDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  if (!slots || slots.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
        <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No scheduled tours right now</h4>
        <p className="text-xs text-slate-500 mt-1">
          Check back soon for new guided slots at this destination.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {slots.map((slot) => {
        const remaining = slot.remainingSeats;
        const isFull = slot.isFullyBooked || remaining <= 0;
        const requested = selectedSeats[slot.id] || 1;
        const isBookingThis = bookingLoadingSlotId === slot.id;
        const percentageBooked = Math.round(((slot.capacity - remaining) / slot.capacity) * 100);

        return (
          <div
            key={slot.id}
            className={`p-4 rounded-2xl border transition-all ${
              isFull
                ? "bg-slate-50/70 border-slate-200"
                : "bg-white border-slate-200 hover:border-amber-400/80 shadow-xs"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      {formatSlotDate(slot.startsAt)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        Total Capacity: {slot.capacity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 w-full max-w-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-600">
                      {isFull ? (
                        <span className="text-rose-600 font-bold">Fully Booked (0 left)</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">
                          {remaining} {remaining === 1 ? "seat" : "seats"} remaining
                        </span>
                      )}
                    </span>
                    <span className="text-slate-400">{percentageBooked}% filled</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFull
                          ? "bg-rose-500"
                          : remaining <= 2
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, percentageBooked)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0">
                {!isFull && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                    <label
                      htmlFor={`seat-select-${slot.id}`}
                      className="text-[11px] font-semibold text-slate-600"
                    >
                      Seats:
                    </label>
                    <select
                      id={`seat-select-${slot.id}`}
                      value={requested}
                      onChange={(e) => handleSeatChange(slot.id, parseInt(e.target.value, 10))}
                      disabled={isBookingThis}
                      className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                    >
                      {Array.from({ length: Math.min(remaining, 6) }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleBook(slot)}
                  disabled={isFull || isBookingThis}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    isFull
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95 shadow-amber-500/10 cursor-pointer"
                  }`}
                >
                  {isBookingThis ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Reserving...</span>
                    </>
                  ) : isFull ? (
                    <span>Sold Out</span>
                  ) : (
                    <span>Reserve {requested > 1 ? `${requested} Seats` : "Seat"}</span>
                  )}
                </button>
              </div>
            </div>

            {successMessage && successMessage.slotId === slot.id && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{successMessage.text}</span>
              </div>
            )}

            {errorMessage && errorMessage.slotId === slot.id && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{errorMessage.text}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
