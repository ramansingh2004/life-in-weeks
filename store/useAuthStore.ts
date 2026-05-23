import { create } from "zustand"
import { persist } from "zustand/middleware"
import { AuthStore } from '@/typesDefined'
import { signOut } from "next-auth/react"

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        try {
          // Clear NextAuth session
          await signOut({ redirect: false })

          const response = await fetch("/api/auth/logout", { method: "POST" })
          if (!response.ok) {
            console.error("Logout API failed:", response.status)
          }
        } catch (error) {
          console.error("Logout API error:", error)
        } finally {
          // Clear user state regardless of API response
          set({ user: null })
        }
      },
    }),
    { name: "auth-store" }
  )
)