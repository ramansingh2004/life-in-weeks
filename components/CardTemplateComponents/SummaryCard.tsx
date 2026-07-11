"use client";

import { motion } from "framer-motion";

interface SummaryStats {
  totalMemories: number;
  averageMood: number | string;
  currentStreak: number;
  totalMilestones: number;
  topTags: string[];
}

interface SummaryCardProps {
  theme: "dark" | "light" | "gradient" | "neon";
  stats: SummaryStats;
}

const THEMES = {
  dark: {
    shell: "bg-[#252422] text-[#fffaf0]",
    muted: "text-white/50",
    panel: "bg-white/[0.07] border-white/10",
    accent: "text-[#f0c955]",
    chip: "bg-[#eb5e28] text-white",
  },
  light: {
    shell: "bg-[#fffaf0] text-[#252422]",
    muted: "text-[#252422]/50",
    panel: "bg-white/70 border-[#252422]/10",
    accent: "text-[#eb5e28]",
    chip: "bg-[#252422] text-[#fffaf0]",
  },
  gradient: {
    shell:
      "bg-gradient-to-br from-[#eb5e28] via-[#ed7548] to-[#f0c955] text-[#252422]",
    muted: "text-[#252422]/55",
    panel: "bg-[#fffaf0]/45 border-white/30",
    accent: "text-[#fffaf0]",
    chip: "bg-[#252422] text-[#fffaf0]",
  },
  neon: {
    shell: "bg-[#252422] text-[#fffaf0]",
    muted: "text-white/50",
    panel: "bg-[#87b9ad]/10 border-[#87b9ad]/35",
    accent: "text-[#87b9ad]",
    chip: "bg-[#f0c955] text-[#252422]",
  },
};

export function SummaryCard({ theme, stats }: SummaryCardProps) {
  const config = THEMES[theme];
  const metrics = [
    {
      value: stats.totalMemories,
      label: "Memories",
      note: "weeks documented",
      mark: "01",
    },
    {
      value: stats.averageMood,
      label: "Average mood",
      note: "out of five",
      mark: "02",
    },
    {
      value: stats.currentStreak,
      label: "Current streak",
      note: "consecutive weeks",
      mark: "03",
    },
    {
      value: stats.totalMilestones,
      label: "Milestones",
      note: "moments celebrated",
      mark: "04",
    },
  ];

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden p-12 ${config.shell}`}
    >
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-current opacity-10" />
      <div className="absolute -bottom-44 -left-32 h-[30rem] w-[30rem] rounded-full border border-current opacity-10" />
      {theme === "neon" && (
        <div className="absolute right-20 top-20 h-72 w-72 rounded-full bg-[#87b9ad]/15 blur-[90px]" />
      )}

      <header className="relative z-10 flex items-start justify-between border-b border-current/15 pb-10">
        <div>
          <p
            className={`text-sm font-bold uppercase tracking-[0.28em] ${config.accent}`}
          >
            Life in Weeks
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.065em]">
            A life,{" "}
            <span className="font-serif font-normal italic">
              in perspective.
            </span>
          </h1>
        </div>
        <span
          className={`rounded-full px-5 py-3 text-sm font-bold ${config.chip}`}
        >
          Your summary
        </span>
      </header>

      <div className="relative z-10 grid flex-1 grid-cols-4 content-center gap-4 py-8">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`rounded-[1.5rem] border p-5 ${config.panel}`}
          >
            <div className="flex items-start justify-between">
              <p
                className={`text-sm font-bold uppercase tracking-[0.16em] ${config.muted}`}
              >
                {metric.label}
              </p>
              <span className={`text-xs font-bold ${config.accent}`}>
                {metric.mark}
              </span>
            </div>
            <p className="mt-6 text-5xl font-semibold tracking-[-0.06em]">
              {metric.value}
            </p>
            <p className={`mt-3 text-sm ${config.muted}`}>{metric.note}</p>
          </motion.div>
        ))}
      </div>

      <footer className="relative z-10 flex min-h-14 items-center justify-between border-t border-current/15 pt-8">
        <div className="flex flex-wrap gap-2">
          {stats.topTags.length ? (
            stats.topTags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full border border-current/15 px-4 py-2 text-xs font-bold ${config.muted}`}
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className={`text-sm ${config.muted}`}>
              Your themes will appear here
            </span>
          )}
        </div>
        <p
          className={`text-xs font-bold uppercase tracking-[0.2em] ${config.muted}`}
        >
          Every week counts
        </p>
      </footer>
    </div>
  );
}
