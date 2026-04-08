"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Week, WeekData, MOOD_LABELS, MOOD_TEXT_COLORS } from "@/typesDefined"

type Props = {
  week: Week | null
  onClose: () => void
  onSave: (data: WeekData) => void
  existingData?: WeekData
}

export default function WeekModal({ week, onClose, onSave, existingData }: Props) {
  const [mood, setMood] = useState(existingData?.mood || 0)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: existingData?.note || "",
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[120px] text-zinc-300 leading-relaxed",
      },
    },
  })

  useEffect(() => {
    if (existingData && editor) {
      editor.commands.setContent(existingData.note || "")
      setMood(existingData.mood || 0)
    }
  }, [existingData, editor])

  if (!week) return null

  function handleSave() {
    if (!week) return
    onSave({
      weekIndex: week.index,
      date: week.date,
      isPast: week.isPast,
      isCurrent: week.isCurrent,
      note: editor?.getHTML() || "",
      mood,
    })
    onClose()
  }

  const isWritable = week.isPast || week.isCurrent
  const title = week.isCurrent
    ? "This week"
    : week.isPast
    ? "Memory"
    : "Dream"

  const placeholder = week.isPast
    ? "What happened this week? What did you feel, learn, experience?"
    : "What do you dream of doing in this week of your life?"

  return (
    <AnimatePresence>
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
          className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6"
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
              className="text-zinc-600 hover:text-zinc-400 text-xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          {/* Mood selector — only for past/current */}
          {isWritable && (
            <div className="mb-4">
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                Mood
              </p>
              <div className="flex gap-2">
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

          {/* Editor */}
          <div className="mb-5">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
              {week.isPast || week.isCurrent ? "Memory" : "Dream"}
            </p>
            {isWritable || !week.isPast ? (
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 min-h-[120px]">
                {editor ? (
                  <EditorContent editor={editor} />
                ) : (
                  <p className="text-zinc-600 text-sm">{placeholder}</p>
                )}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm italic">{placeholder}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-zinc-700 text-zinc-400 rounded-lg py-2.5 text-sm hover:border-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-white text-black rounded-lg py-2.5 text-sm font-medium hover:bg-zinc-100 transition-colors"
            >
              Save {week.isPast ? "memory" : "dream"} →
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}