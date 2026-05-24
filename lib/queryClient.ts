import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ Stale time: How long data is considered fresh without refetching
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // ✅ Cache time: How long to keep data in memory
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      
      // ✅ Refetch on mount: Always verify data freshness when component mounts
      refetchOnMount: true,
      
      // ✅ Refetch on window focus: Sync data when user returns to tab
      refetchOnWindowFocus: true,
      
      // ✅ Refetch on reconnect: Sync when connection restored
      refetchOnReconnect: true,
      
      // ✅ Retry logic: Retry failed requests up to 3 times
      retry: (failureCount, error) => {
        // Don't retry on 401 (unauthorized) or 403 (forbidden)
        if (error instanceof Error) {
          const message = error.message
          if (message.includes('401') || message.includes('403')) {
            return false
          }
        }
        // Retry max 3 times for other errors
        return failureCount < 3
      },
      
      // ✅ Retry delay: Exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // ✅ Mutations don't cache by default, but set retry behavior
      retry: (failureCount, error) => {
        // Don't retry on 401 or 403
        if (error instanceof Error) {
          const message = error.message
          if (message.includes('401') || message.includes('403')) {
            return false
          }
        }
        return failureCount < 1
      },
    },
  },
})