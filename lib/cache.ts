import { getRedisClient, isRedisConnected } from './redis'

/**
 * Cache Key Patterns
 * Organized by data type for easy invalidation
 */
export const CACHE_KEYS = {
  // Dashboard: dashboard:{userId}
  DASHBOARD: (userId: string) => `dashboard:${userId}`,

  // Weeks: weeks:{userId}
  WEEKS_LIST: (userId: string) => `weeks:${userId}`,
  WEEKS_SINGLE: (userId: string, weekIndex: number) => `weeks:${userId}:${weekIndex}`,
  WEEKS_RANGE: (userId: string, start: number, end: number) => `weeks:${userId}:${start}-${end}`,

  // Milestones: milestones:{userId}
  MILESTONES_LIST: (userId: string) => `milestones:${userId}`,
  MILESTONES_SINGLE: (userId: string, milestoneId: string) => `milestone:${userId}:${milestoneId}`,

  // Settings: settings:{userId}
  SETTINGS: (userId: string) => `settings:${userId}`,

  // User profile: user:{userId}
  USER_PROFILE: (userId: string) => `user:${userId}`,

  // Tags: tags:{userId}
  TAGS: (userId: string) => `tags:${userId}`,
}

/**
 * Cache TTL (Time to Live)
 * Duration in seconds
 */
export const CACHE_TTL = {
  DASHBOARD: 10 * 60, // 10 minutes
  WEEKS: 15 * 60, // 15 minutes
  MILESTONES: 15 * 60, // 15 minutes
  SETTINGS: 24 * 60 * 60, // 24 hours
  USER: 24 * 60 * 60, // 24 hours
  TAGS: 24 * 60 * 60, // 24 hours
}

/**
 * Get Cached Value
 * Returns parsed JSON or null if not found
 */
export async function getCachedValue<T>(key: string): Promise<T | null> {
  try {
    if (!isRedisConnected()) {
      console.warn(`⚠️ [CACHE] Redis not connected, skipping GET for key: ${key}`)
      return null
    }

    const redis = await getRedisClient()
    const cached = await redis.get(key)

    if (cached) {
      console.log(`✅ [CACHE] HIT: ${key}`)
      return JSON.parse(cached) as T
    }

    console.log(`❌ [CACHE] MISS: ${key}`)
    return null
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ [CACHE] Error getting key ${key}:`, message)
    return null
  }
}

/**
 * Set Cached Value
 * Stores JSON with TTL
 */
export async function setCachedValue<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<boolean> {
  try {
    if (!isRedisConnected()) {
      console.warn(`⚠️ [CACHE] Redis not connected, skipping SET for key: ${key}`)
      return false
    }

    const redis = await getRedisClient()
    const json = JSON.stringify(value)

    if (ttlSeconds) {
      await redis.setEx(key, ttlSeconds, json)
      console.log(`✅ [CACHE] SET: ${key} (TTL: ${ttlSeconds}s)`)
    } else {
      await redis.set(key, json)
      console.log(`✅ [CACHE] SET: ${key} (no TTL)`)
    }

    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ [CACHE] Error setting key ${key}:`, message)
    return false
  }
}

/**
 * Delete Cached Value
 */
export async function deleteCachedValue(key: string): Promise<boolean> {
  try {
    if (!isRedisConnected()) {
      console.warn(`⚠️ [CACHE] Redis not connected, skipping DELETE for key: ${key}`)
      return false
    }

    const redis = await getRedisClient()
    const deleted = await redis.del(key)

    if (deleted > 0) {
      console.log(`✅ [CACHE] DELETED: ${key}`)
      return true
    }

    console.log(`⚠️ [CACHE] Key not found: ${key}`)
    return false
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ [CACHE] Error deleting key ${key}:`, message)
    return false
  }
}

/**
 * Delete Multiple Cached Values
 * Delete all keys matching pattern: keys:userId:*
 */
export async function deleteCachedPatterns(userId: string, patterns: string[]): Promise<number> {
  try {
    if (!isRedisConnected()) {
      console.warn(`⚠️ [CACHE] Redis not connected, skipping DELETE patterns for user: ${userId}`)
      return 0
    }

    const redis = await getRedisClient()
    let deletedCount = 0

    for (const pattern of patterns) {
      const key = pattern.replace('{userId}', userId)
      const deleted = await redis.del(key)
      deletedCount += deleted

      if (deleted > 0) {
        console.log(`✅ [CACHE] DELETED: ${key}`)
      }
    }

    return deletedCount
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ [CACHE] Error deleting patterns:`, message)
    return 0
  }
}

