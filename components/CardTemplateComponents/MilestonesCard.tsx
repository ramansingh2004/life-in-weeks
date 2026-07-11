"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { CATEGORY_COLORS } from "@/typesDefined";

interface MilestoneStats {
  milestonesByCategory: Map<string, number>;
  totalMilestones: number;
}
interface MilestonesCardProps {
  theme: "dark" | "light" | "gradient" | "neon";
  stats: MilestoneStats;
}

const THEMES = {
  dark: {
    shell: "bg-[#252422] text-[#fffaf0]",
    muted: "text-white/45",
    panel: "bg-white/[0.06] border-white/10",
    accent: "text-[#f0c955]",
    number: "bg-[#f0c955] text-[#252422]",
  },
  light: {
    shell: "bg-[#fffaf0] text-[#252422]",
    muted: "text-[#252422]/50",
    panel: "bg-white/70 border-[#252422]/10",
    accent: "text-[#eb5e28]",
    number: "bg-[#eb5e28] text-white",
  },
  gradient: {
    shell: "bg-gradient-to-br from-[#eb5e28] to-[#f0c955] text-[#252422]",
    muted: "text-[#252422]/55",
    panel: "bg-[#fffaf0]/45 border-white/35",
    accent: "text-[#fffaf0]",
    number: "bg-[#252422] text-[#fffaf0]",
  },
  neon: {
    shell: "bg-[#252422] text-[#fffaf0]",
    muted: "text-white/45",
    panel: "bg-[#87b9ad]/10 border-[#87b9ad]/35",
    accent: "text-[#87b9ad]",
    number: "bg-[#87b9ad] text-[#252422]",
  },
};

const PALETTE = [
  "#eb5e28",
  "#f0c955",
  "#87b9ad",
  "#d49f7a",
  "#8f8173",
  "#6d6861",
  "#b4a58f",
];

export function MilestonesCard({ theme, stats }: MilestonesCardProps) {
  const config = THEMES[theme];
  const categories = useMemo(
    () =>
      [...stats.milestonesByCategory.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7),
    [stats.milestonesByCategory],
  );
  const max = Math.max(...categories.map(([, count]) => count), 1);
  const top = categories[0];

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden p-12 ${config.shell}`}
    >
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[70px] border-current opacity-[0.04]" />
      <header className="relative z-10 flex items-start justify-between border-b border-current/15 pb-9">
        <div>
          <p
            className={`text-sm font-bold uppercase tracking-[0.28em] ${config.accent}`}
          >
            Moments that matter
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.065em]">
            A collection of{" "}
            <span className="font-serif font-normal italic">wins.</span>
          </h1>
        </div>
        <div
          className={`grid h-28 w-28 place-items-center rounded-full ${config.number}`}
        >
          <div className="text-center">
            <p className="text-5xl font-semibold tracking-[-0.07em]">
              {stats.totalMilestones}
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em]">
              Milestones
            </p>
          </div>
        </div>
      </header>

      <div className="relative z-10 grid flex-1 grid-cols-[1fr_280px] items-center gap-10 py-8">
        <div>
          <p
            className={`mb-6 text-xs font-bold uppercase tracking-[0.18em] ${config.muted}`}
          >
            Achievements by life area
          </p>
          <div className="space-y-3.5">
            {categories.length ? (
              categories.map(([category, count], index) => {
                const details = CATEGORY_COLORS[category];
                const color = PALETTE[index % PALETTE.length];
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-3 text-base font-semibold">
                        <span className="text-xl">{details?.icon || "✦"}</span>
                        <span className="capitalize">{category}</span>
                      </span>
                      <span className="text-lg font-bold">{count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-current/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / max) * 100}%` }}
                        transition={{
                          delay: 0.15 + index * 0.04,
                          duration: 0.8,
                        }}
                        style={{ backgroundColor: color }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className={`text-lg ${config.muted}`}>
                Your first milestone will begin this collection.
              </p>
            )}
          </div>
        </div>

        <div className={`rounded-[2.25rem] border p-8 ${config.panel}`}>
          <span className="text-5xl">
            {top ? CATEGORY_COLORS[top[0]]?.icon || "◆" : "◇"}
          </span>
          <p
            className={`mt-8 text-xs font-bold uppercase tracking-[0.18em] ${config.muted}`}
          >
            Leading chapter
          </p>
          <h2 className="mt-3 text-4xl font-semibold capitalize tracking-[-0.05em]">
            {top?.[0] || "Still unfolding"}
          </h2>
          <p className={`mt-4 text-sm leading-6 ${config.muted}`}>
            {top
              ? `${top[1]} moments make this your most celebrated life area.`
              : "Add achievements to reveal the shape of your journey."}
          </p>
        </div>
      </div>

      <footer className="relative z-10 flex items-center justify-between border-t border-current/15 pt-8">
        <p className={`text-sm ${config.muted}`}>
          Small steps become a remarkable story.
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
