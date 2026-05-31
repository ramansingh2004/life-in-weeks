"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/useAuthStore"
import { useMilestoneStore } from "@/store/useMilestoneStore"

type NavItem = {
  id: string
  label: string
  icon: string
  href: string
  action?: () => void
}

type Props = {
  onLogout?: () => void
}

export default function Sidebar({ onLogout }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { milestones } = useMilestoneStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  //const [theme, setTheme] = useState<"light" | "dark">("dark")

  // Prevent background scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  async function handleLogout() {
    try {
      setIsLoggingOut(true)
      await logout()
      onLogout?.()
      // Delay navigation slightly to ensure logout completes
      setTimeout(() => {
        router.push("/login")
      }, 100)
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
    }
  }

  const navItems: NavItem[] = [
    { id: "grid", label: "Grid", icon: "📊", href: "/grid" },
    { id: "milestones", label: `Milestones (${milestones.length})`, icon: "🎯", href: "/milestone" },
    { id: "stats", label: "Stats", icon: "📈", href: "/stats" },
    { id: "journal", label: "Journal", icon: "📝", href: "/journal" },
    { id: "timeline", label: "timeline", icon: "📜", href: "/timeline" },
    { id: "gallery", label: "Gallery", icon: "🖼️", href: "/gallery" },
    { id: "Life Chapters", label: "Life Chapters", icon: "🏡", href: "/life-chapters" },
    { id: "statsCards", label: "Stats Cards", icon: "📊", href: "/stats-cards" },
  ]

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-brand-orange hover:text-brand-orange transition-colors"
        title="Toggle sidebar"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-xl"
        >
          ☰
        </motion.div>
      </motion.button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: isOpen ? 0 : -300, opacity: isOpen ? 1 : 0 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 z-35 overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="p-6 pt-16 border-b border-zinc-800">
          <h1 className="text-xl font-light text-white mb-1">Life in Weeks</h1>
          <p className="text-zinc-500 text-xs">Your life visualized</p>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-4 border-b border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Signed in</p>
            <p className="text-white text-sm font-medium">{user.name}</p>
            <p className="text-zinc-500/60 text-xs mt-1">{user.email}</p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  router.push(item.href)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-brand-orange text-black font-semibold shadow-md shadow-brand-orange/10"
                    : "text-zinc-500 hover:bg-zinc-850 hover:text-white"
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="text-sm flex-1 text-left">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-zinc-800 mx-3" />

        {/* Settings Section */}
        <div className="px-3 py-4 space-y-2">

          {/* Logout */}
          <motion.button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isLoggingOut
                ? "text-zinc-600 bg-zinc-900/50 cursor-not-allowed"
                : "text-zinc-400 hover:bg-red-900/30 hover:text-red-400"
            }`}
            whileHover={isLoggingOut ? {} : { x: 4 }}
            whileTap={isLoggingOut ? {} : { scale: 0.95 }}
          >
            <span className="text-lg flex-shrink-0">
              {isLoggingOut ? "⏳" : "🚪"}
            </span>
            <span className="text-sm flex-1 text-left">
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </span>
          </motion.button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs text-center">
            Made with <span className="text-red-400">♥</span> for your life
          </p>
        </div>
      </motion.div>

      {/* Sidebar open indicator (small dot) */}
      {isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fixed bottom-4 left-4 w-2 h-2 rounded-full bg-brand-orange z-40"
        />
      )}
    </>
  )
}