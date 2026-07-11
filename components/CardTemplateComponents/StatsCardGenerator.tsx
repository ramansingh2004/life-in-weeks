"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  LayoutTemplate,
  Palette,
  Ratio,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CardPreview } from "./CardPreview";
import { SummaryCard } from "./SummaryCard";
import { MoodCard } from "./MoodCard";
import { MilestonesCard } from "./MilestonesCard";
import { ProgressCard } from "./ProgressCard";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useQuery";
import { useLifeStore } from "@/store/useCapsuleStore";
import { useMilestoneStore, type Milestone } from "@/store/useMilestoneStore";

interface Note {
  weekIndex: number;
  note: string;
  mood: number;
  tags?: string[];
}

interface MoodCounts {
  amazing: number;
  good: number;
  okay: number;
  bad: number;
  terrible: number;
}

interface Stats {
  totalMemories: number;
  averageMood: number | string;
  currentStreak: number;
  maxStreak: number;
  topTags: string[];
  moodCounts: MoodCounts;
  milestonesByCategory: Map<string, number>;
  totalMilestones: number;
  moodValues: number[];
  longestStreak: number;
}

type CardType = "summary" | "mood" | "milestones" | "progress";
type Theme = "dark" | "light" | "gradient" | "neon";
type Format = "square" | "story" | "rect";

const CARD_OPTIONS: Array<{
  id: CardType;
  name: string;
  icon: string;
  desc: string;
}> = [
  {
    id: "summary",
    name: "Life summary",
    icon: "✦",
    desc: "A complete snapshot",
  },
  {
    id: "mood",
    name: "Mood journey",
    icon: "◡",
    desc: "Your emotional rhythm",
  },
  {
    id: "milestones",
    name: "Achievements",
    icon: "◆",
    desc: "Moments worth celebrating",
  },
  {
    id: "progress",
    name: "Life progress",
    icon: "↗",
    desc: "Weeks documented so far",
  },
];

const THEMES: Array<{ id: Theme; name: string; swatches: string[] }> = [
  { id: "dark", name: "Midnight", swatches: ["#252422", "#eb5e28", "#f0c955"] },
  { id: "light", name: "Paper", swatches: ["#fffaf0", "#252422", "#eb5e28"] },
  {
    id: "gradient",
    name: "Sunset",
    swatches: ["#eb5e28", "#f0c955", "#fffaf0"],
  },
  {
    id: "neon",
    name: "Afterglow",
    swatches: ["#252422", "#87b9ad", "#f0c955"],
  },
];

const FORMATS: Array<{
  id: Format;
  name: string;
  size: string;
  platform: string;
  shape: string;
}> = [
  {
    id: "square",
    name: "Square",
    size: "1080 × 1080",
    platform: "Instagram",
    shape: "aspect-square",
  },
  {
    id: "story",
    name: "Story",
    size: "1080 × 1920",
    platform: "Stories & Reels",
    shape: "aspect-[9/14]",
  },
  {
    id: "rect",
    name: "Landscape",
    size: "1200 × 630",
    platform: "X & Facebook",
    shape: "aspect-video",
  },
];

