"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Download, X } from "lucide-react";
import type { PhotoItem } from "./PhotoGallery";

interface PhotoViewerProps {
  photo: PhotoItem;
  onClose: () => void;
  onNavigate: (direction: "next" | "prev") => void;
}

export function PhotoViewer({ photo, onClose, onNavigate }: PhotoViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => setIsLoading(true), [photo._id]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNavigate("prev");
      if (event.key === "ArrowRight") onNavigate("next");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, onNavigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#252422]/92 p-3 backdrop-blur-xl sm:p-6"
    >
      <motion.section
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        className="relative flex h-[92svh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#181715] shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
      >
        <div className="relative min-h-0 flex-1">
          <Image
            src={photo.url}
            alt={photo.name || `Photo from week ${photo.weekIndex + 1}`}
            fill
            sizes="100vw"
            priority
            onLoad={() => setIsLoading(false)}
            className={`object-contain p-3 transition-opacity duration-300 sm:p-6 ${isLoading ? "opacity-0" : "opacity-100"}`}
          />
          {isLoading && (
            <div className="absolute inset-6 animate-pulse rounded-2xl bg-white/[0.04]" />
          )}
          <button
            onClick={() => onNavigate("prev")}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-[#252422]/65 text-white backdrop-blur-md transition hover:border-[#f0c955]/50 hover:text-[#f0c955] sm:left-5"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => onNavigate("next")}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-[#252422]/65 text-white backdrop-blur-md transition hover:border-[#f0c955]/50 hover:text-[#f0c955] sm:right-5"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            aria-label="Close viewer"
            className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#252422]/65 text-white backdrop-blur-md transition hover:border-[#eb5e28]/50 hover:text-[#eb5e28] sm:right-5 sm:top-5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <footer className="flex flex-col gap-4 border-t border-white/10 bg-[#252422] px-5 py-4 text-[#fffaf0] sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="min-w-0">
            <p className="truncate text-base font-bold">
              {photo.name || "Untitled memory"}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/40">
              <CalendarDays className="h-3 w-3 text-[#f0c955]" /> Week{" "}
              {photo.weekIndex + 1} · {photo.createdAt.toLocaleDateString()}
            </p>
          </div>
          <a
            href={photo.url}
            download={photo.name || `week-${photo.weekIndex + 1}-photo`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#eb5e28] px-5 text-xs font-bold text-white transition hover:bg-[#d94f20]"
          >
            <Download className="h-4 w-4" /> Save original
          </a>
        </footer>
      </motion.section>
    </motion.div>
  );
}