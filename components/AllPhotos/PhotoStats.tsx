'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

type PhotoItem = {
  _id: string
  weekIndex: number
  url: string
  name: string
  createdAt: Date
  weekDate?: string
}

interface PhotoStatsProps {
  photos: PhotoItem[]
}

export function PhotoStats({ photos }: PhotoStatsProps) {
  const stats = useMemo(() => {
    const totalPhotos = photos.length
    const oldestPhoto = photos[photos.length - 1]?.createdAt
    const newestPhoto = photos[0]?.createdAt
    
    // Most active week
    const weeksCount = new Map<number, number>()
    photos.forEach(p => {
      weeksCount.set(p.weekIndex, (weeksCount.get(p.weekIndex) || 0) + 1)
    })
    const mostActiveWeek = Array.from(weeksCount.entries()).sort((a, b) => b[1] - a[1])[0]

    return {
      totalPhotos,
      oldestPhoto,
      newestPhoto,
      mostActiveWeek,
    }
  }, [photos])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Total Photos */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
      >
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Photos</p>
        <p className="text-2xl font-light text-white">{stats.totalPhotos}</p>
        <p className="text-xs text-zinc-600 mt-1">in your gallery</p>
      </motion.div>

      {/* Oldest Photo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
      >
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Oldest</p>
        <p className="text-sm font-light text-white">
          {stats.oldestPhoto?.toLocaleDateString()}
        </p>
        <p className="text-xs text-zinc-600 mt-1">first photo</p>
      </motion.div>

      {/* Newest Photo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
      >
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Newest</p>
        <p className="text-sm font-light text-white">
          {stats.newestPhoto?.toLocaleDateString()}
        </p>
        <p className="text-xs text-zinc-600 mt-1">last photo</p>
      </motion.div>

      {/* Most Active Week */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
      >
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Most Active</p>
        <p className="text-2xl font-light text-white">
          {stats.mostActiveWeek ? stats.mostActiveWeek[1] : 0}
        </p>
        <p className="text-xs text-zinc-600 mt-1">
          week {stats.mostActiveWeek ? stats.mostActiveWeek[0] + 1 : 'N/A'}
        </p>
      </motion.div>
    </div>
  )
}