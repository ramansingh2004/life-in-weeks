import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/getUser'
import { Media } from '@/models/Media.model'
import { connectDB } from '@/lib/mongodb'
import cloudinary from '@/lib/cloudinary'
import { UploadApiResponse } from 'cloudinary'
import { MediaFilterSchema, MediaUploadSchema } from '@/validators/media.validator'
import { z } from 'zod'
import {
  CACHE_KEYS,
  CACHE_TTL,
  getCachedValue,
  setCachedValue,
  invalidateMediaCache,
} from '@/lib/cache'

interface MediaQuery {
  userId: string
  weekIndex?: number
  type?: string
}

interface MongoQuery {
  userId: string
  weekIndex?: number | { $gte?: number; $lte?: number }
  type?: string
}

export async function GET(req: NextRequest) {
  try {
    console.log('📷 [GET_MEDIA] Fetching media')

    await connectDB()
    console.log('✅ [GET_MEDIA] Database connected')

    const user = await getAuthUser()

    if (!user) {
      console.warn('⚠️ [GET_MEDIA] No authenticated user')
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)

    // ✅ VALIDATE QUERY PARAMS WITH ZOD
    const queryData = {
      weekIndex: searchParams.get('weekIndex') ? parseInt(searchParams.get('weekIndex')!) : undefined,
      type: (searchParams.get('type') || undefined) as 'image' | 'video' | 'audio' | undefined,
      startWeek: searchParams.get('startWeek') ? parseInt(searchParams.get('startWeek')!) : undefined,
      endWeek: searchParams.get('endWeek') ? parseInt(searchParams.get('endWeek')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      skip: searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0,
    }

    const parsed = MediaFilterSchema.safeParse(queryData)

    if (!parsed.success) {
      console.warn('⚠️ [GET_MEDIA] Validation failed:', parsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid query parameters',
            code: 'INVALID_QUERY',
            details: parsed.error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
        },
        { status: 400 }
      )
    }

    const { weekIndex, type, startWeek, endWeek, limit, skip } = parsed.data
    const userId = user.userId

    const shouldUseCache =
      !weekIndex &&
      !type &&
      startWeek === undefined &&
      endWeek === undefined &&
      skip === 0 &&
      limit === 20

    // ✅ TRY CACHE FIRST (only for default unfiltered first-page query)
    const cacheKey = CACHE_KEYS.MEDIA_LIST(userId)
    const cachedData = await getCachedValue<{
      media: unknown[]
      count: number
      total: number
    }>(cacheKey)

    if (cachedData && shouldUseCache) {
      console.log(`✅ [GET_MEDIA] Returning cached media`)
      return NextResponse.json({
        success: true,
        data: cachedData,
        pagination: {
          limit,
          skip,
          hasMore: skip + limit < cachedData.total,
        },
        cached: true,
      })
    }

    console.log('🔍 [GET_MEDIA] Fetching media for user:', userId)
    console.log('   Type filter:', type || 'none')
    console.log('   Week filter:', weekIndex || (startWeek ? `${startWeek}-${endWeek}` : 'none'))

    const query: MediaQuery = { userId }

    if (weekIndex) {
      query.weekIndex = weekIndex
    }

    if (type) {
      query.type = type
    }

    // Build MongoDB query with range if needed
    const mongoQuery: MongoQuery = query
    if (startWeek !== undefined && endWeek !== undefined) {
      mongoQuery.weekIndex = { $gte: startWeek, $lte: endWeek }
    } else if (weekIndex !== undefined) {
      mongoQuery.weekIndex = weekIndex
    }

    const media = await Media.find(mongoQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)

    const total = await Media.countDocuments(mongoQuery)

    console.log(`✅ [GET_MEDIA] Found ${media.length} media items (total: ${total})`)

    const payload = {
      media,
      count: media.length,
      total,
    }

    // Cache the default unfiltered first-page query result
    if (shouldUseCache) {
      await setCachedValue(cacheKey, payload, CACHE_TTL.MEDIA)
    }

    return NextResponse.json({
      success: true,
      data: payload,
      pagination: {
        limit,
        skip,
        hasMore: skip + limit < total,
      },
      message: `Found ${media.length} media items`,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [GET_MEDIA] Fetch media error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch media',
          code: 'FETCH_FAILED',
          ...(process.env.NODE_ENV !== 'production' && {
            details: {
              message: errorMessage,
              stack: errorStack,
            },
          }),
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📤 [POST_MEDIA] Media upload started')

    await connectDB()
    console.log('✅ [POST_MEDIA] Database connected')

    const user = await getAuthUser()

    if (!user) {
      console.warn('⚠️ [POST_MEDIA] Unauthorized')
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      )
    }

    // Parse FormData instead of JSON
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const weekIndexStr = formData.get('weekIndex') as string | null
    const typeStr = formData.get('type') as string | null
    const nameStr = formData.get('name') as string | null

    // ✅ VALIDATE UPLOAD DATA WITH ZOD (comprehensive validation)
    const uploadData = {
      file,
      weekIndex: weekIndexStr ? parseInt(weekIndexStr) : 0,
      type: (typeStr || 'image') as 'image' | 'video' | 'audio',
      name: nameStr || file?.name || 'unnamed',
    }

    const parsed = MediaUploadSchema.safeParse(uploadData)

    if (!parsed.success) {
      console.warn('⚠️ [POST_MEDIA] Validation failed:', parsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: parsed.error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
        },
        { status: 422 }
      )
    }

    const { weekIndex, type, name, file: validatedFile } = parsed.data

    const originalSize = validatedFile.size
    console.log('✅ [POST_MEDIA] File validation passed:', {
      name,
      size: originalSize,
      type: validatedFile.type,
      weekIndex,
      mediaType: type,
    })

    // Upload to Cloudinary using upload_stream with optimization
    const bytes = await validatedFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('🚀 [POST_MEDIA] Uploading to Cloudinary with optimization...')

    // ✅ ENHANCED: Use Cloudinary transformations for optimization
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'life-in-weeks',
          resource_type: 'auto',
          // ✅ Automatic optimization
          quality: 'auto',
          fetch_format: type === 'image' ? 'auto' : undefined,
          // ✅ Tags for organization
          tags: [`week-${weekIndex}`, type, 'optimized'],
          // ✅ Metadata for later retrieval
          context: {
            alt: name,
            weekIndex: String(weekIndex),
          },
        },
        (error, res) => {
          if (error) {
            console.error('❌ [POST_MEDIA] Cloudinary upload error:', error)
            reject(error)
          } else if (res) {
            console.log('✅ [POST_MEDIA] Cloudinary upload success:', res.public_id)
            console.log('   Cloudinary size:', res.bytes, 'bytes')
            console.log('   Compression ratio:', ((1 - res.bytes / originalSize) * 100).toFixed(1), '%')
            resolve(res)
          } else {
            reject(new Error('Cloudinary upload returned no result'))
          }
        }
      ).end(buffer)
    })

    const userId = user.userId

    // ✅ STORE compression metadata
    const media = await Media.create({
      userId,
      url: uploadResult.secure_url,
      name,
      type,
      weekIndex,
      publicId: uploadResult.public_id,
      // ✅ NEW: Store compression data
      metadata: {
        originalSize,
        compressedSize: uploadResult.bytes,
        compressionRatio: ((1 - uploadResult.bytes / originalSize) * 100).toFixed(1),
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      },
    })

    console.log(`✅ [POST_MEDIA] Created media: ${name} for user ${userId}`)

    // ✅ INVALIDATE CACHE
    console.log(`🔄 [CACHE] Invalidating media cache for user ${userId}, media ${media._id.toString()}`)
    await invalidateMediaCache(userId, media._id.toString())

    return NextResponse.json(
      {
        success: true,
        data: {
          media,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          compression: {
            originalSize,
            compressedSize: uploadResult.bytes,
            saved: ((1 - uploadResult.bytes / originalSize) * 100).toFixed(1) + '%',
          },
        },
        message: 'Media uploaded successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [POST_MEDIA] Upload media error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to upload media',
          code: 'UPLOAD_FAILED',
          ...(process.env.NODE_ENV !== 'production' && {
            details: {
              message: errorMessage,
              stack: errorStack,
            },
          }),
        },
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ [DELETE_MEDIA] Media deletion started')

    await connectDB()
    console.log('✅ [DELETE_MEDIA] Database connected')

    const user = await getAuthUser()

    if (!user) {
      console.warn('⚠️ [DELETE_MEDIA] Unauthorized')
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const mediaId = searchParams.get('id')

    // ✅ VALIDATE MEDIA ID WITH ZOD
    const IdSchema = z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid media ID format'),
    })

    const parsed = IdSchema.safeParse({ id: mediaId })

    if (!parsed.success) {
      console.warn('⚠️ [DELETE_MEDIA] Validation failed:', parsed.error.issues)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid media ID',
            code: 'INVALID_ID',
            details: parsed.error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
        },
        { status: 400 }
      )
    }

    const { id } = parsed.data

    console.log('🔍 [DELETE_MEDIA] Finding media:', id)

    // Find the item first to get Cloudinary publicId
    const mediaItem = await Media.findOne({
      _id: id,
      userId: user.userId,
    })

    if (!mediaItem) {
      console.warn('⚠️ [DELETE_MEDIA] Media not found:', id)
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Media not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      )
    }

    console.log('✅ [DELETE_MEDIA] Media found:', mediaItem.name)

    // Delete from Cloudinary if publicId exists
    if (mediaItem.publicId) {
      try {
        const resourceType = mediaItem.type === 'video' ? 'video' : mediaItem.type === 'audio' ? 'video' : 'image'
        await cloudinary.uploader.destroy(mediaItem.publicId, { resource_type: resourceType })
        console.log(`✅ [DELETE_MEDIA] Deleted from Cloudinary: ${mediaItem.publicId}`)
      } catch (cloudinaryErr) {
        console.error('⚠️ [DELETE_MEDIA] Failed to delete from Cloudinary:', cloudinaryErr)
      }
    }

    await Media.deleteOne({ _id: id })

    console.log(`✅ [DELETE_MEDIA] Deleted media: ${id}`)

    // ✅ INVALIDATE CACHE
    console.log(`🔄 [CACHE] Invalidating media cache for user ${user.userId}, media ${id}`)
    await invalidateMediaCache(user.userId, id)

    return NextResponse.json({
      success: true,
      data: {
        id,
        message: 'Media deleted successfully',
      },
      message: 'Media deleted successfully',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'

    console.error('❌ [DELETE_MEDIA] Delete media error:', errorMessage)
    console.error('   Stack:', errorStack)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to delete media',
          code: 'DELETE_FAILED',
          ...(process.env.NODE_ENV !== 'production' && {
            details: {
              message: errorMessage,
              stack: errorStack,
            },
          }),
        },
      },
      { status: 500 }
    )
  }
}