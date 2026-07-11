"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Layers3,
  Plus,
  Sparkles,
} from "lucide-react";
import { useMilestoneStore, type Milestone } from "@/store/useMilestoneStore";
import MilestoneModal from "@/components/MilestoneModal";
import Sidebar from "@/components/Sidebar";
import { CATEGORY_COLORS } from "@/typesDefined";

const CATEGORY_ACCENTS: Record<string, { dot: string; wash: string }> = {
  career: { dot: "#eb5e28", wash: "bg-[#eb5e28]/10" },
  education: { dot: "#f0c955", wash: "bg-[#f0c955]/20" },
  health: { dot: "#87b9ad", wash: "bg-[#87b9ad]/18" },
  family: { dot: "#d49f7a", wash: "bg-[#d49f7a]/15" },
  travel: { dot: "#6f9f95", wash: "bg-[#87b9ad]/14" },
  personal: { dot: "#eb5e28", wash: "bg-[#eb5e28]/8" },
  other: { dot: "#8f8173", wash: "bg-[#8f8173]/10" },
};

export default function MilestonesPage() {
  const router = useRouter();
  const { milestones, syncFromBackend } = useMilestoneStore();
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;

    async function initialize() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (!response.ok || !data?.data?.user) {
          router.push("/login");
          return;
        }
        await syncFromBackend();
      } catch (error) {
        console.error("Milestones initialization failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    void initialize();
  }, [hydrated, syncFromBackend, router]);

  const sorted = useMemo(
    () => [...milestones].sort((a, b) => a.weekIndex - b.weekIndex),
    [milestones],
  );
  const filtered = useMemo(
    () =>
      filter
        ? sorted.filter((milestone) => milestone.category === filter)
        : sorted,
    [filter, sorted],
  );
  const categories = useMemo(
    () => [...new Set(milestones.map((milestone) => milestone.category))],
    [milestones],
  );
  const latestMilestone = sorted.at(-1);

  function openMilestone(milestone: Milestone) {
    setSelectedMilestone(milestone);
    setModalOpen(true);
  }

  if (!hydrated || isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf0] text-[#252422]">
        <div className="text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#eb5e28] border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-[#77726a]">
            Gathering your milestones...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#252422] selection:bg-[#eb5e28]/25">
      <Sidebar onOpenChange={setIsSidebarOpen} />
      <div
        className={`px-4 pb-16 pt-20 transition-transform duration-300 sm:px-6 sm:pt-12 ${isSidebarOpen ? "lg:translate-x-24" : ""}`}
      >
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 border-b border-[#252422]/10 pb-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#625f59]">
                <Sparkles className="h-3.5 w-3.5 text-[#eb5e28]" /> Moments
                worth remembering
              </div>
              <button
                onClick={() => router.push("/grid")}
                className="group inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-4 py-2.5 text-xs font-bold transition hover:border-[#eb5e28]/40 hover:text-[#eb5e28]"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />{" "}
                Back to grid
              </button>
            </div>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-5xl font-semibold leading-none tracking-[-0.065em] sm:text-6xl">
                  Your{" "}
                  <span className="font-serif font-normal italic text-[#eb5e28]">
                    Milestones
                  </span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#6d6861]">
                  A chronological record of the turning points, brave
                  beginnings, and quiet victories that shaped your story.
                </p>
              </div>
              <div className="flex gap-2">
                <Stat value={milestones.length} label="Total moments" dark />
                <Stat value={categories.length} label="Life areas" />
              </div>
            </div>
          </header>

          {milestones.length > 0 && (
            <section className="mb-8 rounded-[1.75rem] border border-[#252422]/10 bg-white/60 p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-[#eb5e28]" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em]">
                    Filter the story
                  </h2>
                </div>
                <p className="text-[10px] font-medium text-[#9a9287]">
                  {filtered.length} shown
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={filter === null}
                  onClick={() => setFilter(null)}
                  icon="✦"
                  label="All"
                />
                {categories.map((category) => (
                  <FilterButton
                    key={category}
                    active={filter === category}
                    onClick={() => setFilter(category)}
                    icon={CATEGORY_COLORS[category]?.icon || "◆"}
                    label={category}
                  />
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 ? (
            <section className="overflow-hidden rounded-[2rem] border border-[#252422]/10 bg-white/60 p-8 text-center shadow-sm sm:p-14">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#f7ead7] text-[#eb5e28]">
                <Flag className="h-7 w-7" />
              </span>
              <h2 className="mt-6 font-serif text-3xl font-semibold">
                {milestones.length
                  ? "No milestones in this category"
                  : "Your first milestone is waiting"}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6d6861]">
                {milestones.length
                  ? "Choose another filter to keep exploring your story."
                  : "Open a meaningful week in your grid and mark the moment you want to remember."}
              </p>
              <button
                onClick={() =>
                  milestones.length ? setFilter(null) : router.push("/grid")
                }
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#eb5e28] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#eb5e28]/20 transition hover:-translate-y-0.5 hover:bg-[#d94f20]"
              >
                {milestones.length ? "Show every milestone" : "Choose a week"}{" "}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </section>
          ) : (
            <section className="relative pb-5">
              <div className="absolute bottom-8 left-[1.6rem] top-8 w-px bg-gradient-to-b from-[#eb5e28] via-[#f0c955] to-[#87b9ad] sm:left-[2.1rem]" />
              <div className="space-y-4">
                {filtered.map((milestone, index) => {
                  const accent =
                    CATEGORY_ACCENTS[milestone.category] ||
                    CATEGORY_ACCENTS.other;
                  const categoryIcon =
                    CATEGORY_COLORS[milestone.category]?.icon || "◆";
                  return (
                    <motion.button
                      key={milestone._id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.045, 0.35) }}
                      onClick={() => openMilestone(milestone)}
                      className="group relative flex w-full gap-4 text-left sm:gap-6"
                    >
                      <span
                        style={{ borderColor: accent.dot }}
                        className="relative z-10 grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center rounded-2xl border-2 bg-[#fffaf0] text-xl shadow-sm sm:h-[4.25rem] sm:w-[4.25rem]"
                      >
                        {milestone.icon || categoryIcon}
                      </span>
                      <article className="min-w-0 flex-1 rounded-[1.5rem] border border-[#252422]/10 bg-white/65 p-5 shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:border-[#eb5e28]/30 group-hover:shadow-[0_16px_40px_rgba(37,36,34,0.08)] sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${accent.wash}`}
                              >
                                {categoryIcon} {milestone.category}
                              </span>
                              <span className="text-[10px] font-semibold text-[#9a9287]">
                                Week {milestone.weekIndex + 1}
                              </span>
                              {milestone._id === latestMilestone?._id && (
                                <span className="rounded-full bg-[#252422] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#f0c955]">
                                  Latest
                                </span>
                              )}
                            </div>
                            <h3 className="mt-3 text-xl font-semibold tracking-[-0.035em] sm:text-2xl">
                              {milestone.title}
                            </h3>
                          </div>
                          <span className="shrink-0 text-xs font-medium text-[#9a9287]">
                            {milestone.date}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#6d6861]">
                            {milestone.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#eb5e28]">
                          View milestone{" "}
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </div>
                      </article>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {selectedMilestone && (
        <MilestoneModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedMilestone(null);
          }}
          weekIndex={selectedMilestone.weekIndex}
          date={selectedMilestone.date}
          existingMilestone={selectedMilestone}
        />
      )}
    </main>
  );
}

function Stat({
  value,
  label,
  dark = false,
}: {
  value: number;
  label: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`min-w-28 rounded-2xl px-5 py-4 ${dark ? "bg-[#252422] text-[#fffaf0]" : "bg-[#f0c955] text-[#252422]"}`}
    >
      <p
        className={`text-[9px] font-bold uppercase tracking-[0.14em] ${dark ? "text-white/45" : "text-[#252422]/50"}`}
      >
        {label}
      </p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold capitalize transition ${active ? "border-[#252422] bg-[#252422] text-[#fffaf0]" : "border-[#252422]/10 bg-[#fffaf0] text-[#625f59] hover:border-[#eb5e28]/35 hover:text-[#eb5e28]"}`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
