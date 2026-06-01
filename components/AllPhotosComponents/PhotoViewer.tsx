'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'

type PhotoItem = {
  _id: string
  weekIndex: number
  url: string
  name: string
  createdAt: Date
  weekDate?: string
}

interface PhotoViewerProps {
  photo: PhotoItem
  onClose: () => void
  onNavigate: (direction: 'next' | 'prev') => void
}

export function PhotoViewer({ photo, onClose, onNavigate }: PhotoViewerProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative max-w-4xl max-h-screen flex flex-col"
      >
        {/* Image */}
        <div className="relative flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
          <Image
            src={photo.url}
            alt={photo.name}
            width={150}
            height={150}
            onLoad={() => setIsLoading(false)}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {isLoading && (
            <div className="absolute inset-0 bg-[#14213D] animate-pulse" />
          )}

          {/* Navigation Arrows */}
          <button
            onClick={() => onNavigate('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 w-10 h-10 flex items-center justify-center bg-black/60 border border-zinc-800/80 text-white hover:text-[#FCA311] hover:border-[#FCA311]/50 rounded-full transition-all"
          >
            ←
          </button>
          <button
            onClick={() => onNavigate('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 w-10 h-10 flex items-center justify-center bg-black/60 border border-zinc-800/80 text-white hover:text-[#FCA311] hover:border-[#FCA311]/50 rounded-full transition-all"
          >
            →
          </button>
        </div>

        {/* Info */}
        <div className="p-4 bg-[#14213D] border-t border-[#FCA311]/20 rounded-b-lg">
          <p className="text-white font-medium">{photo.name}</p>
          <p className="text-sm text-zinc-400 mt-1">
            Week {photo.weekIndex + 1} • {new Date(photo.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 w-10 h-10 flex items-center justify-center bg-black/60 border border-zinc-800/80 text-white hover:text-[#FCA311] hover:border-[#FCA311]/50 rounded-full transition-all"
        >
          ✕
        </button>

        {/* Download Button */}
        <a
          href={photo.url}
          download={photo.name}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-4 right-4 px-4 py-2 bg-[#FCA311] hover:bg-[#FCA311]/90 text-black font-semibold rounded text-sm transition-all duration-300 shadow-md hover:shadow-[0_0_10px_rgba(252,163,17,0.3)]"
        >
          Download
        </a>
      </motion.div>
    </motion.div>
  )
}