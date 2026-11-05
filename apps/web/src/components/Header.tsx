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
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & City Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  WAYFARER
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <MapPin className="w-2.5 h-2.5" /> Addis Ababa
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Honest Ratings · Concurrency-Safe Bookings
              </p>
            </div>
          </div>

          {/* Category Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar: Bayesian Explainer & Acting-As User Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Algorithm Info Button */}
            <button
              onClick={onOpenBayesianInfo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
              title="Learn how our Bayesian Ranking algorithm guarantees fair ratings"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Fair Ranking Formula</span>
            </button>

            {/* Acting-as User Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
                aria-expanded={isUserDropdownOpen}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                  {currentUser ? currentUser.name.charAt(0) : "U"}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Acting as
                  </div>
                  <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                    {currentUser ? currentUser.name : "Select User"}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Switcher Dropdown Menu */}
              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-amber-400" /> Switch Demo Persona
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
                            className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                              isSelected
                                ? "bg-amber-500/10 text-amber-300 font-semibold"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                                {user.name.charAt(0)}
                              </div>
                              <span>{user.name}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-amber-400" />}
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

        {/* Mobile Category Navigation bar */}
        <div className="flex md:hidden items-center gap-1.5 py-2 overflow-x-auto border-t border-slate-800">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
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
