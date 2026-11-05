"use client";

import React, { useState } from "react";
import { Compass, Users, ChevronDown, Check, Sparkles, MapPin } from "lucide-react";
import { useActiveUser } from "../context/UserContext";

interface HeaderProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenBayesianInfo: () => void;
}

const CATEGORIES = ["All", "History", "Nature", "Food"];

export function Header({
  selectedCategory,
  onSelectCategory,
  onOpenBayesianInfo,
}: HeaderProps) {
  const { currentUser, users, switchUser } = useActiveUser();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  WAYFARER
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-amber-50 text-amber-800 border border-amber-200/80">
                  <MapPin className="w-2.5 h-2.5 text-amber-600" /> Addis Ababa
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Honest Ratings · Concurrency-Safe Bookings
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-white text-slate-950 shadow-xs font-bold border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenBayesianInfo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Learn how our Bayesian Ranking algorithm guarantees fair ratings"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">Fair Ranking Formula</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition-colors cursor-pointer"
                aria-expanded={isUserDropdownOpen}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 font-bold text-xs uppercase shadow-xs">
                  {currentUser ? currentUser.name.charAt(0) : "U"}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold leading-tight">
                    Acting as
                  </div>
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser ? currentUser.name : "Select User"}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/60">
                      <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-amber-600" /> Switch Demo Persona
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Reviews & bookings will be recorded under this user.
                      </p>
                    </div>

                    <div className="py-1">
                      {users.map((user) => {
                        const isSelected = currentUser?.id === user.id;
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              switchUser(user);
                              setIsUserDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-amber-50 text-amber-900 font-semibold"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                  isSelected
                                    ? "bg-amber-200/80 text-amber-900"
                                    : "bg-slate-100 border border-slate-200 text-slate-700"
                                }`}
                              >
                                {user.name.charAt(0)}
                              </div>
                              <span>{user.name}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex md:hidden items-center gap-1.5 py-2 overflow-x-auto border-t border-slate-200 bg-slate-50/40">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-white text-slate-950 shadow-xs font-bold border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
