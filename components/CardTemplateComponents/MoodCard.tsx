"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface MoodCounts {
  amazing: number;
  good: number;
  okay: number;
  bad: number;
  terrible: number;
}
interface MoodStats {
  moodCounts: MoodCounts;
  averageMood: number | string;
}
interface MoodCardProps {
  theme: "dark" | "light" | "gradient" | "neon";
  stats: MoodStats;
}

const MOODS = [
  { label: "Amazing", key: "amazing", color: "#eb5e28", symbol: "●" },
  { label: "Good", key: "good", color: "#f0c955", symbol: "◕" },
  { label: "Okay", key: "okay", color: "#87b9ad", symbol: "◒" },
  { label: "Bad", key: "bad", color: "#8c8174", symbol: "◔" },
  { label: "Terrible", key: "terrible", color: "#514d48", symbol: "○" },
] as const;

const THEMES = {
  dark: {
    shell: "bg-[#252422] text-[#fffaf0]",
    muted: "text-white/45",
    panel: "bg-white/[0.06] border-white/10",
    track: "bg-white/10",
    accent: "text-[#f0c955]",
  },
  light: {
    shell: "bg-[#fffaf0] text-[#252422]",
    muted: "text-[#252422]/50",
    panel: "bg-white/70 border-[#252422]/10",
    track: "bg-[#252422]/10",
    accent: "text-[#eb5e28]",
  },
  gradient: {
    shell:
      "bg-gradient-to-br from-[#f0c955] via-[#f7d98a] to-[#fffaf0] text-[#252422]",
    muted: "text-[#252422]/50",
    panel: "bg-white/45 border-white/40",
    track: "bg-[#252422]/10",
    accent: "text-[#eb5e28]",
  },
  neon: {
    shell: "bg-[#252422] text-[#fffaf0]",
    muted: "text-white/45",
    panel: "bg-[#87b9ad]/10 border-[#87b9ad]/35",
    track: "bg-[#87b9ad]/15",
    accent: "text-[#87b9ad]",
  },
};

export function MoodCard({ theme, stats }: MoodCardProps) {
  const config = THEMES[theme];
  const total = useMemo(
    () =>
      Object.values(stats.moodCounts).reduce((sum, value) => sum + value, 0),
    [stats.moodCounts],
  );
  const data = useMemo(
    () =>
      MOODS.map((mood) => {
        const count = stats.moodCounts[mood.key];
        return {
          ...mood,
          count,
          percentage: total ? (count / total) * 100 : 0,
        };
      }),
    [stats.moodCounts, total],
  );
  const positive = stats.moodCounts.amazing + stats.moodCounts.good;

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden p-12 ${config.shell}`}
    >
      <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#eb5e28]/15 blur-[80px]" />
      <header className="relative z-10 flex items-end justify-between border-b border-current/15 pb-9">
        <div>
          <p
            className={`text-sm font-bold uppercase tracking-[0.28em] ${config.accent}`}
          >
            Emotional weather
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.065em]">
            Your mood{" "}
            <span className="font-serif font-normal italic">journey</span>
          </h1>
        </div>
        <div
          className={`min-w-44 rounded-[1.75rem] border p-6 text-right ${config.panel}`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-[0.16em] ${config.muted}`}
          >
            Average
          </p>
          <p className="mt-2 text-5xl font-semibold tracking-[-0.06em]">
            {stats.averageMood}
            <span className={`text-lg ${config.muted}`}>/5</span>
          </p>
        </div>
      </header>

      <div className="relative z-10 grid flex-1 grid-cols-[1fr_260px] items-center gap-10 py-8">
        <div className="space-y-5">
          {data.map((mood, index) => (
            <motion.div
              key={mood.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span style={{ color: mood.color }} className="text-xl">
                    {mood.symbol}
                  </span>
                  <span className="text-lg font-semibold">{mood.label}</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className={`text-sm ${config.muted}`}>
                    {mood.count} weeks
                  </span>
                  <span className="w-12 text-right text-lg font-bold">
                    {mood.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div
                className={`h-3 overflow-hidden rounded-full ${config.track}`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mood.percentage}%` }}
                  transition={{ delay: 0.15 + index * 0.05, duration: 0.8 }}
                  style={{ backgroundColor: mood.color }}
                  className="h-full rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div
          className={`rounded-[2.25rem] border p-8 text-center ${config.panel}`}
        >
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-[10px] border-[#87b9ad]/25 text-5xl">
            {positive >= total - positive ? "◡" : "◔"}
          </div>
          <p className="mt-7 text-5xl font-semibold tracking-[-0.06em]">
            {total ? Math.round((positive / total) * 100) : 0}%
          </p>
          <p className={`mt-2 text-sm leading-6 ${config.muted}`}>
            of recorded weeks felt positive
          </p>
        </div>
      </div>

      <footer className="relative z-10 flex items-center justify-between border-t border-current/15 pt-8">
        <p className={`text-sm ${config.muted}`}>
          {total} mood check-ins shaped this view
        </p>
        <p
          className={`text-xs font-bold uppercase tracking-[0.2em] ${config.accent}`}
        >
          Life in Weeks
        </p>
      </footer>
    </div>
  );
}
