'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Chapter {
  _id: string
  startWeek: number
  endWeek: number
  title: string
  emoji: string
  description: string
  keyTags: string[]
  averageMood: number
  photoCount: number
  milestoneCount: number
}

interface ChapterCardProps {
  chapter: Chapter
  onClick: () => void
  photos?: string[] // Array of photo URLs
  videos?: string[] // Array of video URLs
}

export function ChapterCard({ chapter, onClick, photos = [], videos = [] }: ChapterCardProps) {
  const weekCount = chapter.endWeek - chapter.startWeek + 1
  const hasMedia = photos.length > 0 || videos.length > 0

  

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      className="text-left w-full overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all"
    >
      {/* Media Thumbnail Grid */}
      {hasMedia && (
        <div className="h-40 bg-zinc-950 border-b border-zinc-800 overflow-hidden flex items-center justify-center">
          {photos.length > 0 ? (
            <div className="grid grid-cols-4 gap-1 w-full h-full">
              {photos.slice(0, 4).map((photo, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden bg-zinc-800"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                  }}
                >
                  <Image
                    src={photo}
                    alt={`Chapter ${chapter._id} photo ${idx}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform"
                  />
                  {/* Count overlay for more photos */}
                  {idx === 3 && photos.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        +{photos.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {/* Fill remaining grid with gradient */}
              {photos.length < 4 && (
                <>
                  {Array(4 - photos.length)
                    .fill(null)
                    .map((_, idx) => (
                      <div
                        key={`empty-${idx}`}
                        className="bg-gradient-to-br from-zinc-800 to-zinc-950"
                      />
                    ))}
                </>
              )}
            </div>
          ) : videos.length > 0 ? (
            <div className="w-full h-full relative bg-zinc-950 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl mb-2">🎬</p>
                <p className="text-xs text-zinc-400">{videos.length} video{videos.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-4xl mb-2">{chapter.emoji}</p>
            <h3 className="text-2xl font-light text-white">{chapter.title}</h3>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-sm">{weekCount} weeks</p>
            <p className="text-zinc-400 text-xs mt-1">
              W{chapter.startWeek + 1}-{chapter.endWeek + 1}
            </p>
          </div>
        </div>

        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
          {chapter.description}
        </p>

        {/* Media Indicators */}
        {hasMedia && (
          <div className="flex gap-3 mb-4 pb-4 border-b border-zinc-800">
            {photos.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <span>📸</span>
                <span>{photos.length}</span>
              </div>
            )}
            {videos.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <span>🎬</span>
                <span>{videos.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-xs text-zinc-500">
            <span>😊 {chapter.averageMood.toFixed(1)}</span>
            <span>🏆 {chapter.milestoneCount}</span>
          </div>
          <div className="text-zinc-600">→</div>
        </div>

        {/* Tags */}
        {chapter.keyTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-800">
            {chapter.keyTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  )
}