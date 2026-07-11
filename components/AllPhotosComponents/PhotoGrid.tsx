"use client";

import { motion } from "framer-motion";
import { PhotoCard } from "./PhotoCard";
import type { PhotoItem } from "./PhotoGallery";

interface PhotoGridProps {
  photos: PhotoItem[];
  onPhotoClick: (photo: PhotoItem) => void;
}

const ASPECTS = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[5/4]",
  "aspect-[4/5]",
  "aspect-[3/2]",
];

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {photos.map((photo, index) => (
        <motion.div
          key={photo._id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.035, 0.3) }}
          className="mb-4 break-inside-avoid"
        >
          <PhotoCard
            photo={photo}
            onClick={() => onPhotoClick(photo)}
            aspectClass={ASPECTS[index % ASPECTS.length]}
          />
        </motion.div>
      ))}
    </div>
  );
}