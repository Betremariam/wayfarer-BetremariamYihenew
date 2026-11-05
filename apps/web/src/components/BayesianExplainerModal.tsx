"use client";

import React from "react";
import { X, ShieldCheck, Calculator, Check, ArrowRight } from "lucide-react";

interface BayesianExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BayesianExplainerModal({ isOpen, onClose }: BayesianExplainerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Wayfarer Honest Ranking Algorithm
              </h3>
              <p className="text-xs text-slate-400">
                Empirical Bayesian smoothing for fair destination discovery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80">
            <h4 className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
              <span>Why Simple Arithmetic Averages Are Unfair</span>
            </h4>
            <p className="text-amber-800 text-xs leading-relaxed">
              Under standard arithmetic sorting, a brand new cafe with a single 5-star review (average = 5.0) would outrank the world-renowned National Museum of Ethiopia (average = 4.70 across 312 community reviews). This misleads travellers and rewards low sample sizes.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-600" />
              The Bayesian Weighted Rating Formula
            </h4>

            <div className="p-4 rounded-2xl bg-slate-900 text-amber-300 font-mono text-center text-sm sm:text-base border border-slate-800 shadow-inner">
              Weighted Rating = (v / (v + m)) × R + (m / (v + m)) × C
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900">R:</strong> Place average rating (actual arithmetic mean)
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900">v:</strong> Review count for the place
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900">m = 10:</strong> Confidence threshold (prior weight)
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900">C ≈ 4.65:</strong> Global average rating across all places
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Real Demonstration From Addis Ababa Dataset
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">National Museum of Ethiopia</div>
                  <div className="text-[11px] text-slate-500">312 reviews · Raw Average: 4.70</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Bayesian Score</div>
                  <div className="text-base font-extrabold text-amber-600">4.70</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Buna Heritage Coffee House</div>
                  <div className="text-[11px] text-slate-500">1 review · Raw Average: 5.00</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Bayesian Score</div>
                  <div className="text-base font-extrabold text-slate-700">4.68</div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Result: The National Museum rightfully outranks the 1-review cafe despite the cafe having a 5.0 raw average!
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

