'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { getOptimizedImageUrl, getThumbnailUrl, getBlurPlaceholder } from '@/lib/mediaOptimization'

interface OptimizedImageProps {
  publicId: string
  alt: string
  width?: number
  height?: number
  quality?: number
  className?: string
  onClick?: () => void
  showBlur?: boolean
}

/**
 * ✅ Optimized Image component with:
 * - Lazy loading
 * - Blur placeholders
 * - Responsive images
 * - Cloudinary transformations
 */
export default function OptimizedImage({
  publicId,
  alt,
  width = 400,
  height = 400,
  quality = 80,
  className = '',
  onClick,
  showBlur = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [blurDataUrl, setBlurDataUrl] = useState<string>('')

  useEffect(() => {
    if (showBlur) {
      // Generate blur placeholder on mount
      setBlurDataUrl(getBlurPlaceholder(publicId))
    }
  }, [publicId, showBlur])

  const imageUrl = getOptimizedImageUrl(publicId, { width, height, quality })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-lg"
      onClick={onClick}
    >
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={false}
        loading="lazy"
        blurDataURL={blurDataUrl || undefined}
        placeholder={showBlur && blurDataUrl ? 'blur' : 'empty'}
        onLoadingComplete={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
      />

      {/* ✅ Loading skeleton while image loads */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse"
        />
      )}
    </motion.div>
  )
}

/**
 * ✅ Thumbnail Image component (for galleries)
 */
interface ThumbnailProps {
  publicId: string
  alt: string
  size?: number
  className?: string
  onClick?: () => void
}

export function ThumbnailImage({
  publicId,
  alt,
  size = 150,
  className = '',
  onClick,
}: ThumbnailProps) {
  const thumbnailUrl = getThumbnailUrl(publicId, size)
  const blurUrl = getBlurPlaceholder(publicId)

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-pointer overflow-hidden rounded-lg ${className}`}
      onClick={onClick}
    >
      <Image
        src={thumbnailUrl}
        alt={alt}
        width={size}
        height={size}
        quality={75}
        loading="lazy"
        blurDataURL={blurUrl}
        placeholder="blur"
        className="w-full h-full object-cover"
      />
    </motion.div>
  )
}

/**
 * ✅ Responsive Image component (multiple sizes)
 */
interface ResponsiveImageProps {
  publicId: string
  alt: string
  className?: string
  onClick?: () => void
}

export function ResponsiveImage({ publicId, alt, className = '', onClick }: ResponsiveImageProps) {
  const [blurUrl, setBlurUrl] = useState<string>('')

  useEffect(() => {
    setBlurUrl(getBlurPlaceholder(publicId))
  }, [publicId])

  // Get image for different screen sizes
  const smallUrl = getOptimizedImageUrl(publicId, { width: 400, quality: 80 })
  const mediumUrl = getOptimizedImageUrl(publicId, { width: 800, quality: 85 })
  const largeUrl = getOptimizedImageUrl(publicId, { width: 1200, quality: 90 })

  return (
    <motion.picture onClick={onClick} className={className}>
      {/* Mobile */}
      <source media="(max-width: 640px)" srcSet={smallUrl} />
      {/* Tablet */}
      <source media="(max-width: 1024px)" srcSet={mediumUrl} />
      {/* Desktop */}
      <source media="(min-width: 1025px)" srcSet={largeUrl} />

      <img
        src={smallUrl}
        alt={alt}
        className="w-full h-full object-cover rounded-lg"
        loading="lazy"
      />
    </motion.picture>
  )
}