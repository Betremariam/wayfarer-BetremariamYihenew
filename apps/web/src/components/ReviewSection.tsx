"use client";

import React, { useState, useEffect } from "react";
import { Review } from "../lib/types";
import { RatingStars } from "./RatingStars";
import { api } from "../lib/api";
import { useActiveUser } from "../context/UserContext";
import { MessageSquarePlus, Send, Edit3, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ReviewSectionProps {
  placeId: string;
  reviews: Review[];
  onReviewSubmitted: () => void;
}

export function ReviewSection({
  placeId,
  reviews,
  onReviewSubmitted,
}: ReviewSectionProps) {
  const { currentUser } = useActiveUser();

  const existingUserReview = currentUser
    ? reviews.find((r) => r.userId === currentUser.id)
    : undefined;

  const [rating, setRating] = useState<number>(existingUserReview ? existingUserReview.rating : 5);
  const [body, setBody] = useState<string>(existingUserReview ? existingUserReview.body : "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    if (existingUserReview) {
      setRating(existingUserReview.rating);
      setBody(existingUserReview.body);
    } else {
      setRating(5);
      setBody("");
    }
    setSuccessNotice(null);
    setErrorNotice(null);
  }, [placeId, currentUser?.id, existingUserReview?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setErrorNotice("Please select an active user persona in the top header.");
      return;
    }

    if (body.trim().length < 3) {
      setErrorNotice("Review text must be at least 3 characters.");
      return;
    }

    setIsSubmitting(true);
    setSuccessNotice(null);
    setErrorNotice(null);

    try {
      await api.submitReview(placeId, rating, body.trim());
      setSuccessNotice(
        existingUserReview
          ? "Your review has been successfully updated!"
          : "Thank you! Your honest review has been posted and factored into the Bayesian score."
      );
      onReviewSubmitted();
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              {existingUserReview ? <Edit3 className="w-4 h-4" /> : <MessageSquarePlus className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {existingUserReview ? "Edit Your Review" : "Write an Honest Review"}
              </h4>
              <p className="text-[11px] text-slate-500">
                Posting as: <strong className="text-slate-800">{currentUser?.name || "Anonymous"}</strong>
              </p>
            </div>
          </div>

          {existingUserReview && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Editing previous review
            </span>
          )}
        </div>

        {existingUserReview && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-700 text-xs flex items-center gap-2">
            <span className="text-amber-600 font-bold">Note:</span>
            <span>You previously rated this place {existingUserReview.rating} stars. Submitting updates your existing review.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Your Rating:</label>
            <RatingStars
              rating={rating}
              size="lg"
              interactive={true}
              onRatingChange={(newRating) => setRating(newRating)}
            />
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
              {rating} / 5
            </span>
          </div>

          <div>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share authentic details about your experience, guide quality, exhibitions, or local tips..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-slate-50/50"
              maxLength={1000}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Minimum 3 characters</span>
              <span>{body.length} / 1000</span>
            </div>
          </div>

          {successNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {errorNotice && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting || body.trim().length < 3}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{existingUserReview ? "Update Review" : "Publish Review"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <span>Community Reviews</span>
          <span className="text-xs font-normal text-slate-500">({reviews.length})</span>
        </h4>

        {reviews.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
            No reviews yet. Be the first traveller to share your experience!
          </div>
        ) : (
          reviews.map((review) => {
            const isAuthor = currentUser?.id === review.userId;
            const authorInitial = review.user?.name ? review.user.name.charAt(0) : "T";

            return (
              <div
                key={review.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isAuthor
                    ? "bg-amber-50/20 border-amber-300/80 shadow-xs"
                    : "bg-white border-slate-200/90"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                      {authorInitial}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{review.user?.name || "Community Traveller"}</span>
                        {isAuthor && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatDate(review.createdAt)}
                        {review.updatedAt !== review.createdAt && " (edited)"}
                      </div>
                    </div>
                  </div>

                  <RatingStars rating={review.rating} size="sm" />
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-9">
                  {review.body}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

