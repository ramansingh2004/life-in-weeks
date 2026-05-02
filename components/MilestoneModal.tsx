"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Milestone, useMilestoneStore } from "@/store/useMilestoneStore"

const CATEGORIES = [
  { id: "career", label: "Career", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "health", label: "Health", icon: "💪" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "personal", label: "Personal", icon: "✨" },
  { id: "other", label: "Other", icon: "📌" },
]

type Props = {
  isOpen: boolean
  onClose: () => void
  weekIndex: number
  date: string
  existingMilestone?: Milestone
}

export default function MilestoneModal({
  isOpen,
  onClose,
  weekIndex,
  date,
  existingMilestone,
}: Props) {
  const { addMilestone, updateMilestone, removeMilestone } = useMilestoneStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>("personal")
  const [icon, setIcon] = useState("✦")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (existingMilestone) {
        setTitle(existingMilestone.title)
        setDescription(existingMilestone.description)
        setCategory(existingMilestone.category)
        setIcon(existingMilestone.icon)
      } else {
        setTitle("")
        setDescription("")
        setCategory("personal")
        setIcon("✦")
      }
      setError("")
    }
  }, [existingMilestone, isOpen])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      if (existingMilestone) {
        // Update milestone
        const res = await fetch("/api/milestones", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            milestoneId: existingMilestone._id,
            title,
            description,
            category,
            icon,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || "Failed to update milestone")
          setLoading(false)
          return
        }

        const { milestone } = await res.json()
        updateMilestone(existingMilestone._id, milestone)
        console.log("✅ Milestone updated:", milestone._id)
      } else {
        // Create new milestone
        const res = await fetch("/api/milestones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weekIndex,
            title,
            description,
            category,
            icon,
            date,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          console.error("API error:", data)
          setError(data.error || "Failed to create milestone")
          setLoading(false)
          return
        }

        const { milestone } = await res.json()
        addMilestone(milestone)
        console.log("✅ Milestone created:", milestone._id)
      }

      setLoading(false)
      onClose()
    } catch (err) {
      console.error("Error:", err)
      setError("Something went wrong")
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!existingMilestone) return
    if (!confirm("Delete this milestone?")) return

    try {
      const res = await fetch("/api/milestones", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId: existingMilestone._id }),
      })

      if (!res.ok) throw new Error("Failed to delete")

      removeMilestone(existingMilestone._id)
      console.log("✅ Milestone deleted")
      onClose()
    } catch (err) {
      console.error("failed to delete milestone:", err)
      setError("Failed to delete milestone")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-zinc-500 text-xs uppercase tracking-widest">
                  🎯 Milestone
                </span>
                <h2 className="text-white text-lg font-light mt-1">Week {weekIndex + 1}</h2>
                <p className="text-zinc-600 text-xs mt-0.5">{date}</p>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-600 hover:text-zinc-400 text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="text-zinc-500 text-xs uppercase tracking-widest block mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setError("")
                }}
                placeholder="e.g., Got my first job"
                className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
                maxLength={50}
                disabled={loading}
              />
              <p className="text-zinc-700 text-xs mt-1">{title.length}/50</p>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-zinc-500 text-xs uppercase tracking-widest block mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors resize-none"
                rows={2}
                maxLength={200}
                disabled={loading}
              />
              <p className="text-zinc-700 text-xs mt-1">{description.length}/200</p>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="text-zinc-500 text-xs uppercase tracking-widest block mb-2">
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id)
                      setIcon(cat.icon)
                    }}
                    disabled={loading}
                    className={`p-2 rounded-lg border text-xs transition-all text-center ${
                      category === cat.id
                        ? "border-white bg-zinc-700"
                        : "border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-lg block">{cat.icon}</span>
                  </button>
                ))}
              </div>
              <p className="text-zinc-600 text-xs mt-1">
                {CATEGORIES.find((c) => c.id === category)?.label}
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-900/30 border border-red-700/50 text-red-400 text-xs rounded-lg px-3 py-2 mb-4"
              >
                {error}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 border border-zinc-700 text-zinc-400 rounded-lg py-2.5 text-sm hover:border-zinc-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !title.trim()}
                className="flex-1 bg-white text-black rounded-lg py-2.5 text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : existingMilestone ? "Update" : "Create"}
              </button>
              {existingMilestone && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-3 border border-zinc-700 text-red-400 rounded-lg hover:border-red-600 transition-colors disabled:opacity-50"
                >
                  🗑️
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
