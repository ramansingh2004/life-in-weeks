import { create } from "zustand"
import { persist } from "zustand/middleware"
import { LifeStore, WeekData } from "@/typesDefined"
import { saveWeek, getAllWeeks } from "@/lib/api"

export const useLifeStore = create<LifeStore>()(
  persist(
    (set, get) => ({
      birthDate: "",
      lifeExpectancy: 80,
      notes: {},
      isSynced: false,

      setBirthDate: (date) => set({ birthDate: date }),
      setLifeExpectancy: (years) => set({ lifeExpectancy: years }),

      saveNote: async (data) => {
        // 1. Update Zustand instantly (optimistic)
        set(state => ({
          notes: { ...state.notes, [data.weekIndex]: data }
        }))

        // 2. Save to MongoDB in background
        try {
          await saveWeek(data)
        } catch (err) {
          console.error("Failed to sync week to backend:", err)
        }
      },

      getNote: (weekIndex) => get().notes[weekIndex],
      hasNote: (weekIndex) => !!get().notes[weekIndex]?.note,

      // Pull all weeks from MongoDB into Zustand
      syncFromBackend: async () => {
        try {
          const { weeks } = await getAllWeeks()
          const notesMap: Record<number, WeekData> = {}
          weeks.forEach((w: WeekData & { weekIndex: number }) => {
            notesMap[w.weekIndex] = w
          })
          set({ notes: notesMap, isSynced: true })
        } catch (err) {
          console.error("Failed to sync from backend:", err)
        }
      },

      reset: () => set({ birthDate: "", lifeExpectancy: 80, notes: {}, isSynced: false }),
    }),
    { name: "life-in-weeks" }
  )
)