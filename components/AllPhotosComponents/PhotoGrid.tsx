'use client'

import { motion } from 'framer-motion'
import { PhotoCard } from './PhotoCard'

type PhotoItem = {
  _id: string
  weekIndex: number
  url: string
  name: string
  createdAt: Date
  weekDate?: string
}

interface PhotoGridProps {
  photos: PhotoItem[]
  onPhotoClick: (photo: PhotoItem) => void
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {photos.map((photo, idx) => (
        <motion.div
          key={photo._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <PhotoCard
            photo={photo}
            onClick={() => onPhotoClick(photo)}
          />
        </motion.div>
      ))}
    </div>
  )
}