'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { differenceInWeeks, parseISO, format } from 'date-fns'
import { Search, X, ChevronRight } from 'lucide-react'
import { Week } from '@/typesDefined'

interface DateSearchProps {
  birthDate: string | null
  weeks: Week[]
  onWeekSelect: (week: Week) => void
  onHighlight: (weekIndex: number | null) => void
}

export default function DateSearch({
  birthDate,
  weeks,
  onWeekSelect,
  onHighlight,
}: DateSearchProps) {
  const [searchInput, setSearchInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [error, setError] = useState('')

  // ✅ SEARCH LOGIC: Find week by date
  const handleDateSearch = (dateString: string) => {
    if (!birthDate) {
      setError('Birth date not set')
      return
    }

    try {
      setError('')

      // Parse input date
      const searchDate = parseISO(dateString)
      const birthDateObj = parseISO(birthDate)

      // Calculate which week this date falls into
      const weeksFromBirth = differenceInWeeks(searchDate, birthDateObj)

      // Find matching week
      const matchedWeek = weeks.find((w) => w.index === weeksFromBirth)

      if (matchedWeek) {
        setSelectedWeek(matchedWeek)
        onWeekSelect(matchedWeek)
        onHighlight(matchedWeek.index)
        setIsOpen(false)

        // Auto-scroll after a short delay
        setTimeout(() => {
          const element = document.getElementById(`week-${matchedWeek.index}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      } else {
        setError('Week not found for this date')
      }
    } catch (err) {
        console.log('Invalid date format', err)
      setError('Invalid date format. Use YYYY-MM-DD')
    }
  }

  // ✅ SEARCH LOGIC: Find week by week number
  const handleWeekSearch = (weekNum: string) => {
    if (!birthDate) {
      setError('Birth date not set')
      return
    }

    try {
      setError('')

      const weekIndex = parseInt(weekNum) - 1 // Convert 1-indexed to 0-indexed
      const matchedWeek = weeks.find((w) => w.index === weekIndex)

      if (matchedWeek && weekIndex >= 0) {
        setSelectedWeek(matchedWeek)
        onWeekSelect(matchedWeek)
        onHighlight(matchedWeek.index)
        setIsOpen(false)

        // Auto-scroll after a short delay
        setTimeout(() => {
          const element = document.getElementById(`week-${matchedWeek.index}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      } else {
        setError(`Week ${weekNum} does not exist`)
      }
    } catch (err) {
        console.log('Invalid week number', err)
      setError('Invalid week number')
    }
  }

  // ✅ COMBINED SEARCH: Try to parse intelligently
  const handleSearch = () => {
    if (!searchInput.trim()) {
      setError('Please enter a date or week number')
      return
    }

    // Check if it's a date (YYYY-MM-DD format or other date formats)
    if (searchInput.includes('-') && searchInput.length >= 8) {
      handleDateSearch(searchInput)
    }
    // Check if it's a week number
    else if (/^\d+$/.test(searchInput)) {
      handleWeekSearch(searchInput)
    } else {
      // Try to parse as date anyway
      handleDateSearch(searchInput)
    }
  }

  // ✅ CLEAR SEARCH
  const handleClear = () => {
    setSearchInput('')
    setSelectedWeek(null)
    setError('')
    onHighlight(null)
  }

  // ✅ KEYBOARD SHORTCUT: Enter to search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="mb-8">
      {/* ✅ SEARCH BAR */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex gap-2 flex-col sm:flex-row">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD) or week #..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-brand-orange transition-colors"
            />

            {/* Search Icon */}
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />

            {/* Clear Button */}
            {searchInput && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-3 text-zinc-600 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-brand-orange text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-orange/90 transition whitespace-nowrap flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* ✅ ERROR MESSAGE */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 5 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 mt-2 bg-red-900/20 border border-red-800 text-red-400 text-xs px-3 py-2 rounded-lg w-full"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ SUGGESTIONS DROPDOWN */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {/* Help Text */}
              {!searchInput && (
                <div className="p-4 border-b border-zinc-800">
                  <p className="text-zinc-500 text-xs mb-3 font-semibold">SEARCH EXAMPLES</p>

                  <div className="space-y-2">
                    {/* Example 1: Search by date */}
                    <div
                      onClick={() => {
                        const today = format(new Date(), 'yyyy-MM-dd')
                        setSearchInput(today)
                      }}
                      className="bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded cursor-pointer transition text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Search by date</span>
                        <ChevronRight className="w-3 h-3 text-zinc-600" />
                      </div>
                      <p className="text-zinc-600 text-xs mt-1">e.g., {format(new Date(), 'yyyy-MM-dd')}</p>
                    </div>

                    {/* Example 2: Search by week */}
                    <div
                      onClick={() => setSearchInput('52')}
                      className="bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded cursor-pointer transition text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Search by week number</span>
                        <ChevronRight className="w-3 h-3 text-zinc-600" />
                      </div>
                      <p className="text-zinc-600 text-xs mt-1">e.g., 52, 100, 250</p>
                    </div>

                    {/* Example 3: Jump to current week */}
                    <div
                      onClick={() => {
                        // Calculate current week
                        const birthDateObj = parseISO(birthDate!)
                        const currentWeek = differenceInWeeks(new Date(), birthDateObj) + 1
                        setSearchInput(currentWeek.toString())
                      }}
                      className="bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded cursor-pointer transition text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Jump to current week</span>
                        <ChevronRight className="w-3 h-3 text-zinc-600" />
                      </div>
                      <p className="text-zinc-600 text-xs mt-1">Go to this week</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchInput && (
                <div className="p-3">
                  {selectedWeek ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-brand-orange/10 border border-brand-orange/30 rounded p-3"
                    >
                      <p className="text-brand-orange text-xs font-semibold mb-2">✓ FOUND</p>
                      <p className="text-white text-sm mb-1">
                        <strong>Week {selectedWeek.index + 1}</strong> • {selectedWeek.date}
                      </p>
                      <p className="text-zinc-400 text-xs">
                        {selectedWeek.isPast
                          ? '📅 Lived'
                          : selectedWeek.isCurrent
                            ? '⭕ Current week'
                            : '🔮 Future'}
                      </p>
                    </motion.div>
                  ) : (
                    <p className="text-zinc-500 text-xs">Type to search...</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ✅ SELECTED WEEK INFO */}
      {selectedWeek && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between"
        >
          <div>
            <p className="text-white text-sm font-medium">
              Week {selectedWeek.index + 1}
            </p>
            <p className="text-zinc-500 text-xs">{selectedWeek.date}</p>
          </div>

          <button
            onClick={() => {
              handleClear()
              setIsOpen(false)
            }}
            className="text-zinc-600 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ✅ QUICK TIPS */}
      {!searchInput && !selectedWeek && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-xs text-zinc-600 flex flex-wrap gap-2"
        >
          <span>💡 Pro tip:</span>
          <span>Use YYYY-MM-DD format for dates</span>
          <span>•</span>
          <span>Or enter a week number (1-4160)</span>
        </motion.div>
      )}
    </div>
  )
}