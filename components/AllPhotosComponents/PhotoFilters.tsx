'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface PhotoFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  sortBy: 'newest' | 'oldest'
  onSortChange: (sort: 'newest' | 'oldest') => void
  dateRange: { from?: Date; to?: Date }
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void
  totalPhotos: number
  filteredPhotos: number
}

export function PhotoFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  dateRange,
  onDateRangeChange,
  totalPhotos,
  filteredPhotos,
}: PhotoFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search photos by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-[#14213D] border border-zinc-800/80 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FCA311] focus:ring-1 focus:ring-[#FCA311] transition-all"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2.5 bg-[#14213D] border border-zinc-800/80 hover:border-[#FCA311]/50 hover:text-[#FCA311] rounded-lg text-white transition-colors"
        >
          ⚙️ Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#14213D]/70 border border-zinc-800/80 backdrop-blur-md rounded-lg"
        >
          {/* Sort */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase mb-2 block">
              Sort
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
              className="w-full px-3 py-2 bg-black/40 border border-zinc-800/80 hover:border-[#FCA311]/50 focus:border-[#FCA311] rounded text-white text-sm focus:outline-none transition-all"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase mb-2 block">
              From
            </label>
            <input
              type="date"
              value={dateRange.from?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                onDateRangeChange({
                  ...dateRange,
                  from: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 bg-black/40 border border-zinc-800/80 hover:border-[#FCA311]/50 focus:border-[#FCA311] rounded text-white text-sm focus:outline-none transition-all"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase mb-2 block">
              To
            </label>
            <input
              type="date"
              value={dateRange.to?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                onDateRangeChange({
                  ...dateRange,
                  to: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 bg-black/40 border border-zinc-800/80 hover:border-[#FCA311]/50 focus:border-[#FCA311] rounded text-white text-sm focus:outline-none transition-all"
            />
          </div>
        </motion.div>
      )}

      {/* Results Info */}
      <div className="text-sm text-zinc-400">
        Showing {filteredPhotos} of {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''}
      </div>
    </div>
  )
}