/**
 * Clear All Cache for User
 * Deletes: dashboard, weeks, milestones, tags
 */
export async function clearUserCache(userId: string): Promise<number> {
  console.log(`🗑️ [CACHE] Clearing all cache for user: ${userId}`)

  const patterns = [
    CACHE_KEYS.DASHBOARD(userId),
    CACHE_KEYS.WEEKS_LIST(userId),
    CACHE_KEYS.MILESTONES_LIST(userId),
    CACHE_KEYS.TAGS(userId),
  ]

  let totalDeleted = 0
  for (const key of patterns) {
    const deleted = await deleteCachedValue(key)
    if (deleted) totalDeleted++
  }

  console.log(`✅ [CACHE] Cleared ${totalDeleted} cache keys for user: ${userId}`)
  return totalDeleted
}

/**
 * Invalidate Weeks Cache (when week is updated/deleted)
 */
export async function invalidateWeeksCache(userId: string): Promise<number> {
  console.log(`🔄 [CACHE] Invalidating weeks cache for user: ${userId}`)

  const keys = [
    CACHE_KEYS.WEEKS_LIST(userId),
    CACHE_KEYS.DASHBOARD(userId), // Dashboard might show week stats
  ]

  let deletedCount = 0
  for (const key of keys) {
    const deleted = await deleteCachedValue(key)
    if (deleted) deletedCount++
  }

  return deletedCount
}

/**
 * Invalidate Milestones Cache (when milestone is updated/deleted)
 */
export async function invalidateMilestonesCache(userId: string): Promise<number> {
  console.log(`🔄 [CACHE] Invalidating milestones cache for user: ${userId}`)

  const keys = [
    CACHE_KEYS.MILESTONES_LIST(userId),
    CACHE_KEYS.DASHBOARD(userId), // Dashboard might show milestone stats
  ]

  let deletedCount = 0
  for (const key of keys) {
    const deleted = await deleteCachedValue(key)
    if (deleted) deletedCount++
  }

  return deletedCount
}

/**
 * Invalidate Settings Cache
 */
export async function invalidateSettingsCache(userId: string): Promise<boolean> {
  console.log(`🔄 [CACHE] Invalidating settings cache for user: ${userId}`)
  return deleteCachedValue(CACHE_KEYS.SETTINGS(userId))
}

/**
 * Invalidate User Profile Cache
 */
export async function invalidateUserCache(userId: string): Promise<boolean> {
  console.log(`🔄 [CACHE] Invalidating user cache for user: ${userId}`)
  return deleteCachedValue(CACHE_KEYS.USER_PROFILE(userId))
}

/**
 * Cache Wrapper Function
 * Try to get from cache, if miss, call fetchFn, cache result, return
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await getCachedValue<T>(key)
    if (cached) {
      return cached
    }

    // Cache miss - fetch data
    console.log(`⏳ [CACHE] Fetching data for key: ${key}`)
    const data = await fetchFn()

    // Store in cache
    await setCachedValue(key, data, ttlSeconds)

    return data
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ [CACHE] Error in cachedFetch for ${key}:`, message)
    throw error
  }
}

/**
 * Get Cache Stats (for debugging)
 */
export async function getCacheStats(): Promise<{ memory?: string; keys?: number }> {
  try {
    if (!isRedisConnected()) {
      return {}
    }

    const redis = await getRedisClient()
    const info = await redis.info('memory')
    const keys = await redis.dbSize()

    return {
      memory: info.split('\r\n').find(line => line.includes('used_memory_human'))?.split(':')[1],
      keys,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ [CACHE] Error getting stats:`, message)
    return {}
  }
}