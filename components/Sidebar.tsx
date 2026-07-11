'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useMilestoneStore } from '@/store/useMilestoneStore'

type NavItem = {
  id: string
  label: string
  icon: string
  href: string
}

type Props = {
  onLogout?: () => void
  onOpenChange?: (isOpen: boolean) => void
}

export default function Sidebar({ onLogout, onOpenChange }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { milestones } = useMilestoneStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    onOpenChange?.(isOpen)

    document.body.style.overflow = isOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, onOpenChange])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  async function handleLogout() {
    try {
      setIsLoggingOut(true)
      await logout()
      onLogout?.()
      setTimeout(() => router.push('/login'), 100)
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  const navItems: NavItem[] = [
    { id: 'grid', label: 'Grid', icon: '▦', href: '/grid' },
    { id: 'milestones', label: `Milestones (${milestones.length})`, icon: '◆', href: '/milestone' },
    { id: 'stats', label: 'Stats', icon: '↗', href: '/stats' },
    { id: 'journal', label: 'Journal', icon: '✎', href: '/journal' },
    { id: 'timeline', label: 'Timeline', icon: '⌁', href: '/timeline' },
    { id: 'gallery', label: 'Gallery', icon: '▧', href: '/gallery' },
    { id: 'life-chapters', label: 'Life Chapters', icon: '◇', href: '/life-chapters' },
    { id: 'stats-cards', label: 'Stats Cards', icon: '◫', href: '/stats-cards' },
  ]

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsOpen((open) => !open)}
        className="fixed left-4 top-4 z-40 grid h-11 w-11 place-items-center rounded-2xl border border-[#252422]/10 bg-[#fffaf0]/95 text-[#252422] shadow-lg backdrop-blur-md transition-colors hover:border-[#eb5e28]/50 hover:text-[#eb5e28]"
        title={isOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isOpen}
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-lg leading-none"
          aria-hidden="true"
        >
          {isOpen ? '×' : '☰'}
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            aria-label="Close sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-[#252422]/35 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280, opacity: isOpen ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed left-0 top-0 z-[35] flex h-[100svh] w-64 flex-col overflow-y-auto border-r border-white/10 bg-[#252422] text-[#fffaf0] shadow-2xl"
        aria-hidden={!isOpen}
      >
        <div className="border-b border-white/10 px-6 pb-5 pt-20">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid grid-cols-4 gap-1" aria-hidden="true">
              {Array.from({ length: 7 }, (_, index) => (
                <span key={index} className="h-1.5 w-1.5 rounded-[2px] bg-[#eb5e28]" />
              ))}
            </span>
            <h1 className="font-bold tracking-[-0.04em]">Life in Weeks</h1>
          </div>
          <p className="text-xs text-white/45">Your story, one week at a time.</p>
        </div>

        {user && (
          <div className="border-b border-white/10 px-6 py-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#eb5e28]">Signed in</p>
            <p className="mt-2 truncate text-sm font-semibold">{user.name}</p>
            <p className="mt-1 truncate text-xs text-white/40">{user.email}</p>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  router.push(item.href)
                  setIsOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-[#eb5e28] font-bold text-[#fffaf0] shadow-lg shadow-[#eb5e28]/10'
                    : 'text-white/55 hover:bg-white/[0.07] hover:text-white'
                }`}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="w-5 flex-shrink-0 text-center text-base" aria-hidden="true">{item.icon}</span>
                <span className="flex-1 text-sm">{item.label}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#f0c955]" />}
              </motion.button>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <motion.button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
              isLoggingOut
                ? 'cursor-not-allowed text-white/25'
                : 'text-white/55 hover:bg-red-500/10 hover:text-red-300'
            }`}
            whileHover={isLoggingOut ? {} : { x: 3 }}
            whileTap={isLoggingOut ? {} : { scale: 0.98 }}
          >
            <span aria-hidden="true">{isLoggingOut ? '◌' : '↪'}</span>
            <span className="text-sm">{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
          </motion.button>
        </div>

        <div className="border-t border-white/10 px-6 py-4 text-center text-[10px] text-white/30">
          Make time visible. Make it count.
        </div>
      </motion.aside>
    </>
  )
}