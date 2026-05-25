import cloudinary from '@/lib/cloudinary'
import { UploadApiResponse } from 'cloudinary'

/**
 * ✅ Advanced Cloudinary transformation utilities
 * Optimizes images with compression, quality, and format conversion
 */

export interface CloudinaryImage {
  url: string
  secureUrl: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
  blurUrl: string
  thumbnailUrl: string
}

/**
 * Generate optimized image URL with transformations
 * @param publicId - Cloudinary public ID
 * @param width - Optional width
 * @param height - Optional height
 * @param quality - Quality 1-100 (default: 80)
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number
    height?: number
    quality?: number
    crop?: 'fill' | 'fit' | 'scale'
  }
): string {
  const { width, height, quality = 80, crop = 'fill' } = options || {}

  return cloudinary.url(publicId, {
    transformation: [
      {
        width,
        height,
        crop,
        quality,
        fetch_format: 'auto', // ✅ Auto-optimize format (WebP for modern browsers)
      },
    ],
  })
}

/**
 * Generate blur placeholder (low-quality base64)
 * @param publicId - Cloudinary public ID
 */
export function getBlurPlaceholder(publicId: string): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: 10,
        height: 10,
        crop: 'fill',
        quality: 20,
        fetch_format: 'auto',
      },
    ],
  })
}

/**
 * Generate thumbnail URL
 * @param publicId - Cloudinary public ID
 * @param size - Thumbnail size (default: 150)
 */
export function getThumbnailUrl(publicId: string, size: number = 150): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: size,
        height: size,
        crop: 'fill',
        quality: 75,
        fetch_format: 'auto',
      },
    ],
  })
}

/**
 * Generate responsive image URLs for different screen sizes
 * @param publicId - Cloudinary public ID
 */
export function getResponsiveImageUrls(publicId: string) {
  const sizes = [400, 800, 1200]
  return {
    small: getOptimizedImageUrl(publicId, { width: sizes[0], quality: 80 }),
    medium: getOptimizedImageUrl(publicId, { width: sizes[1], quality: 85 }),
    large: getOptimizedImageUrl(publicId, { width: sizes[2], quality: 90 }),
    original: cloudinary.url(publicId),
  }
}

/**
 * Compress and upload file to Cloudinary
 * @param file - File to upload
 * @param options - Upload options
 * @param onProgress - Progress callback (0-100)
 */
export async function compressAndUploadToCloudinary(
  file: File,
  options: {
    weekIndex: number
    type: 'image' | 'video' | 'audio'
    folder?: string
  },
  onProgress?: (progress: number) => void
): Promise<CloudinaryImage> {
  const { weekIndex, type, folder = 'life-in-weeks' } = options

  // ✅ For images: compress before upload
  let uploadFile = file
  if (type === 'image') {
    uploadFile = await compressImage(file, onProgress)
  }

  // Upload to Cloudinary
  const bytes = await uploadFile.arrayBuffer()
  const buffer = Buffer.from(bytes)

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: type === 'audio' || type === 'video' ? 'video' : 'image',
        quality: 'auto', // ✅ Auto quality optimization
        fetch_format: type === 'image' ? 'auto' : undefined, // ✅ Auto format for images
        tags: [`week-${weekIndex}`, type],
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`))
        } else if (result) {
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width || 0,
            height: result.height || 0,
            format: result.format || '',
            bytes: result.bytes || 0,
            blurUrl: getBlurPlaceholder(result.public_id),
            thumbnailUrl: getThumbnailUrl(result.public_id),
          })
        } else {
          reject(new Error('Cloudinary upload returned no result'))
        }
      }
    )

    uploadStream.end(buffer)
  })
}

/**
 * Compress image using canvas API
 * @param file - Image file
 * @param onProgress - Progress callback
 */
async function compressImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()

      img.onload = () => {
        onProgress?.(30)

        // Create canvas and compress
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // ✅ Resize large images
        const MAX_WIDTH = 2400
        const MAX_HEIGHT = 2400

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        onProgress?.(70)

        // ✅ Convert to blob with quality optimization
        canvas.toBlob(
          (blob) => {
            if (blob) {
              onProgress?.(100)
              const compressedFile = new File([blob], file.name, {
                type: 'image/webp',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/webp',
          0.8 // ✅ 80% quality for good balance
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = event.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Calculate image compression savings
 */
export function getCompressionSavings(originalSize: number, compressedSize: number): string {
  const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1)
  return `${savings}%`
}