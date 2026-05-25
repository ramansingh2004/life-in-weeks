import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Milestone {
  _id: string
  userId: string
  weekIndex: number
  title: string
  description: string
  category: "career" | "education" | "health" | "family" | "travel" | "personal" | "other"
  icon: string
  date: string
  createdAt: Date
  updatedAt: Date
}

interface MilestoneStore {
  milestones: Milestone[]
  setMilestones: (milestones: Milestone[]) => void
  addMilestone: (milestone: Milestone) => void
  removeMilestone: (milestoneId: string) => void
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => void
  getMilestone: (weekIndex: number) => Milestone | undefined
  hasMilestone: (weekIndex: number) => boolean
  syncFromBackend: () => Promise<void>
}

export const useMilestoneStore = create<MilestoneStore>()(
  persist(
    (set, get) => ({
      milestones: [],

      setMilestones: (milestones) => set({ milestones }),

      addMilestone: (milestone) =>
        set((state) => ({
          milestones: [...state.milestones, milestone],
        })),

      removeMilestone: (milestoneId) =>
        set((state) => ({
          milestones: state.milestones.filter((m) => m._id !== milestoneId),
        })),

      updateMilestone: (milestoneId, updates) =>
        set((state) => ({
          milestones: state.milestones.map((m) =>
            m._id === milestoneId ? { ...m, ...updates } : m
          ),
        })),

      getMilestone: (weekIndex) =>
        get().milestones.find((m) => m.weekIndex === weekIndex),

      hasMilestone: (weekIndex) =>
        get().milestones.some((m) => m.weekIndex === weekIndex),

      syncFromBackend: async () => {
        try {
          const res = await fetch("/api/milestones")
          if (!res.ok) return
          const json = await res.json()
          const milestones = json.data?.milestones || []
          set({ milestones })
        } catch (err) {
          console.error("Failed to sync milestones:", err)
        }
      },
    }),
    { name: "milestone-store" }
  )
)