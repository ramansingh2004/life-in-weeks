"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useMilestoneStore, Milestone } from "@/store/useMilestoneStore"
import MilestoneModal from "@/components/MilestoneModal"
import Sidebar from "@/components/Sidebar"
import { CATEGORY_COLORS } from "@/typesDefined"
import {MilestonesSkeleton} from "@/components/MilestonesSkeleton"

export default function MilestonesPage() {
  const router = useRouter()
  //const { user } = useAuthStore()
  const { milestones, syncFromBackend } = useMilestoneStore()
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    async function init() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()

        if (!res.ok || !data?.data?.user) {
          router.push("/login")
          return
        }

        await syncFromBackend()
        setLoading(false)
      } catch (err) {
        console.error("Init error:", err)
        router.push("/login")
      }
    }

    init()
  }, [hydrated, syncFromBackend, router])

  const sorted = [...milestones].sort((a, b) => a.weekIndex - b.weekIndex)
  const filtered = filter ? sorted.filter((m) => m.category === filter) : sorted

  const categories = Array.from(new Set(milestones.map((m) => m.category)))

  if (!hydrated || loading) {
    return <MilestonesSkeleton />
  }

  return (
    <main className="min-h-screen bg-black text-white pt-14 sm:pt-10 px-4 py-10">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-tight mb-2">Your Milestones</h1>
            <p className="text-zinc-600 text-xs">
              {filtered.length} milestone{filtered.length !== 1 ? "s" : ""} · Timeline view
            </p>
          </div>
          <button
            onClick={() => router.push("/grid")}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
          >
            ← Back to grid
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-3xl mx-auto mb-8 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
            filter === null
              ? "border-white bg-white text-black"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const colors = CATEGORY_COLORS[cat]
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                filter === cat
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <span>{colors.icon}</span>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="max-w-3xl mx-auto text-center py-12">
          <p className="text-zinc-600 text-sm mb-4">
            No milestones yet. Click a week on the grid to add one!
          </p>
          <button
            onClick={() => router.push("/grid")}
            className="border border-zinc-700 text-zinc-400 rounded-lg px-4 py-2.5 text-xs hover:border-zinc-600 transition-colors"
          >
            Go to grid →
          </button>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {filtered.map((milestone, idx) => {
              const colors = CATEGORY_COLORS[milestone.category]
              return (
                <motion.div
                  key={milestone._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedMilestone(milestone)
                    setModalOpen(true)
                  }}
                  className={`${colors.bg} border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-700 transition-colors group`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{milestone.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                        <h3 className="text-white font-medium">{milestone.title}</h3>
                        <span className={`text-xs ${colors.text}`}>
                          Week {milestone.weekIndex + 1}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-zinc-400 text-sm mb-2">{milestone.description}</p>
                      )}
                      <p className="text-zinc-600 text-xs">{milestone.date}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {selectedMilestone && (
        <MilestoneModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedMilestone(null)
          }}
          weekIndex={selectedMilestone.weekIndex}
          date={selectedMilestone.date}
          existingMilestone={selectedMilestone}
        />
      )}
    </main>
  )
}