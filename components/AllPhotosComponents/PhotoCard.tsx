"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, Maximize2 } from "lucide-react";
import type { PhotoItem } from "./PhotoGallery";

interface PhotoCardProps {
  photo: PhotoItem;
  onClick: () => void;
  aspectClass?: string;
}

export function PhotoCard({
  photo,
  onClick,
  aspectClass = "aspect-[4/5]",
}: PhotoCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="group relative block w-full overflow-hidden rounded-[1.5rem] border border-[#252422]/10 bg-[#f7ead7] text-left shadow-sm transition-shadow hover:shadow-[0_18px_45px_rgba(37,36,34,0.15)]"
    >
      <div className={`relative ${aspectClass}`}>
        <Image
          src={photo.url}
          alt={photo.name || `Photo from week ${photo.weekIndex + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onLoad={() => setIsLoading(false)}
          className={`object-cover transition duration-700 group-hover:scale-105 ${isLoading ? "opacity-0" : "opacity-100"}`}
        />
        {isLoading && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#f7ead7] to-[#e5dac9]" />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#252422]/90 via-[#252422]/5 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute right-3 top-3 grid h-9 w-9 translate-y-1 place-items-center rounded-full border border-white/15 bg-[#252422]/45 text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <Maximize2 className="h-4 w-4" />
      </span>
      <div className="absolute inset-x-0 bottom-0 translate-y-1 p-4 text-[#fffaf0] transition-transform duration-300 group-hover:translate-y-0">
        <p className="truncate text-sm font-bold">
          {photo.name || "Untitled memory"}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#f0c955]">
          <CalendarDays className="h-3 w-3" /> Week {photo.weekIndex + 1}
        </p>
      </div>
    </motion.button>
  );
}