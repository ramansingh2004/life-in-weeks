import { create } from "zustand"
import { persist } from "zustand/middleware"
import { LifeStore } from "@/typesDefined"

export const useLifeStore = create<LifeStore>()(
  persist(
    (set, get) => ({
      birthDates: "",
      lifeExpectancy: 80,
      notes: {},

      setBirthDate: (date) => set({ birthDates: date }),

      setLifeExpectancy: (years) => set({ lifeExpectancy: years }),

      saveNote: (data) =>
        set(state => ({
          notes: { ...state.notes, [data.weekIndex]: data }
        })),

      getNote: (weekIndex) => get().notes[weekIndex],

      hasNote: (weekIndex) => !!get().notes[weekIndex]?.note,

      reset: () => set({ birthDates: "", lifeExpectancy: 80, notes: {} }),
    }),
    {
      name: "life-in-weeks", // localStorage key
    }
  )
)