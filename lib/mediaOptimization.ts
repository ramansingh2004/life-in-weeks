'use client'

/**
 *  Client-side media optimization utilities
 * Uses Cloudinary URLs but doesn't import the Node.js SDK
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
 * Note: We build URLs directly instead of using the Cloudinary SDK
 * because the SDK has Node.js dependencies that break in the browser
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
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set')
    return ''
  }

  //  Build Cloudinary URL directly
  // https://res.cloudinary.com/{cloud}/image/upload/w_{width},h_{height},c_{crop},q_{quality},f_auto/public_id
  const transforms = [
    width && `w_${width}`,
    height && `h_${height}`,
    crop && `c_${crop}`,
    quality && `q_${quality}`,
    'f_auto', // Auto format (WebP for modern browsers)
  ]
    .filter(Boolean)
    .join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`
}

/**
 * Generate blur placeholder (low-quality base64 URL)
 */
export function getBlurPlaceholder(publicId: string): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    return ''
  }

  // ✅ 10x10 low quality image for blur effect
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_10,h_10,c_fill,q_20,f_auto/${publicId}`
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size: number = 150): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    return ''
  }

  //  Fixed size thumbnail
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${size},h_${size},c_fill,q_75,f_auto/${publicId}`
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(publicId: string) {
  const sizes = [400, 800, 1200]
  return {
    small: getOptimizedImageUrl(publicId, { width: sizes[0], quality: 80 }),
    medium: getOptimizedImageUrl(publicId, { width: sizes[1], quality: 85 }),
    large: getOptimizedImageUrl(publicId, { width: sizes[2], quality: 90 }),
    original: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`,
  }
}

/**
 * Compress image using canvas API
 * This is pure client-side and doesn't need the Cloudinary SDK
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

        // Convert to blob with quality optimization
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
 * Compress and prepare file for upload
 * Note: Actual upload to Cloudinary happens in lib/api.ts on the backend
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
  const {  type } = options

  // For images: compress before upload
  let uploadFile = file
  if (type === 'image') {
    uploadFile = await compressImage(file, onProgress)
  }

  // Get compressed file size
  const bytes = uploadFile.size

  // Return a placeholder response with compression info
  // Actual upload happens in API route
  return {
    url: '', // Will be set by API
    secureUrl: '', // Will be set by API
    publicId: '', // Will be set by API
    width: 0, // Will be set by API
    height: 0, // Will be set by API
    format: uploadFile.type,
    bytes,
    blurUrl: '', // Will be set after upload
    thumbnailUrl: '', // Will be set after upload
  }
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
  if (originalSize === 0) return '0%'
  const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1)
  return `${savings}%`
}