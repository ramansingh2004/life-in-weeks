import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LifeStore, WeekData } from '@/typesDefined'
import { saveWeek, getAllWeeks } from '@/lib/api'

/**
 * ✅ UPDATED: useLifeStore now works WITH React Query, not against it
 * 
 * Role: Manages LOCAL UI state + optimistic updates
 * React Query: Manages SERVER state + caching
 * 
 * Pattern:
 * - Save optimistically to Zustand (instant UI update)
 * - Save to backend via React Query mutation in background
 * - If mutation succeeds, React Query updates its cache
 * - If mutation fails, Zustand can rollback or notify user
 */

type ExtendedLifeStore = LifeStore & { syncError: string | null }

export const useLifeStore = create<ExtendedLifeStore>()(
  persist(
    (set, get) => ({
      birthDate: '',
      lifeExpectancy: 80,
      notes: {}, // Local cache of notes
      isSynced: false,
      syncError: null, // Track sync errors

      setBirthDate: (date) => set({ birthDate: date }),
      setLifeExpectancy: (years) => set({ lifeExpectancy: years }),

      /**
       * ✅ saveNote: Optimistic update pattern
       * 1. Update Zustand immediately (instant UI feedback)
       * 2. Call API in background (via mutation in component)
       * 3. React Query handles caching/retry/errors
       */
      saveNote: async (data) => {
        // 1. Update Zustand instantly (optimistic)
        set((state) => ({
          notes: { ...state.notes, [data.weekIndex]: data },
        }))

        // 2. Save to MongoDB in background
        try {
          await saveWeek(data)
          set({ syncError: null })
        } catch (err) {
          console.error('Failed to sync week to backend:', err)
          // Store error but UI already updated (optimistic)
          set({
            syncError: `Failed to save week ${data.weekIndex}`,
          })
          throw err // Re-throw so component can handle
        }
      },

      getNote: (weekIndex) => get().notes[weekIndex],
      hasNote: (weekIndex) => !!get().notes[weekIndex]?.note,

      /**
       * ✅ syncFromBackend: Pull all weeks from backend
       * Called once on app load or when user navigates to grid
       * React Query handles caching, so this is less critical now
       */
      syncFromBackend: async () => {
        try {
          const { weeks } = await getAllWeeks()
          const notesMap: Record<number, WeekData> = {}
          weeks.forEach((w: WeekData & { weekIndex: number }) => {
            notesMap[w.weekIndex] = w
          })
          set({ notes: notesMap, isSynced: true, syncError: null })
        } catch (err) {
          console.error('Failed to sync from backend:', err)
          set({
            syncError: 'Failed to load weeks from backend',
            isSynced: false,
          })
          throw err
        }
      },

      /**
       * ✅ updateNoteOptimistic: Optimistic update for inline edits
       * Used when user edits a note inline (e.g., typing in grid)
       */
      updateNoteOptimistic: (weekIndex: number, partial: Partial<WeekData>) => {
        set((state) => {
          const existing = state.notes[weekIndex] || { weekIndex } as WeekData
          return {
            notes: {
              ...state.notes,
              [weekIndex]: { ...existing, ...partial },
            },
          }
        })
      },

      /**
       * ✅ clearNote: Remove a note from local state
       */
      clearNote: (weekIndex: number) => {
        set((state) => {
          const { [weekIndex]: _, ...remaining } = state.notes
          return { notes: remaining }
        })
      },

      /**
       * ✅ reset: Clear everything (on logout)
       */
      reset: () =>
        set({
          birthDate: '',
          lifeExpectancy: 80,
          notes: {},
          isSynced: false,
          syncError: null,
        }),
    }),
    { name: 'life-in-weeks' }
  )
)