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
      className="relative group overflow-hidden rounded-lg cursor-pointer w-full break-inside-avoid"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Image */}
      <div className="relative aspect-auto bg-zinc-800">
        <img
          src={photo.url}
          alt={photo.name}
          onLoad={() => setIsLoading(false)}
          className={`w-full h-auto object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {isLoading && (
          <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
        <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-sm text-white font-medium truncate">{photo.name}</p>
          <p className="text-xs text-zinc-400 mt-1">
            Week {photo.weekIndex + 1}
          </p>
        </div>
      </div>

      {/* Zoom Icon */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur rounded-full p-2">
        <span className="text-white text-lg">🔍</span>
      </div>
    </motion.button>
  )
}