export function StatsCardGenerator() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useAuth();
  const { notes } = useLifeStore();
  const { milestones } = useMilestoneStore();
  const [selectedCard, setSelectedCard] = useState<CardType>("summary");
  const [selectedTheme, setSelectedTheme] = useState<Theme>("dark");
  const [selectedFormat, setSelectedFormat] = useState<Format>("square");
  const [stats, setStats] = useState<Stats | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoadingUser && !user) router.push("/login");
  }, [isLoadingUser, user, router]);

  useEffect(() => {
    const noteArray = Object.values(notes) as Note[];
    const moodValues = noteArray
      .filter((note) => note.mood > 0)
      .map((note) => note.mood);
    const averageMood = moodValues.length
      ? (
          moodValues.reduce((total, mood) => total + mood, 0) /
          moodValues.length
        ).toFixed(1)
      : 0;

    let currentStreak = 0;
    let maxStreak = 0;
    let temporaryStreak = 0;
    const sortedNotes = [...noteArray].sort(
      (a, b) => a.weekIndex - b.weekIndex,
    );
    sortedNotes.forEach((note, index) => {
      if (note.note && note.note !== "<p></p>") {
        temporaryStreak += 1;
        maxStreak = Math.max(maxStreak, temporaryStreak);
        if (index === sortedNotes.length - 1) currentStreak = temporaryStreak;
      } else temporaryStreak = 0;
    });

    const tagCount = new Map<string, number>();
    noteArray.forEach((note) =>
      note.tags?.forEach((tag) =>
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1),
      ),
    );
    const milestonesByCategory = new Map<string, number>();
    milestones.forEach((milestone: Milestone) => {
      milestonesByCategory.set(
        milestone.category,
        (milestonesByCategory.get(milestone.category) || 0) + 1,
      );
    });

    setStats({
      totalMemories: noteArray.filter(
        (note) => note.note && note.note !== "<p></p>",
      ).length,
      averageMood,
      currentStreak,
      maxStreak,
      topTags: [...tagCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag),
      moodCounts: {
        amazing: moodValues.filter((mood) => mood === 5).length,
        good: moodValues.filter((mood) => mood === 4).length,
        okay: moodValues.filter((mood) => mood === 3).length,
        bad: moodValues.filter((mood) => mood === 2).length,
        terrible: moodValues.filter((mood) => mood === 1).length,
      },
      milestonesByCategory,
      totalMilestones: milestones.length,
      moodValues,
      longestStreak: maxStreak,
    });
  }, [notes, milestones]);

  function renderCard() {
    if (!stats) return null;
    const props = { theme: selectedTheme, stats };
    if (selectedCard === "mood") return <MoodCard {...props} />;
    if (selectedCard === "milestones") return <MilestonesCard {...props} />;
    if (selectedCard === "progress") return <ProgressCard {...props} />;
    return <SummaryCard {...props} />;
  }

  if (isLoadingUser || !stats) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf0] text-[#252422]">
        <div className="text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#eb5e28] border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-[#77726a]">
            Preparing your studio...
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
        <div className="mx-auto max-w-[1500px]">
          <header className="mb-8 border-b border-[#252422]/10 pb-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#625f59]">
                <Sparkles className="h-3.5 w-3.5 text-[#eb5e28]" /> Share your
                story
              </div>
              <button
                onClick={() => router.push("/grid")}
                className="group inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-4 py-2.5 text-xs font-bold transition hover:border-[#eb5e28]/40 hover:text-[#eb5e28]"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />{" "}
                Back to grid
              </button>
            </div>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-5xl font-semibold leading-none tracking-[-0.065em] sm:text-6xl">
                  Stats{" "}
                  <span className="font-serif font-normal italic text-[#eb5e28]">
                    Studio
                  </span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#6d6861]">
                  Turn the weeks you have lived into a polished visual ready to
                  save or share.
                </p>
              </div>
              <div className="rounded-2xl bg-[#252422] px-5 py-4 text-[#fffaf0]">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Live selection
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {CARD_OPTIONS.find((item) => item.id === selectedCard)?.name}{" "}
                  · {FORMATS.find((item) => item.id === selectedFormat)?.name}
                </p>
              </div>
            </div>
          </header>

          <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="space-y-4 xl:sticky xl:top-6">
              <ControlSection
                icon={LayoutTemplate}
                eyebrow="01"
                title="Choose a story"
              >
                <div className="grid grid-cols-2 gap-2">
                  {CARD_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedCard(option.id)}
                      className={`relative rounded-2xl border p-4 text-left transition ${selectedCard === option.id ? "border-[#252422] bg-[#252422] text-[#fffaf0] shadow-lg" : "border-[#252422]/10 bg-white/65 hover:border-[#eb5e28]/35"}`}
                    >
                      <span
                        className={`mb-4 grid h-9 w-9 place-items-center rounded-xl text-lg ${selectedCard === option.id ? "bg-[#f0c955] text-[#252422]" : "bg-[#f7ead7] text-[#eb5e28]"}`}
                      >
                        {option.icon}
                      </span>
                      <p className="text-sm font-bold">{option.name}</p>
                      <p
                        className={`mt-1 text-[10px] leading-4 ${selectedCard === option.id ? "text-white/45" : "text-[#77726a]"}`}
                      >
                        {option.desc}
                      </p>
                      {selectedCard === option.id && (
                        <Check className="absolute right-3 top-3 h-3.5 w-3.5 text-[#f0c955]" />
                      )}
                    </button>
                  ))}
                </div>
              </ControlSection>

              <ControlSection icon={Palette} eyebrow="02" title="Set the mood">
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`rounded-2xl border p-3 text-left transition ${selectedTheme === theme.id ? "border-[#eb5e28] bg-[#eb5e28]/7" : "border-[#252422]/10 hover:border-[#252422]/25"}`}
                    >
                      <div className="mb-3 flex -space-x-1.5">
                        {theme.swatches.map((color) => (
                          <span
                            key={color}
                            style={{ backgroundColor: color }}
                            className="h-6 w-6 rounded-full border-2 border-[#fffaf0]"
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{theme.name}</span>
                        {selectedTheme === theme.id && (
                          <Check className="h-3.5 w-3.5 text-[#eb5e28]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ControlSection>

              <ControlSection icon={Ratio} eyebrow="03" title="Pick a canvas">
                <div className="space-y-2">
                  {FORMATS.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${selectedFormat === format.id ? "border-[#87b9ad] bg-[#87b9ad]/15" : "border-[#252422]/10 hover:border-[#252422]/25"}`}
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-xl bg-[#252422] ${format.shape}`}
                      >
                        <span className="block h-2 w-2 rounded-sm bg-[#f0c955]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold">
                          {format.name}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-[#77726a]">
                          {format.size} · {format.platform}
                        </span>
                      </span>
                      {selectedFormat === format.id && (
                        <Check className="h-4 w-4 text-[#477f73]" />
                      )}
                    </button>
                  ))}
                </div>
              </ControlSection>
            </aside>

            <motion.section
              key={`${selectedCard}-${selectedTheme}-${selectedFormat}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-w-0"
            >
              <CardPreview
                card={renderCard()}
                format={selectedFormat}
                cardType={selectedCard}
              />
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  );
}

function ControlSection({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-[#252422]/10 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f7ead7] text-[#eb5e28]">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#eb5e28]">
            {eyebrow}
          </p>
          <h2 className="text-sm font-bold">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
