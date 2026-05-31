'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number // Percentage of element visible before trigger (0-1, default 0.1)
  onLoadMore: () => void | Promise<void>
  isLoading?: boolean
  hasMore?: boolean
}

/**
 * ✅ Reusable infinite scroll hook using Intersection Observer
 * Triggers callback when element becomes visible
 */
export function useInfiniteScroll({
  threshold = 0.1,
  onLoadMore,
  isLoading = false,
  hasMore = true,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null)
  const [isTriggering, setIsTriggering] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries

        // Only trigger if:
        // 1. Element is visible
        // 2. We're not already loading
        // 3. We're not already triggering
        // 4. There are more items to load
        if (entry.isIntersecting && !isLoading && !isTriggering && hasMore) {
          setIsTriggering(true)

          try {
            await Promise.resolve(onLoadMore())
          } catch (error) {
            console.error('Error loading more items:', error)
          } finally {
            setIsTriggering(false)
          }
        }
      },
      {
        threshold,
        rootMargin: '100px', // Trigger 100px before element becomes visible
      }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [onLoadMore, isLoading, hasMore, isTriggering, threshold])

  return {
    observerTarget,
    isTriggering,
  }
}

/**
 * ✅ Hook for managing paginated data with infinite scroll
 */
interface UsePaginatedDataOptions<T> {
  items: T[]
  pageSize: number
  onLoadMore: (page: number) => Promise<T[]> | T[]
}

export function usePaginatedData<T>({
  items,
  pageSize,
  onLoadMore,
}: UsePaginatedDataOptions<T>) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Initialize with first page
  useEffect(() => {
    const firstPage = items.slice(0, pageSize)
    setDisplayedItems(firstPage)
    setCurrentPage(0)
    setHasMore(items.length > pageSize)
  }, [items, pageSize])

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      const nextPage = currentPage + 1
      const startIndex = nextPage * pageSize
      const endIndex = startIndex + pageSize

      // Get next batch of items
      const nextItems = items.slice(startIndex, endIndex)

      // Call onLoadMore if provided (for async loading)
      let newItems = nextItems
      if (onLoadMore) {
        const additionalItems = await onLoadMore(nextPage)
        newItems = additionalItems || nextItems
      }

      if (newItems.length === 0) {
        setHasMore(false)
        return
      }

      // Add to displayed items
      setDisplayedItems((prev) => [...prev, ...newItems])
      setCurrentPage(nextPage)

      // Check if there are more items
      setHasMore(endIndex + pageSize < items.length)
    } catch (error) {
      console.error('Error loading more items:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [items, pageSize, currentPage, isLoading, hasMore, onLoadMore])

  const reset = useCallback(() => {
    const firstPage = items.slice(0, pageSize)
    setDisplayedItems(firstPage)
    setCurrentPage(0)
    setHasMore(items.length > pageSize)
  }, [items, pageSize])

  return {
    displayedItems,
    currentPage,
    isLoading,
    hasMore,
    loadMore,
    reset,
  }
}