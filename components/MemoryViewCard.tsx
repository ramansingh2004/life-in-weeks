"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Week, WeekData } from "@/typesDefined"
import { MOOD_LABELS, MOOD_COLORS } from "@/typesDefined"
import Image from "next/image"

type MediaItem = {
  _id: string
  type: "image" | "video" | "audio"
  url: string
  name: string
}

type Props = {
  week: Week | null
  data: WeekData | undefined
  onClose: () => void
  onEdit: () => void
}

export default function MemoryViewCard({ week, data, onClose, onEdit }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [preview, setPreview] = useState<MediaItem | null>(null)

  // Load media when card opens
  useEffect(() => {
    async function loadMedia() {
      if (!week) return
      try {
        const res = await fetch(`/api/media?weekIndex=${week.index}`)
        if (res.ok) {
          const { media: fetchedMedia } = await res.json()
          setMedia(fetchedMedia || [])
          console.log(`📸 Loaded ${fetchedMedia?.length || 0} media items for week ${week.index}`)
        }
      } catch (err) {
        console.error("Failed to load media:", err)
      }
    }
    if (week) {
      loadMedia()
    }
  }, [week?.index, week])

  // background scroll stop
  useEffect(() => {
    if (week) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [week])

  if (!week || !data) return null

  const moodColor = data.mood ? MOOD_COLORS[data.mood] : null
  const moodLabel = data.mood ? MOOD_LABELS[data.mood] : null
  const hasContent = data.note && data.note.trim() !== "<p></p>"

  const images = media.filter((m) => m.type === "image")
  const videos = media.filter((m) => m.type === "video")
  const audios = media.filter((m) => m.type === "audio")

  return (
    <AnimatePresence>
      {week && data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] p-6 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="text-zinc-500 text-xs uppercase tracking-widest">
                  {week.isCurrent ? "This week" : week.isPast ? "Memory" : "Dream"}
                </span>
                <h2 className="text-white text-lg font-light mt-1">
                  Week {week.index + 1}
                </h2>
                <p className="text-zinc-600 text-xs mt-0.5">{week.date}</p>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-600 hover:text-zinc-400 text-xl leading-none transition-colors flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* Mood Badge */}
            {data.mood > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${moodColor} text-white`}>
                  {moodLabel}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(m => (
                    <div
                      key={m}
                      className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center ${
                        m === data.mood
                          ? `${moodColor} border-white text-white`
                          : "border-zinc-700 text-zinc-600"
                      }`}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {hasContent ? (
              <div className="mb-6">
                <div className="bg-zinc-800/30 border border-zinc-800 rounded-lg px-4 py-3">
                  <div
                    className="prose prose-invert prose-sm max-w-none text-zinc-300"
                    dangerouslySetInnerHTML={{ __html: data.note }}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-zinc-800/20 border border-zinc-800 rounded-lg">
                <p className="text-zinc-500 text-sm italic">No entry yet</p>
              </div>
            )}

            {/* Photos */}
            {images.length > 0 && (
              <div className="mb-6">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                  Photos ({images.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((item) => (
                    <motion.div
                      key={item._id}
                      layoutId={item._id}
                      onClick={() => setPreview(item)}
                      className="relative group aspect-square cursor-pointer"
                    >
                      <Image
                        src={item.url}
                        alt={item.name}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white text-2xl">🔍</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="mb-6">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                  Videos ({videos.length})
                </p>
                <div className="space-y-2">
                  {videos.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative group"
                    >
                      <video
                        src={item.url}
                        controls
                        className="w-full rounded-lg max-h-48 bg-zinc-900"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio */}
            {audios.length > 0 && (
              <div className="mb-6">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                  Voice Notes ({audios.length})
                </p>
                <div className="space-y-2">
                  {audios.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-3 py-2 hover:bg-zinc-800/70 transition-colors"
                    >
                      <span className="text-lg flex-shrink-0">🎙️</span>
                      <audio src={item.url} controls className="flex-1 h-8" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Preview Modal */}
            <AnimatePresence>
              {preview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setPreview(null)}
                  className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
                >
                  <motion.img
                    layoutId={preview._id}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    src={preview.url}
                    alt={preview.name}
                    className="max-w-full max-h-full rounded-xl object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={() => setPreview(null)}
                    className="absolute top-4 right-4 text-white text-3xl hover:text-zinc-400 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3 sticky bottom-0 bg-zinc-900 -mx-6 -mb-6 px-6 py-4 border-t border-zinc-800">
              <button
                onClick={onClose}
                className="flex-1 border border-zinc-700 text-zinc-400 rounded-lg py-2.5 text-sm hover:border-zinc-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onEdit}
                className="flex-1 bg-white text-black rounded-lg py-2.5 text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                ✏️ Edit →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
