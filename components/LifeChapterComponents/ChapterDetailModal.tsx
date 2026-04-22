'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chapter } from '@/typesDefined'

interface ChapterDetailModalProps {
  chapter: Chapter | null
  onClose: () => void
  photos: string[]
  videos: string[]
  milestones: any[]
  notes: any[]
}

export function ChapterDetailModal({
  chapter,
  onClose,
  photos,
  videos,
  milestones,
  notes,
}: ChapterDetailModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'videos' | 'timeline'>('overview')

  if (!chapter) return null

  const weekCount = chapter.endWeek - chapter.startWeek + 1

  // Prevent background scroll when modal is open
    useEffect(() => {
      if (chapter) {
        document.body.style.overflow = "hidden"
        return () => {
          document.body.style.overflow = "unset"
        }
      }
    }, [chapter])
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-4xl mb-2">
              {chapter.emoji} {chapter.title}
            </h2>
            <p className="text-zinc-400">
              Weeks {chapter.startWeek + 1} - {chapter.endWeek + 1} ({weekCount} weeks)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-white transition-colors text-2xl flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="sticky top-20 bg-zinc-950 border-b border-zinc-800 px-6 flex gap-4">
          {[
            { id: 'overview', label: '📋 Overview', count: null },
            { id: 'photos', label: '📸 Photos', count: photos.length },
            { id: 'videos', label: '🎬 Videos', count: videos.length },
            { id: 'timeline', label: '📅 Timeline', count: milestones.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-4 border-b-2 transition-colors text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-white'
              }`}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Description */}
              <div>
                <h3 className="text-lg font-light text-white mb-3">Chapter Summary</h3>
                <p className="text-zinc-300 leading-relaxed">{chapter.description}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800 rounded p-4">
                  <p className="text-zinc-500 text-xs uppercase mb-2">Duration</p>
                  <p className="text-2xl font-light text-white">{weekCount}</p>
                  <p className="text-xs text-zinc-600 mt-1">weeks</p>
                </div>
                <div className="bg-zinc-800 rounded p-4">
                  <p className="text-zinc-500 text-xs uppercase mb-2">Avg Mood</p>
                  <p className="text-2xl font-light text-white">
                    {chapter.averageMood.toFixed(1)}/5
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">happiness</p>
                </div>
                <div className="bg-zinc-800 rounded p-4">
                  <p className="text-zinc-500 text-xs uppercase mb-2">Photos</p>
                  <p className="text-2xl font-light text-white">{photos.length}</p>
                  <p className="text-xs text-zinc-600 mt-1">moments captured</p>
                </div>
                <div className="bg-zinc-800 rounded p-4">
                  <p className="text-zinc-500 text-xs uppercase mb-2">Milestones</p>
                  <p className="text-2xl font-light text-white">{chapter.milestoneCount}</p>
                  <p className="text-xs text-zinc-600 mt-1">achievements</p>
                </div>
              </div>

              {/* Key Tags */}
              {chapter.keyTags.length > 0 && (
                <div>
                  <h3 className="text-lg font-light text-white mb-3">Key Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {chapter.keyTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-emerald-600/20 text-emerald-300 rounded-full text-sm border border-emerald-600/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Moments */}
              {notes.length > 0 && (
                <div>
                  <h3 className="text-lg font-light text-white mb-3">Key Moments</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notes.slice(0, 5).map((note: any, idx: number) => (
                      <div key={idx} className="bg-zinc-800 p-3 rounded">
                        <p className="text-xs text-zinc-500 mb-1">Week {note.weekIndex + 1}</p>
                        <p className="text-sm text-zinc-300 line-clamp-2">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedPhoto(photo)}
                      whileHover={{ scale: 1.05 }}
                      className="relative aspect-square rounded-lg overflow-hidden group bg-zinc-800"
                    >
                      <img
                        src={photo}
                        alt={`Chapter moment ${idx}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white text-3xl opacity-0 group-hover:opacity-100">
                          🔍
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-500">No photos in this chapter</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((video, idx) => (
                    <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
                      <video
                        src={video}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-500">No videos in this chapter</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-4 pb-4 border-b border-zinc-800 last:border-0"
                    >
                      <div className="text-2xl flex-shrink-0">{milestone.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{milestone.title}</h4>
                        <p className="text-sm text-zinc-400 mt-1">{milestone.description}</p>
                        <p className="text-xs text-zinc-600 mt-2">
                          Week {milestone.weekIndex + 1} • {milestone.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-500">No milestones in this chapter</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
            >
              <img
                src={selectedPhoto}
                alt="Full view"
                className="max-w-full max-h-full rounded-lg"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}