'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight, Film, Flag, ImageIcon } from 'lucide-react'

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
  photos?: string[]
  videos?: string[]
}

export function ChapterCard({
  chapter,
  onClick,
  photos = [],
  videos = [],
}: ChapterCardProps) {
  const weekCount = chapter.endWeek - chapter.startWeek + 1
  const hasMedia = photos.length > 0 || videos.length > 0

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -5 }}
      className="group h-full w-full overflow-hidden rounded-[1.75rem] border border-[#252422]/10 bg-white/70 text-left shadow-sm transition-all hover:border-[#eb5e28]/35 hover:shadow-[0_20px_55px_rgba(37,36,34,0.10)]"
    >
      {hasMedia ? (
        <div className="h-44 overflow-hidden border-b border-[#252422]/10 bg-[#f3ede2]">
          {photos.length > 0 ? (
            <div className="grid h-full w-full grid-cols-4 gap-1">
              {photos.slice(0, 4).map((photo, index) => (
                <div key={photo} className="relative overflow-hidden bg-[#ddd5c9]">
                  <Image
                    src={photo}
                    alt={`${chapter.title} photo ${index + 1}`}
                    width={180}
                    height={180}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {index === 3 && photos.length > 4 && (
                    <div className="absolute inset-0 grid place-items-center bg-[#252422]/65 text-sm font-bold text-white">
                      +{photos.length - 4}
                    </div>
                  )}
                </div>
              ))}
              {Array.from({ length: Math.max(4 - photos.length, 0) }, (_, index) => (
                <div key={`empty-${index}`} className="bg-gradient-to-br from-[#e8e1d7] to-[#d8d0c4]" />
              ))}
            </div>
          ) : (
            <div className="grid h-full place-items-center bg-[#252422] text-[#fffaf0]">
              <div className="text-center">
                <Film className="mx-auto h-7 w-7 text-[#eb5e28]" />
                <p className="mt-3 text-xs font-semibold text-white/60">
                  {videos.length} video{videos.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-28 overflow-hidden bg-[#f3ede2]">
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full border border-[#eb5e28]/30" />
          <div className="absolute bottom-5 left-6 text-4xl">{chapter.emoji}</div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {hasMedia && <p className="mb-2 text-3xl">{chapter.emoji}</p>}
            <h3 className="text-2xl font-semibold leading-tight tracking-[-0.045em] text-[#252422]">
              {chapter.title}
            </h3>
          </div>
          <div className="shrink-0 rounded-xl bg-[#f3ede2] px-3 py-2 text-right">
            <p className="text-xs font-bold">{weekCount}</p>
            <p className="text-[8px] uppercase tracking-[0.1em] text-[#9a9287]">weeks</p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#6d6861]">
          {chapter.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-semibold text-[#77726a]">
          {photos.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-[#f3ede2] px-2.5 py-1.5">
              <ImageIcon className="h-3 w-3 text-[#eb5e28]" /> {photos.length}
            </span>
          )}
          {videos.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-[#f3ede2] px-2.5 py-1.5">
              <Film className="h-3 w-3 text-[#eb5e28]" /> {videos.length}
            </span>
          )}
          <span className="rounded-full bg-[#f3ede2] px-2.5 py-1.5">
            Mood {chapter.averageMood.toFixed(1)}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-[#f3ede2] px-2.5 py-1.5">
            <Flag className="h-3 w-3 text-[#eb5e28]" /> {chapter.milestoneCount}
          </span>
        </div>

        {chapter.keyTags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#252422]/10 pt-4">
            {chapter.keyTags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-[#eb5e28]/20 bg-[#eb5e28]/10 px-2.5 py-1 text-[10px] font-bold text-[#c9491c]">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#eb5e28]">
          Explore chapter
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.button>
  )
}