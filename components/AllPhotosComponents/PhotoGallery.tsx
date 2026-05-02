'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
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

interface RawPhotoData {
     _id: string
     weekIndex: number
     url: string
     name: string
     createdAt?: string | Date
   }

export function PhotoGallery() {
  const router = useRouter()
  const { getNote } = useLifeStore()

  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  useEffect(() => {
    async function fetchPhotos() {
      try {
        setIsLoading(true)
        setError(null)

        console.log('📸 Fetching photos from /api/media?type=image')
        
        const res = await fetch('/api/media?type=image')
        const responseData = await res.json()
        
        console.log('📡 API Response:', responseData)

        if (!res.ok) {
          throw new Error(responseData.error || 'Failed to fetch photos')
        }

        const mediaArray = responseData.media || []
        console.log(`✅ Received ${mediaArray.length} media items`)

        if (mediaArray.length === 0) {
          console.log('⚠️ No photos found')
          setPhotos([])
          setFilteredPhotos([])
          setIsLoading(false)
          return
        }

        // Enrich photos with week date info and ensure proper typing
        const enrichedPhotos = mediaArray.map((photo: RawPhotoData) => {
          const note = getNote(photo.weekIndex)
          
          // Ensure createdAt is a Date object
          const createdAt = photo.createdAt 
            ? new Date(photo.createdAt)
            : new Date()
          
          const enriched: PhotoItem = {
            _id: photo._id,
            weekIndex: photo.weekIndex,
            url: photo.url,
            name: photo.name,
            createdAt,
            weekDate: note?.date || new Date().toISOString(),
          }
          
          console.log(`  📷 Photo: ${photo.name} (week ${photo.weekIndex})`)
          return enriched
        })

        console.log(`🔄 Sorting by ${sortBy}...`)
        
        // Sort
        enrichedPhotos.sort((a: PhotoItem, b: PhotoItem) => {
          const dateA = a.createdAt.getTime()
          const dateB = b.createdAt.getTime()
          return sortBy === 'newest' ? dateB - dateA : dateA - dateB
        })

        console.log(`✅ Total photos enriched: ${enrichedPhotos.length}`)
        setPhotos(enrichedPhotos)
        setFilteredPhotos(enrichedPhotos)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('❌ Failed to fetch photos:', message)
        setError(message)
        setPhotos([])
        setFilteredPhotos([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhotos()
  }, [getNote, sortBy])

  // Apply filters whenever search or date range changes
  useEffect(() => {
    console.log(`🔍 Filtering: search="${searchTerm}", dateFrom=${dateRange.from}, dateTo=${dateRange.to}`)
    
    let filtered = [...photos]

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(photo =>
        photo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.weekDate?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log(`  Found ${filtered.length} matches for search`)
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(photo => {
        const photoDate = new Date(photo.createdAt)
        if (dateRange.from && photoDate < dateRange.from) return false
        if (dateRange.to && photoDate > dateRange.to) return false
        return true
      })
      console.log(`  Found ${filtered.length} matches for date range`)
    }

    setFilteredPhotos(filtered)
  }, [searchTerm, dateRange, photos])

  // Show error state
  if (error) {
    return (
      <main className="min-h-screen bg-black text-white pt-20 px-4 py-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-light mb-4">Error Loading Photos</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => {
              // Re-trigger the useEffect by updating a dependency
              setIsLoading(true)
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition mr-4"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/grid')}
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
          >
            Back to Grid
          </button>
        </div>
      </main>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white pt-20 px-4 py-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4 animate-bounce">📸</div>
          <h1 className="text-2xl font-light">Loading your photos...</h1>
        </div>
      </main>
    )
  }

  // Show empty state
  if (photos.length === 0) {
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
          <h1 className="text-4xl font-light tracking-tight mb-2">All Photos</h1>
          <p className="text-zinc-600">
            {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''} from your life
          </p>
        </div>

        {/* Stats */}
        {photos.length > 0 && <PhotoStats photos={photos} />}

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
        {filteredPhotos.length === 0 ? (
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
