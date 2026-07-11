"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarRange,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface PhotoFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: "newest" | "oldest";
  onSortChange: (sort: "newest" | "oldest") => void;
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  totalPhotos: number;
  filteredPhotos: number;
}

function toDateInput(date?: Date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CONTROL_CLASS =
  "h-11 w-full rounded-xl border border-[#252422]/10 bg-[#fffaf0] px-3 text-xs font-semibold text-[#252422] outline-none transition focus:border-[#eb5e28]/50 focus:ring-4 focus:ring-[#eb5e28]/8";

export function PhotoFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  dateRange,
  onDateRangeChange,
  totalPhotos,
  filteredPhotos,
}: PhotoFiltersProps) {
  const hasDateFilter = Boolean(dateRange.from || dateRange.to);
  const showFilters = hasDateFilter;
  const [expanded, setExpanded] = useState(false);
  const isExpanded = expanded || showFilters;

  return (
    <section className="mb-8 rounded-[1.75rem] border border-[#252422]/10 bg-white/60 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9287]" />
          <input
            type="search"
            placeholder="Search by photo name or week..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-12 w-full rounded-2xl border border-[#252422]/10 bg-[#fffaf0] pl-11 pr-10 text-sm outline-none transition placeholder:text-[#9a9287] focus:border-[#eb5e28]/50 focus:ring-4 focus:ring-[#eb5e28]/8"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#9a9287] hover:bg-[#252422]/5 hover:text-[#252422]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={`flex h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-xs font-bold transition ${isExpanded ? "border-[#252422] bg-[#252422] text-[#fffaf0]" : "border-[#252422]/10 bg-[#fffaf0] hover:border-[#eb5e28]/35 hover:text-[#eb5e28]"}`}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters{" "}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-3 border-t border-[#252422]/10 pt-4 md:grid-cols-3">
              <Control label="Order">
                <select
                  value={sortBy}
                  onChange={(event) =>
                    onSortChange(event.target.value as "newest" | "oldest")
                  }
                  className={CONTROL_CLASS}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </Control>
              <Control label="From">
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9287]" />
                  <input
                    type="date"
                    value={toDateInput(dateRange.from)}
                    onChange={(event) =>
                      onDateRangeChange({
                        ...dateRange,
                        from: event.target.value
                          ? new Date(`${event.target.value}T00:00:00`)
                          : undefined,
                      })
                    }
                    className={`${CONTROL_CLASS} pl-10`}
                  />
                </div>
              </Control>
              <Control label="To">
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9287]" />
                  <input
                    type="date"
                    value={toDateInput(dateRange.to)}
                    min={toDateInput(dateRange.from)}
                    onChange={(event) =>
                      onDateRangeChange({
                        ...dateRange,
                        to: event.target.value
                          ? new Date(`${event.target.value}T00:00:00`)
                          : undefined,
                      })
                    }
                    className={`${CONTROL_CLASS} pl-10`}
                  />
                </div>
              </Control>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#252422]/10 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a9287]">
          Showing <span className="text-[#252422]">{filteredPhotos}</span> of{" "}
          {totalPhotos} photos
        </p>
        {(searchTerm || hasDateFilter) && (
          <button
            onClick={() => {
              onSearchChange("");
              onDateRangeChange({});
            }}
            className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#eb5e28] hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </section>
  );
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-[#77726a]">
        {label}
      </span>
      {children}
    </label>
  );
}