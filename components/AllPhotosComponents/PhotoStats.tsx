"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Camera, Images, Layers3 } from "lucide-react";
import type { PhotoItem } from "./PhotoGallery";

interface PhotoStatsProps {
  photos: PhotoItem[];
}

export function PhotoStats({ photos }: PhotoStatsProps) {
  const stats = useMemo(() => {
    const byDate = [...photos].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    const weeks = new Map<number, number>();
    photos.forEach((photo) =>
      weeks.set(photo.weekIndex, (weeks.get(photo.weekIndex) || 0) + 1),
    );
    return {
      total: photos.length,
      oldest: byDate[0]?.createdAt,
      newest: byDate.at(-1)?.createdAt,
      active: [...weeks.entries()].sort((a, b) => b[1] - a[1])[0],
    };
  }, [photos]);

  const cards = [
    {
      label: "Photos saved",
      value: stats.total.toLocaleString(),
      note: "in your gallery",
      icon: Images,
      color: "bg-[#252422] text-[#fffaf0]",
      muted: "text-white/45",
      iconStyle: "bg-[#f0c955] text-[#252422]",
    },
    {
      label: "First capture",
      value:
        stats.oldest?.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) || "—",
      note: "oldest memory",
      icon: CalendarClock,
      color: "bg-white/65 text-[#252422]",
      muted: "text-[#9a9287]",
      iconStyle: "bg-[#f7ead7] text-[#eb5e28]",
    },
    {
      label: "Latest capture",
      value:
        stats.newest?.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) || "—",
      note: "newest memory",
      icon: Camera,
      color: "bg-white/65 text-[#252422]",
      muted: "text-[#9a9287]",
      iconStyle: "bg-[#87b9ad]/20 text-[#477f73]",
    },
    {
      label: "Most photographed",
      value: stats.active ? `${stats.active[1]} photos` : "—",
      note: stats.active ? `week ${stats.active[0] + 1}` : "no active week",
      icon: Layers3,
      color: "bg-[#f0c955] text-[#252422]",
      muted: "text-[#252422]/45",
      iconStyle: "bg-[#252422] text-[#fffaf0]",
    },
  ];

  return (
    <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-[1.5rem] border border-[#252422]/10 p-4 shadow-sm sm:p-5 ${card.color}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={`text-[9px] font-bold uppercase tracking-[0.15em] ${card.muted}`}
                >
                  {card.label}
                </p>
                <p className="mt-3 text-lg font-bold tracking-[-0.03em] sm:text-xl">
                  {card.value}
                </p>
                <p className={`mt-1 text-[10px] font-medium ${card.muted}`}>
                  {card.note}
                </p>
              </div>
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${card.iconStyle}`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}