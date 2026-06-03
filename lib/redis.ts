import { createClient, RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null
let isConnected = false

/**
 * ✅ Initialize Redis Client
 * Connects to Redis server with error handling and retry logic
 */
export async function initializeRedis(): Promise<RedisClientType> {
  if (redisClient && isConnected) {
    console.log('♻️ [REDIS] Client already connected')
    return redisClient
  }

  try {
    const redisUrl = process.env.REDIS_URL

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set')
    }

    console.log('🔄 [REDIS] Initializing Redis client...')

    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          console.log(`[REDIS] Reconnect attempt ${retries}`)
          if (retries > 10) {
            console.error('[REDIS] Max reconnection attempts reached')
            return new Error('Max Redis connection retries exceeded')
          }
          return retries * 50
        },
        connectTimeout: 10000,
      },
    })

    // Error handler
    redisClient.on('error', (err) => {
      console.error('❌ [REDIS] Client error:', err.message)
      isConnected = false
    })

    // Connection handler
    redisClient.on('connect', () => {
      console.log('✅ [REDIS] Connected to Redis')
      isConnected = true
    })

    // Disconnect handler
    redisClient.on('disconnect', () => {
      console.warn('⚠️ [REDIS] Disconnected from Redis')
      isConnected = false
    })

    // Ready handler
    redisClient.on('ready', () => {
      console.log('✅ [REDIS] Redis client ready')
    })

    // Connect
    await redisClient.connect()
    isConnected = true

    console.log('✅ [REDIS] Redis client initialized successfully')
    return redisClient
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ [REDIS] Failed to initialize Redis:', message)
    isConnected = false
    throw error
  }
}

/**
 * ✅ Get Redis Client Instance
 * Returns existing client or initializes if needed
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    return initializeRedis()
  }
  return redisClient
}

/**
 * ✅ Check Redis Connection Status
 */
export function isRedisConnected(): boolean {
  return isConnected && redisClient !== null
}

/**
 * ✅ Close Redis Connection (for cleanup)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit()
      console.log('✅ [REDIS] Connection closed')
      isConnected = false
      redisClient = null
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('❌ [REDIS] Error closing connection:', message)
    }
  }
}

export default getRedisClient