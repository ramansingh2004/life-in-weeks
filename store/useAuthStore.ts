import { create } from "zustand"
import { persist } from "zustand/middleware"
import {User, AuthStore} from '@/typesDefined'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" })
        set({ user: null })
      },
    }),
    { name: "auth-store" }
  )
)