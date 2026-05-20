"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Week, WeekData, MOOD_LABELS, MOOD_TEXT_COLORS } from "@/typesDefined"
import { useLifeStore } from "@/store/useCapsuleStore"
import MediaUploader from "./mediaUploader"
import { TagInput } from './TagComponents/TagInput'
import toast from 'react-hot-toast'


type Props = {
  week: Week | null
  onClose: () => void
  onSave: (data: WeekData) => void
  existingData?: WeekData
}

export default function WeekModal({ week, onClose, onSave, existingData }: Props) {
  const { getNote } = useLifeStore()
  const [tags, setTags] = useState<string[]>([])
  const [mood, setMood] = useState(0)
  const [editorKey, setEditorKey] = useState(0) // Force editor re-mount
  const [isSaving, setIsSaving] = useState(false)

  // Create editor with key to force remount when week changes
  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [StarterKit],
      content: existingData?.note || "",
      editorProps: {
        attributes: {
          class: "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[120px] text-zinc-300 leading-relaxed",
        },
      },
    },
    [editorKey] // Dependency array to force remake
  )

  // Reset state when week changes
  useEffect(() => {
    if (week) {
      // Get note from Zustand store
      const storedNote = getNote(week.index)
      
      // Reset mood
      setMood(storedNote?.mood || existingData?.mood || 0)
      
      // Load tags from Zustand store
      setTags(storedNote?.tags || existingData?.tags || [])
      
      // Force editor to remount with new content
      setEditorKey(prev => prev + 1)
      
      console.log(`📝 Opening week ${week.index + 1}`)
      console.log(`   Stored note: ${storedNote ? '✓' : '✗'}`)
      console.log(`   Tags from store: ${storedNote?.tags?.join(", ") || "none"}`)
      console.log(`   isFuture: ${week.isFuture}`)
    }
  }, [week?.index, existingData, getNote, week])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (week) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [week])

  async function handleSave() {
    if (!week) return
    
    setIsSaving(true)
    try {
      // Prepare week data
      const weekData: WeekData = {
        weekIndex: week.index,
        date: week.date,
        isPast: week.isPast,
        isCurrent: week.isCurrent,
        note: editor?.getHTML() || "",
        mood,
        tags,
      }

      // Save to backend
      const response = await fetch('/api/weeks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weekData),
      })

      if (!response.ok) {
        throw new Error('Failed to save week')
      }

      // Call parent onSave with data including tags
      onSave(weekData)

      toast.success(`Week ${week.index + 1} saved with ${tags.length} tag${tags.length !== 1 ? 's' : ''}`)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save week')
    } finally {
      setIsSaving(false)
    }
  }

  const title = week?.isCurrent
    ? "This week"
    : week?.isPast
    ? "Memory"
    : "Dream"

  const placeholder = week?.isPast
    ? "What happened this week? What did you feel, learn, experience?"
    : "What do you dream of doing in this week of your life?"

  return (
    <AnimatePresence>
      {week && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          <motion.div
            key={`modal-${week.index}`} // Force remount of modal too
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] p-4 sm:p-6 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="text-zinc-500 text-xs uppercase tracking-widest">
                  {title}
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

            {/* Mood selector — only for past/current weeks */}
            {(week.isPast || week.isCurrent) && (
              <div className="mb-4">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                  Mood
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map(m => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`
                        w-8 h-8 rounded-full border text-xs font-medium transition-all
                        ${mood === m
                          ? "border-white bg-white text-black"
                          : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                        }
                      `}
                    >
                      {m}
                    </button>
                  ))}
                  {mood > 0 && (
                    <span className={`text-xs self-center ml-1 ${MOOD_TEXT_COLORS[mood]}`}>
                      {MOOD_LABELS[mood]}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tags Input */}
            <div className="mb-5 pb-5 border-b border-zinc-700">
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">
                Tags
              </p>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                placeholder="Add tags (e.g., #college #family)"
              />
            </div>

            {/* Editor — for all weeks (past, current, and future) */}
            <div className="mb-5">
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                {week.isPast || week.isCurrent ? "Memory" : "Dream"}
              </p>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 min-h-[120px]">
                {editor ? (
                  <EditorContent key={editorKey} editor={editor} />
                ) : (
                  <p className="text-zinc-600 text-sm">{placeholder}</p>
                )}
              </div>
            </div>

            {/* Media Uploader */}
            {(week.isPast || week.isCurrent || week.isFuture) && (
              <div className="mb-5 border-t border-zinc-800 pt-5">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">
                  {week.isPast || week.isCurrent ? "Memories & Voice Notes" : "Voice Notes & Dreams"}
                </p>
                <MediaUploader weekIndex={week.index} />
                {week.isFuture && (
                  <p className="text-zinc-600 text-xs mt-3 italic">
                    🎙️ Record your aspirations as voice notes for this future week
                  </p>
                )}
              </div>
            )}

            {/* Note for future weeks */}
            {week.isFuture && (
              <div className="mb-5 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <p className="text-blue-300 text-xs">
                  💡 Plan your dreams and record voice notes for this week. Add photos when it arrives.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 sticky bottom-0 bg-zinc-900 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 py-4 border-t border-zinc-800">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 border border-zinc-700 text-zinc-400 rounded-lg py-2.5 text-sm hover:border-zinc-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-white text-black rounded-lg py-2.5 text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    Save {week.isPast ? "memory" : "dream"} →
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
