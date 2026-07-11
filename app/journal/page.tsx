"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  PenLine,
  Search,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useLifeStore } from "@/store/useCapsuleStore";
import { MOOD_LABELS, MOOD_TEXT_COLORS, WeekData } from "@/typesDefined";
import { useAuth } from "@/hooks/useQuery";
import {
  InfiniteScrollLoader,
  useCursorPagination,
} from "@/hooks/useCursorPagination";

type Filter = "all" | "memories" | "dreams";

const filterLabels: Record<Filter, string> = {
  all: "All entries",
  memories: "Memories",
  dreams: "Dreams",
};

export default function JournalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { notes, birthDate } = useLifeStore();

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const totalNotesCount = Object.values(notes).filter(
    (note) => note.note && note.note !== "<p></p>",
  ).length;

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return Object.values(notes)
      .filter((note) => note.note && note.note !== "<p></p>")
      .sort((first, second) => second.weekIndex - first.weekIndex)
      .filter((entry) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "memories" && entry.isPast) ||
          (filter === "dreams" && !entry.isPast);

        const matchesSearch =
          normalizedSearch === "" ||
          entry.note.toLowerCase().includes(normalizedSearch) ||
          entry.date.toLowerCase().includes(normalizedSearch);

        return matchesFilter && matchesSearch;
      });
  }, [notes, filter, search]);

  const {
    items: paginatedEntries,
    isLoading: isLoadingMore,
    hasMore,
    observerTarget,
    reset: resetPagination,
  } = useCursorPagination<WeekData>({
    initialItems: [],
    itemsPerPage: 20,
    getCursorFromItem: (item) => item.weekIndex,
    onLoadMore: async (cursor) => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (cursor === null) {
        return filteredEntries.slice(0, 20);
      }

      const cursorIndex = filteredEntries.findIndex(
        (entry) => entry.weekIndex === (cursor as number),
      );
      const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;

      return filteredEntries.slice(startIndex, startIndex + 20);
    },
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    resetPagination();
  }, [filter, search, hydrated, filteredEntries, resetPagination]);

  function stripHtml(html: string) {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getMoodDot(mood: number) {
    if (mood === 1) return "bg-red-500";
    if (mood === 2) return "bg-orange-500";
    if (mood === 3) return "bg-[#f0c955]";
    if (mood === 4) return "bg-[#87b9ad]";
    return "bg-emerald-500";
  }

  if (!hydrated || !user || !birthDate) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#252422] selection:bg-[#eb5e28]/25">
      <Sidebar onOpenChange={setIsSidebarOpen} />

      <div
        className={`px-4 pb-16 pt-20 transition-transform duration-300 ease-out sm:px-6 sm:pt-12 ${
          isSidebarOpen ? "lg:translate-x-24" : "translate-x-0"
        }`}
      >
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 border-b border-[#252422]/10 pb-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#625f59]">
                <Sparkles className="h-3.5 w-3.5 text-[#eb5e28]" />
                Your life, in your own words
              </div>

              <button
                onClick={() => router.push("/grid")}
                className="group inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-4 py-2.5 text-xs font-bold transition-all hover:border-[#eb5e28]/40 hover:text-[#eb5e28]"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back to grid
              </button>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-5xl font-semibold leading-none tracking-[-0.065em] sm:text-6xl">
                  Your{" "}
                  <span className="font-serif font-normal italic text-[#eb5e28]">
                    Journal
                  </span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#6d6861]">
                  A private collection of the ordinary days, turning points,
                  feelings, and future hopes that make your life yours.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="rounded-2xl bg-[#252422] px-5 py-3 text-[#fffaf0]">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                    Written
                  </p>
                  <p className="mt-1 text-xl font-bold tracking-[-0.04em]">
                    {totalNotesCount}{" "}
                    {totalNotesCount === 1 ? "entry" : "entries"}
                  </p>
                </div>
                <div className="grid w-14 place-items-center rounded-2xl bg-[#f0c955]">
                  <BookOpen className="h-5 w-5" strokeWidth={1.7} />
                </div>
              </div>
            </div>
          </header>

          <section className="mb-8 rounded-[1.75rem] border border-[#252422]/10 bg-white/70 p-3 shadow-[0_18px_55px_rgba(37,36,34,0.07)] sm:p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9287]" />
              <input
                type="search"
                placeholder="Search memories, dreams, or dates..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[#252422]/10 bg-[#f3ede2] pl-11 pr-4 text-sm text-[#252422] outline-none transition-all placeholder:text-[#9a9287] focus:border-[#eb5e28] focus:ring-4 focus:ring-[#eb5e28]/10"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(filterLabels) as Filter[]).map((filterValue) => (
                <button
                  key={filterValue}
                  onClick={() => setFilter(filterValue)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                    filter === filterValue
                      ? "border-[#252422] bg-[#252422] text-[#fffaf0] shadow-sm"
                      : "border-[#252422]/10 bg-transparent text-[#77726a] hover:border-[#eb5e28]/40 hover:text-[#eb5e28]"
                  }`}
                >
                  {filterLabels[filterValue]}
                </button>
              ))}

              <p className="ml-auto hidden items-center px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a9287] sm:flex">
                {filteredEntries.length} shown
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-3xl">
            {totalNotesCount === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[#252422]/15 bg-white/45 px-6 py-20 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#eb5e28] text-[#fffaf0] shadow-lg">
                  <PenLine className="h-6 w-6" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">
                  Your first entry is waiting
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#77726a]">
                  Open any week on your grid and write down the moment you want
                  to remember.
                </p>
                <button
                  onClick={() => router.push("/grid")}
                  className="group mt-6 inline-flex items-center gap-3 rounded-full bg-[#252422] px-6 py-3 text-sm font-bold text-[#fffaf0] transition-colors hover:bg-[#eb5e28]"
                >
                  Go to your grid
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[#252422]/15 bg-white/45 px-6 py-20 text-center">
                <Search className="mx-auto h-7 w-7 text-[#eb5e28]" />
                <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">
                  No matching entries
                </h2>
                <p className="mt-2 text-sm text-[#77726a]">
                  Try a different word or choose another filter.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="mt-5 text-xs font-bold text-[#eb5e28] hover:underline"
                >
                  Clear search and filters
                </button>
              </div>
            ) : (
              <>
                <div className="relative space-y-4 before:absolute before:bottom-8 before:left-[25px] before:top-8 before:w-px before:bg-[#252422]/10 sm:before:left-[31px]">
                  {paginatedEntries.map((entry, index) => (
                    <motion.article
                      key={entry.weekIndex}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                      transition={{
                        opacity: { delay: Math.min(index * 0.035, 0.35) },
                        y: { delay: Math.min(index * 0.035, 0.35) },
                      }}
                      onClick={() =>
                        router.push(`/grid?week=${entry.weekIndex}`)
                      }
                      className="group relative cursor-pointer rounded-[1.5rem] border border-[#252422]/10 bg-white/70 p-5 pl-16 shadow-sm transition-all hover:border-[#eb5e28]/35 hover:shadow-[0_18px_50px_rgba(37,36,34,0.09)] sm:p-6 sm:pl-20"
                    >
                      <div
                        className={`absolute left-4 top-6 grid h-7 w-7 place-items-center rounded-full border-4 border-[#fffaf0] sm:left-5 sm:h-8 sm:w-8 ${
                          entry.isPast ? "bg-[#403d39]" : "bg-[#eb5e28]"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#fffaf0]" />
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
                                entry.isPast
                                  ? "border-[#252422]/10 bg-[#f3ede2] text-[#625f59]"
                                  : "border-[#eb5e28]/20 bg-[#eb5e28]/10 text-[#c9491c]"
                              }`}
                            >
                              {entry.isPast ? "Memory" : "Dream"}
                            </span>

                            {entry.mood > 0 && (
                              <span
                                className={`flex items-center gap-1.5 text-xs font-semibold ${MOOD_TEXT_COLORS[entry.mood]}`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${getMoodDot(entry.mood)}`}
                                />
                                {MOOD_LABELS[entry.mood]}
                              </span>
                            )}
                          </div>

                          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.11em] text-[#9a9287]">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Week {entry.weekIndex + 1} · {entry.date}
                          </p>
                        </div>

                        <ArrowRight className="h-4 w-4 shrink-0 text-[#bdb5a9] transition-all group-hover:translate-x-1 group-hover:text-[#eb5e28]" />
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#57524c] sm:text-[15px]">
                        {stripHtml(entry.note)}
                      </p>
                    </motion.article>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-[#f3ede2]/70 p-3 text-center text-xs text-[#77726a]">
                  <InfiniteScrollLoader
                    isLoading={isLoadingMore}
                    hasMore={hasMore}
                    targetRef={observerTarget}
                    loadingText="Loading more entries..."
                    emptyText="You have reached the end of your journal"
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
