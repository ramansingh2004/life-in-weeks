'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

type PhotoItem = {
  _id: string
  weekIndex: number
  url: string
  name: string
  createdAt: Date
  weekDate?: string
}

interface PhotoCardProps {
  photo: PhotoItem
  onClick: () => void
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <motion.button
      onClick={onClick}
      className="relative group overflow-hidden rounded-lg cursor-pointer w-full break-inside-avoid hover:ring-1 hover:ring-[#FCA311] hover:shadow-[0_0_15px_rgba(252,163,17,0.2)] transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Image */}
      <div className="relative aspect-auto bg-[#14213D]">
        <Image
          src={photo.url}
          alt={photo.name}
          width={150}
          height={150}
          onLoad={() => setIsLoading(false)}
          className={`w-full h-auto object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {isLoading && (
          <div className="absolute inset-0 bg-[#14213D] animate-pulse" />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
        <div className="w-full p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-sm text-white font-semibold truncate">{photo.name}</p>
          <p className="text-xs text-[#FCA311] font-medium mt-1">
            Week {photo.weekIndex + 1}
          </p>
        </div>
      </div>

      {/* Zoom Icon */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 border border-zinc-800/80 backdrop-blur rounded-full p-2">
        <span className="text-[#FCA311] text-sm">🔍</span>
      </div>
    </motion.button>
  )
}