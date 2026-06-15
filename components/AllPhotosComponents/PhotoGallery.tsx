'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useLifeStore } from '@/store/useCapsuleStore'
import { PhotoGrid } from './PhotoGrid'
import { PhotoFilters } from './PhotoFilters'
import { PhotoStats } from './PhotoStats'
import { PhotoViewer } from './PhotoViewer'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/hooks/useQuery'
import { useCursorPagination, InfiniteScrollLoader } from '@/hooks/useCursorPagination'
import { PhotoGallerySkeleton } from './PhotoGallerySkeleton'

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
  
  const { user, isLoading: isLoadingUser } = useAuth()
  const { getNote } = useLifeStore()
  const resetPaginationRef = useRef<(() => void) | null>(null)

  const [allPhotos, setAllPhotos] = useState<PhotoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // ✅ Cursor-based pagination for photos
  const {
    items: paginatedPhotos,
    isLoading: isLoadingMore,
    hasMore,
    observerTarget,
    reset: resetPagination,
  } = useCursorPagination<PhotoItem>({

    initialItems: [],
    itemsPerPage: 30,
    getCursorFromItem: (item) => item._id,
    onLoadMore: async (cursor) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      const filtered = getFilteredPhotos()
      
      if (cursor === null) {
        return filtered.slice(0, 30)
      }
      
      const cursorIndex = filtered.findIndex((p) => p._id === cursor)
      const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0
      
      return filtered.slice(startIndex, startIndex + 30)
    },
  })

  // Keep a stable ref to resetPagination to avoid infinite loops
  resetPaginationRef.current = resetPagination

  // ✅ IMPROVED: Check auth status with React Query before loading photos
  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/login')
      return
    }

    async function fetchPhotos() {
      try {
        setIsLoading(true)
        setError(null)

        console.log('📸 Fetching photos from /api/media?type=image')

        const res = await fetch('/api/media?type=image')
        const responseData = await res.json()

        console.log('📡 API Response:', responseData)

        if (!res.ok) {
          const errorMsg = responseData.error?.message || responseData.error || 'Failed to fetch photos'
          throw new Error(typeof errorMsg === 'string' ? errorMsg : 'Failed to fetch photos')
        }

        const mediaArray = responseData.data?.media || []
        console.log(`✅ Received ${mediaArray.length} media items`)

        if (mediaArray.length === 0) {
          console.log('⚠️ No photos found')
          setAllPhotos([])
          setIsLoading(false)
          return
        }

        // Enrich photos with week date info and ensure proper typing
        const enrichedPhotos = mediaArray.map((photo: RawPhotoData) => {
          const note = getNote(photo.weekIndex)

          // Ensure createdAt is a Date object
          const createdAt = photo.createdAt ? new Date(photo.createdAt) : new Date()

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
        setAllPhotos(enrichedPhotos)
        resetPaginationRef.current?.()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('❌ Failed to fetch photos:', message)
        setError(message)
        setAllPhotos([])
      } finally {
        setIsLoading(false)
      }
    }

    if (!isLoadingUser && user) {
      console.log('🔄 [PhotoGallery] Triggering fetchPhotos because user and isLoadingUser changed', { userId: user?._id })
      fetchPhotos()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, user?._id, isLoadingUser, router])

  // Get filtered photos
  const getFilteredPhotos = useCallback((): PhotoItem[] => {
    let filtered = [...allPhotos]

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (photo) =>
          photo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          photo.weekDate?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log(`  Found ${filtered.length} matches for search`)
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((photo) => {
        const photoDate = new Date(photo.createdAt)
        if (dateRange.from && photoDate < dateRange.from) return false
        if (dateRange.to && photoDate > dateRange.to) return false
        return true
      })
      console.log(`  Found ${filtered.length} matches for date range`)
    }

    return filtered
  }, [allPhotos, searchTerm, dateRange])

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination()
  }, [searchTerm, dateRange, resetPagination])

  // ✅ Show loading while checking auth
  if (isLoadingUser) {
    return <PhotoGallerySkeleton />
  }

  // Show error state
  if (error) {
    return (
      <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl sm:text-3xl font-light mb-4">Error Loading Photos</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => setIsLoading(true)}
            className="px-6 py-3 bg-[#FCA311] hover:bg-[#FCA311]/90 text-black font-semibold rounded-lg transition mr-4 shadow-md hover:shadow-[0_0_10px_rgba(252,163,17,0.2)]"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/grid')}
            className="px-6 py-3 bg-[#14213D] border border-zinc-800 text-white hover:border-[#FCA311]/50 rounded-lg transition"
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
      <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4 animate-bounce">📸</div>
          <h1 className="text-2xl font-light">Loading your photos...</h1>
        </div>
      </main>
    )
  }

  // Show empty state
  if (allPhotos.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">📸</div>
          <h1 className="text-2xl sm:text-3xl font-light mb-4">No photos yet</h1>
          <p className="text-zinc-400 mb-6">
            Add photos to your weeks to see them here in a beautiful gallery
          </p>
          <button
            onClick={() => router.push('/grid')}
            className="px-6 py-3 bg-[#FCA311] hover:bg-[#FCA311]/90 text-black font-semibold rounded-lg transition shadow-md hover:shadow-[0_0_10px_rgba(252,163,17,0.2)]"
          >
            Go to grid →
          </button>
        </div>
      </main>
    )
  }

  const filtered = getFilteredPhotos()

  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
      {/* Sidebar */}
      <Sidebar />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/grid')}
            className="text-zinc-400 text-xs hover:text-[#FCA311] transition-colors mb-4"
          >
            ← Back to grid
          </button>
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight mb-2">All Photos</h1>
          <p className="text-zinc-400 text-sm">
            {filtered.length} photo{filtered.length !== 1 ? 's' : ''} from your life
          </p>
        </div>

        {/* Stats */}
        {allPhotos.length > 0 && <PhotoStats photos={allPhotos} />}

        {/* Filters */}
        <PhotoFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          totalPhotos={allPhotos.length}
          filteredPhotos={filtered.length}
        />

        {/* Photo Grid with infinite scroll */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400">No photos match your filters</p>
          </div>
        ) : (
          <>
            {paginatedPhotos.length > 0 && (
              <PhotoGrid photos={paginatedPhotos} onPhotoClick={setSelectedPhoto} />
            )}
            
            {/* ✅ Infinite scroll loader */}
            <InfiniteScrollLoader
              isLoading={isLoadingMore}
              hasMore={hasMore}
              targetRef={observerTarget}
              loadingText="Loading more photos..."
              emptyText="You've seen all your photos"
            />
          </>
        )}
      </div>

      {/* Photo Viewer Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoViewer
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onNavigate={(direction) => {
              const currentIndex = paginatedPhotos.findIndex((p) => p._id === selectedPhoto._id)
              if (direction === 'next' && currentIndex < paginatedPhotos.length - 1) {
                setSelectedPhoto(paginatedPhotos[currentIndex + 1])
              } else if (direction === 'prev' && currentIndex > 0) {
                setSelectedPhoto(paginatedPhotos[currentIndex - 1])
              }
            }}
          />
        )}
      </AnimatePresence>
    </main>
  )
}