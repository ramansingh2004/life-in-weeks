'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseCursorPaginationOptions<T> {
  initialItems: T[]
  itemsPerPage?: number
  getCursorFromItem?: (item: T) => string | number
  onLoadMore?: (cursor: string | number | null) => Promise<T[]>
}

interface UseCursorPaginationReturn<T> {
  items: T[]
  isLoading: boolean
  hasMore: boolean
  loadMore: () => void
  reset: () => void
  observerTarget: React.RefObject<HTMLDivElement | null>
}

/**
 * ✅ Cursor-based pagination hook
 * Loads more items as user scrolls to bottom
 * Uses Intersection Observer for automatic triggering
 */
export function useCursorPagination<T>({
  initialItems,
  itemsPerPage = 20,
  getCursorFromItem,
  onLoadMore,
}: UseCursorPaginationOptions<T>): UseCursorPaginationReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialItems.length >= itemsPerPage || initialItems.length === 0)
  const observerTarget = useRef<HTMLDivElement>(null)
  const lastCursorRef = useRef<string | number | null>(null)
  const loadingRef = useRef(false)

  // Get cursor from last item
  const getLastCursor = useCallback((): string | number | null => {
    if (items.length === 0) return null
    const lastItem = items[items.length - 1]
    if (getCursorFromItem) {
      return getCursorFromItem(lastItem)
    }
    // Fallback: use index
    return items.length - 1
  }, [items, getCursorFromItem])

  // Load more items
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || !onLoadMore) return

    loadingRef.current = true
    setIsLoading(true)
    try {
      const cursor = getLastCursor()
      const newItems = await onLoadMore(cursor)

      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setItems((prev) => {
          // Avoid duplicating any items already in state if triggered concurrently
          const newItemsFiltered = getCursorFromItem 
            ? newItems.filter(newItem => !prev.some(prevItem => getCursorFromItem(prevItem) === getCursorFromItem(newItem)))
            : newItems
          return [...prev, ...newItemsFiltered]
        })
        lastCursorRef.current = getLastCursor()
        if (newItems.length < itemsPerPage) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Error loading more items:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [getLastCursor, hasMore, onLoadMore, itemsPerPage, getCursorFromItem])

  // Setup Intersection Observer for automatic scroll trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !loadingRef.current) {
          loadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Start loading 100px before reaching bottom
      }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore, isLoading])

  // Auto-load first page if empty on mount/reset
  useEffect(() => {
    if (items.length === 0 && hasMore && !isLoading && !loadingRef.current) {
      loadMore()
    }
  }, [items.length, hasMore, isLoading, loadMore])

  const reset = useCallback(() => {
    setItems(initialItems)
    setIsLoading(false)
    loadingRef.current = false
    setHasMore(initialItems.length >= itemsPerPage || initialItems.length === 0)
    lastCursorRef.current = null
  }, [initialItems, itemsPerPage])

  return {
    items,
    isLoading,
    hasMore,
    loadMore,
    reset,
    observerTarget,
  }
}

/**
 * ✅ Loading indicator component for infinite scroll
 */
interface InfiniteScrollLoaderProps {
  isLoading: boolean
  hasMore: boolean
  targetRef: React.RefObject<HTMLDivElement | null>
  loadingText?: string
  emptyText?: string
}

export function InfiniteScrollLoader({
  isLoading,
  hasMore,
  targetRef,
  loadingText = 'Loading more...',
  emptyText = 'No more items',
}: InfiniteScrollLoaderProps) {
  if (!hasMore) {
    return (
      <div
        ref={targetRef}
        className="text-center py-12"
      >
        <p className="text-zinc-600 text-sm">✨ {emptyText}</p>
      </div>
    )
  }

  return (
    <div
      ref={targetRef}
      className="text-center py-8"
    >
      {isLoading ? (
        <div className="flex justify-center items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.8s',
                }}
              />
            ))}
          </div>
          <span className="text-zinc-500 text-xs ml-2">{loadingText}</span>
        </div>
      ) : null}
    </div>
  )
}