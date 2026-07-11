'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  CalendarDays,
  Film,
  Flag,
  ImageIcon,
  Sparkles,
  X,
} from 'lucide-react'
import { Chapter } from '@/typesDefined'

interface Milestone {
  icon: string
  title: string
  description: string
  weekIndex: number
  category: string
}

interface Note {
  weekIndex: number
  note: string
}

interface ChapterDetailModalProps {
  chapter: Chapter | null
  onClose: () => void
  photos: string[]
  videos: string[]
  milestones: Milestone[]
  notes: Note[]
}

type Tab = 'overview' | 'photos' | 'videos' | 'timeline'

const tabs: Array<{ id: Tab; label: string; icon: typeof BookOpen }> = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'photos', label: 'Photos', icon: ImageIcon },
  { id: 'videos', label: 'Videos', icon: Film },
  { id: 'timeline', label: 'Timeline', icon: CalendarDays },
]

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function ChapterDetailModal({
  chapter,
  onClose,
  photos,
  videos,
  milestones,
  notes,
}: ChapterDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (selectedPhoto) setSelectedPhoto(null)
        else onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, selectedPhoto])

  if (!chapter) return null

  const weekCount = chapter.endWeek - chapter.startWeek + 1
  const moments = [
    ...milestones.map((milestone) => ({
      id: `milestone-${milestone.weekIndex}-${milestone.title}`,
      weekIndex: milestone.weekIndex,
      type: 'milestone' as const,
      title: milestone.title,
      description: milestone.description,
      icon: milestone.icon || '🏆',
    })),
    ...notes.map((note) => ({
      id: `note-${note.weekIndex}`,
      weekIndex: note.weekIndex,
      type: 'note' as const,
      title: `Week ${note.weekIndex + 1}`,
      description: stripHtml(note.note),
      icon: '✦',
    })),
  ].sort((a, b) => a.weekIndex - b.weekIndex)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#252422]/75 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#252422]/10 bg-[#fffaf0] text-[#252422] shadow-[0_30px_100px_rgba(37,36,34,0.35)]"
      >
        <header className="relative overflow-hidden border-b border-[#252422]/10 bg-[#f7ead7] px-5 pb-5 pt-6 sm:px-8 sm:pb-7 sm:pt-8">
          <div className="pointer-events-none absolute -right-14 -top-20 h-48 w-48 rounded-full bg-[#f0c955]/45 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-[#87b9ad]/30 blur-2xl" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close chapter"
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-[#252422]/10 bg-[#fffaf0]/80 text-[#252422]/65 transition hover:border-[#eb5e28]/30 hover:bg-white hover:text-[#eb5e28] sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative max-w-3xl pr-12">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#252422] text-2xl shadow-lg shadow-[#252422]/15">
                {chapter.emoji}
              </span>
              <span className="rounded-full border border-[#eb5e28]/20 bg-[#eb5e28]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#c74718]">
                Life chapter
              </span>
            </div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-5xl">
              {chapter.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#252422]/60 sm:text-base">
              Weeks {chapter.startWeek + 1}–{chapter.endWeek + 1} · {weekCount} weeks in this part of your story
            </p>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-[#252422]/10 bg-[#fffaf0] px-3 py-3 sm:px-6" aria-label="Chapter sections">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const count = tab.id === 'photos' ? photos.length : tab.id === 'videos' ? videos.length : undefined
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  activeTab === tab.id
                    ? 'bg-[#252422] text-[#fffaf0] shadow-md'
                    : 'text-[#252422]/55 hover:bg-[#252422]/5 hover:text-[#252422]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {count !== undefined && (
                  <span className={activeTab === tab.id ? 'text-[#f0c955]' : 'text-[#eb5e28]'}>{count}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="max-w-3xl text-base leading-8 text-[#252422]/70 sm:text-lg">
                  {chapter.description}
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { label: 'Weeks', value: weekCount, color: 'bg-[#f0c955]/35' },
                    { label: 'Average mood', value: `${chapter.averageMood.toFixed(1)}/5`, color: 'bg-[#87b9ad]/35' },
                    { label: 'Photos', value: photos.length, color: 'bg-[#eb5e28]/12' },
                    { label: 'Milestones', value: milestones.length, color: 'bg-white' },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-2xl border border-[#252422]/10 p-4 ${stat.color}`}>
                      <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                      <p className="mt-1 text-xs font-medium text-[#252422]/50">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {chapter.keyTags.length > 0 && (
                  <div className="mt-8">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#252422]/40">Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {chapter.keyTags.map((tag) => (
                        <span key={tag} className="rounded-full border border-[#eb5e28]/20 bg-[#eb5e28]/8 px-3 py-1.5 text-xs font-semibold text-[#c74718]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(milestones.length > 0 || notes.length > 0) && (
                  <div className="mt-8 rounded-3xl border border-[#252422]/10 bg-white/70 p-5 sm:p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#eb5e28]" />
                      <h3 className="font-serif text-xl font-semibold">Key moments</h3>
                    </div>
                    <div className="space-y-4">
                      {moments.slice(0, 4).map((moment) => (
                        <div key={moment.id} className="flex gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f7ead7] text-sm">{moment.icon}</span>
                          <div>
                            <p className="text-sm font-semibold">{moment.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#252422]/55">{moment.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'photos' && (
              <motion.div key="photos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photos.map((photo, index) => (
                      <button
                        key={`${photo}-${index}`}
                        type="button"
                        onClick={() => setSelectedPhoto(photo)}
                        className="group relative aspect-square overflow-hidden rounded-2xl bg-[#f7ead7]"
                      >
                        <Image src={photo} alt={`${chapter.title} memory ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                        <span className="absolute inset-0 bg-[#252422]/0 transition group-hover:bg-[#252422]/10" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<ImageIcon className="h-7 w-7" />} title="No photos in this chapter" description="Photos added to these weeks will appear here." />
                )}
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div key="videos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {videos.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {videos.map((video, index) => (
                      <div key={`${video}-${index}`} className="overflow-hidden rounded-2xl border border-[#252422]/10 bg-[#252422]">
                        <video src={video} controls preload="metadata" className="aspect-video w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Film className="h-7 w-7" />} title="No videos in this chapter" description="Videos attached to these weeks will appear here." />
                )}
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div key="timeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {moments.length > 0 ? (
                  <div className="relative ml-4 space-y-6 border-l border-[#eb5e28]/25 pl-7 sm:ml-5 sm:pl-9">
                    {moments.map((moment) => (
                      <article key={moment.id} className="relative rounded-2xl border border-[#252422]/10 bg-white/70 p-5">
                        <span className="absolute -left-[2.55rem] top-5 grid h-6 w-6 place-items-center rounded-full border-4 border-[#fffaf0] bg-[#eb5e28] sm:-left-[3.35rem]">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {moment.type === 'milestone' ? <Flag className="h-4 w-4 text-[#eb5e28]" /> : <BookOpen className="h-4 w-4 text-[#87b9ad]" />}
                            <h3 className="font-semibold">{moment.title}</h3>
                          </div>
                          <span className="text-xs font-medium text-[#252422]/40">Week {moment.weekIndex + 1}</span>
                        </div>
                        <p className="text-sm leading-6 text-[#252422]/60">{moment.description}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<CalendarDays className="h-7 w-7" />} title="This timeline is waiting for moments" description="Journal entries and milestones from this chapter will appear here." />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#252422]/95 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button type="button" aria-label="Close photo" onClick={() => setSelectedPhoto(null)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className="relative h-[82vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
              <Image src={selectedPhoto} alt="Selected chapter memory" fill sizes="100vw" className="object-contain" priority />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-[#252422]/15 bg-white/45 px-6 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#f7ead7] text-[#eb5e28]">{icon}</span>
      <h3 className="font-serif text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#252422]/50">{description}</p>
    </div>
  )
}