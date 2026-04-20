'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLifeStore } from '@/store/useCapsuleStore'
import { PhotoGrid } from './PhotoGrid'
import { PhotoFilters } from './PhotoFilters'
import { PhotoStats } from './PhotoStats'
import { PhotoViewer } from './PhotoViewer'

type PhotoItem = {
  _id: string
  weekIndex: number
  url: string
  name: string
  createdAt: Date
  weekDate?: string
}

export function PhotoGallery() {
  const router = useRouter()
  const { getNote } = useLifeStore()

  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  useEffect(() => {
    fetchPhotos()
  }, [])

  async function fetchPhotos() {
    try {
      setIsLoading(true)
      const res = await fetch('/api/media?type=image')
      if (res.ok) {
        const data = await res.json()
        
        // Enrich photos with week date info
        const enrichedPhotos = (data.media || []).map((photo: any) => {
          const note = getNote(photo.weekIndex)
          return {
            ...photo,
            weekDate: note?.date || new Date().toISOString(),
          }
        })

        // Sort
        enrichedPhotos.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return sortBy === 'newest' ? dateB - dateA : dateA - dateB
        })

        setPhotos(enrichedPhotos)
        setFilteredPhotos(enrichedPhotos)
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Filter photos based on search and date range
    let filtered = photos

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.weekDate?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(photo => {
        const photoDate = new Date(photo.createdAt)
        if (dateRange.from && photoDate < dateRange.from) return false
        if (dateRange.to && photoDate > dateRange.to) return false
        return true
      })
    }

    setFilteredPhotos(filtered)
  }, [searchTerm, dateRange, photos])

  if (!isLoading && photos.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white pt-20 px-4 py-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">📸</div>
          <h1 className="text-3xl font-light mb-4">No photos yet</h1>
          <p className="text-zinc-400 mb-6">
            Add photos to your weeks to see them here in a beautiful gallery
          </p>
          <button
            onClick={() => router.push('/grid')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
          >
            Go to grid →
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white pt-20 px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/grid')}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors mb-4"
          >
            ← Back to grid
          </button>
          <h1 className="text-4xl font-light tracking-tight mb-2">Photo Gallery</h1>
          <p className="text-zinc-600">
            {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''} from your life
          </p>
        </div>

        {/* Stats */}
        {photos.length > 0 && (
          <PhotoStats photos={photos} />
        )}

        {/* Filters */}
        <PhotoFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          totalPhotos={photos.length}
          filteredPhotos={filteredPhotos.length}
        />

        {/* Photo Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-zinc-400">Loading photos...</div>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400">No photos match your filters</p>
          </div>
        ) : (
          <PhotoGrid
            photos={filteredPhotos}
            onPhotoClick={setSelectedPhoto}
          />
        )}
      </div>

      {/* Photo Viewer Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoViewer
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onNavigate={(direction) => {
              const currentIndex = filteredPhotos.findIndex(p => p._id === selectedPhoto._id)
              if (direction === 'next' && currentIndex < filteredPhotos.length - 1) {
                setSelectedPhoto(filteredPhotos[currentIndex + 1])
              } else if (direction === 'prev' && currentIndex > 0) {
                setSelectedPhoto(filteredPhotos[currentIndex - 1])
              }
            }}
          />
        )}
      </AnimatePresence>
    </main>
  )
}