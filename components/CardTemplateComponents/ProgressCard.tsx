"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface ProgressStats {
  totalMemories: number;
  lifeExpectancy?: number;
  birthDate?: string;
}
interface ProgressCardProps {
  theme: "dark" | "light" | "gradient" | "neon";
  stats: ProgressStats;
}

const THEMES = {
  dark: {
    shell: "bg-[#252422] text-[#fffaf0]",
    muted: "text-white/45",
    panel: "bg-white/[0.06] border-white/10",
    accent: "text-[#f0c955]",
    track: "bg-white/10",
  },
  light: {
    shell: "bg-[#fffaf0] text-[#252422]",
    muted: "text-[#252422]/50",
    panel: "bg-white/70 border-[#252422]/10",
    accent: "text-[#eb5e28]",
    track: "bg-[#252422]/10",
  },
  gradient: {
    shell:
      "bg-gradient-to-br from-[#87b9ad] via-[#bed8cf] to-[#fffaf0] text-[#252422]",
    muted: "text-[#252422]/50",
    panel: "bg-white/45 border-white/40",
    accent: "text-[#c9471a]",
    track: "bg-[#252422]/10",
  },
  neon: {
    shell: "bg-[#252422] text-[#fffaf0]",
    muted: "text-white/45",
    panel: "bg-[#87b9ad]/10 border-[#87b9ad]/35",
    accent: "text-[#87b9ad]",
    track: "bg-[#87b9ad]/15",
  },
};

const MILESTONES = [
  { year: 0, label: "Begin" },
  { year: 18, label: "Grow" },
  { year: 30, label: "Build" },
  { year: 50, label: "Guide" },
  { year: 70, label: "Legacy" },
];

export function ProgressCard({ theme, stats }: ProgressCardProps) {
  const config = THEMES[theme];
  const lifeYears = stats.lifeExpectancy || 80;
  const totalWeeks = lifeYears * 52;
  const documentedWeeks = Math.min(stats.totalMemories, totalWeeks);
  const yearsLogged = documentedWeeks / 52;
  const remaining = Math.max(totalWeeks - documentedWeeks, 0);
  const percentage = useMemo(
    () => Math.min((documentedWeeks / totalWeeks) * 100, 100),
    [documentedWeeks, totalWeeks],
  );

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden p-12 ${config.shell}`}
    >
      <div className="absolute -bottom-52 -right-40 h-[34rem] w-[34rem] rounded-full border-[90px] border-[#87b9ad] opacity-[0.08]" />
      <header className="relative z-10 flex items-end justify-between border-b border-current/15 pb-9">
        <div>
          <p
            className={`text-sm font-bold uppercase tracking-[0.28em] ${config.accent}`}
          >
            The long view
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.065em]">
            Life in{" "}
            <span className="font-serif font-normal italic">motion.</span>
          </h1>
        </div>
        <p className={`max-w-64 text-right text-sm leading-6 ${config.muted}`}>
          A visual record of the weeks you have chosen to remember.
        </p>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-center py-8">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-[0.18em] ${config.muted}`}
            >
              Life documented
            </p>
            <p className="mt-4 text-[6rem] font-semibold leading-none tracking-[-0.085em]">
              {percentage.toFixed(1)}
              <span className={`text-4xl ${config.accent}`}>%</span>
            </p>
          </div>
          <div
            className={`grid min-w-[340px] grid-cols-2 gap-px overflow-hidden rounded-[2rem] border ${config.panel}`}
          >
            <Stat
              label="Weeks saved"
              value={documentedWeeks.toLocaleString()}
              muted={config.muted}
            />
            <Stat
              label="Years recorded"
              value={yearsLogged.toFixed(1)}
              muted={config.muted}
            />
            <Stat
              label="Total horizon"
              value={totalWeeks.toLocaleString()}
              muted={config.muted}
            />
            <Stat
              label="Weeks ahead"
              value={remaining.toLocaleString()}
              muted={config.muted}
            />
          </div>
        </div>

        <div className="mt-9">
          <div className="relative pb-12">
            <div
              className={`h-5 overflow-hidden rounded-full border border-current/10 ${config.track}`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#eb5e28] via-[#f0c955] to-[#87b9ad]"
              />
            </div>
            {MILESTONES.map((milestone) => {
              const left = Math.min((milestone.year / lifeYears) * 100, 100);
              return (
                <div
                  key={milestone.year}
                  style={{ left: `${left}%` }}
                  className="absolute top-0 -translate-x-1/2"
                >
                  <span
                    className={`mx-auto block h-5 w-px ${milestone.year <= yearsLogged ? "bg-[#eb5e28]" : "bg-current opacity-25"}`}
                  />
                  <p
                    className={`mt-3 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.1em] ${config.muted}`}
                  >
                    {milestone.year}y · {milestone.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="relative z-10 flex items-center justify-between border-t border-current/15 pt-8">
        <p className={`text-sm ${config.muted}`}>
          The story is measured in moments, not percentages.
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

function Stat({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted: string;
}) {
  return (
    <div className="border border-current/5 p-6">
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.14em] ${muted}`}
      >
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
    </div>
  );
}
