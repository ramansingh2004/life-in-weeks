import { createClient, RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null
let connectionPromise: Promise<RedisClientType> | null = null

/**
 * Create and connect the Redis client on first use.
 * Importing this module must never open a connection because Next.js imports
 * server modules in multiple workers while collecting build-time page data.
 */
export async function initializeRedis(): Promise<RedisClientType> {
  if (redisClient?.isReady || redisClient?.isOpen) return redisClient
  if (connectionPromise) return connectionPromise

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set')
  }

  const client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          return new Error('Max Redis connection retries exceeded')
        }
        return Math.min(retries * 100, 500)
      },
      connectTimeout: 5000,
    },
  })

  client.on('error', (error) => {
    console.error('[REDIS] Client error:', error.message)
  })

  client.on('ready', () => {
    console.log('[REDIS] Client ready')
  })

  redisClient = client
  connectionPromise = client
    .connect()
    .then(() => client)
    .catch((error) => {
      redisClient = null
      throw error
    })
    .finally(() => {
      connectionPromise = null
    })

  return connectionPromise
}

export async function getRedisClient(): Promise<RedisClientType> {
  return initializeRedis()
}

export function isRedisConnected(): boolean {
  return redisClient?.isReady === true
}

export async function closeRedis(): Promise<void> {
  const client = redisClient
  redisClient = null

  if (!client?.isOpen) return

  try {
    await client.quit()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[REDIS] Error closing connection:', message)
  }
}

export default getRedisClient
