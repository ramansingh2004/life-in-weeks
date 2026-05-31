'use client'

import { useState, useCallback } from 'react'
import { getCompressionSavings } from '@/lib/mediaOptimization'
import { uploadMedia, UploadMediaResponse } from '@/lib/api'
interface UploadState {
  fileName: string
  progress: number
  status: 'idle' | 'compressing' | 'uploading' | 'done' | 'error'
  error?: string
  originalSize?: number
  compressedSize?: number
  savings?: string
}

interface UseMediaUploadOptions {
  weekIndex: number
  onSuccess?: (result: UploadMediaResponse) => void
  onError?: (error: Error) => void
  onProgress?: (state: UploadState) => void
}

/**
 * ✅ Custom hook for optimized media uploads
 * Handles compression, progress tracking, and error handling
 */
export function useMediaUpload(options: UseMediaUploadOptions) {
  const { weekIndex, onSuccess, onError, onProgress } = options
  const [uploadStates, setUploadStates] = useState<Map<string, UploadState>>(new Map())
  const [isUploading, setIsUploading] = useState(false)

  const updateState = useCallback((fileName: string, state: Partial<UploadState>) => {
    setUploadStates((prev) => {
      const updated = new Map(prev)
      const current = updated.get(fileName) || { fileName, progress: 0, status: 'idle' as const }
      updated.set(fileName, { ...current, ...state })
      onProgress?.({ ...current, ...state })
      return updated
    })
  }, [onProgress])

  const uploadFile = useCallback(
    async (file: File, type: 'image' | 'video' | 'audio') => {
      const fileName = file.name
      const originalSize = file.size

      try {
        setIsUploading(true)
        updateState(fileName, {
          status: 'compressing',
          progress: 0,
          originalSize,
        })

        // ✅ Upload with compression and progress tracking
        const result = await uploadMedia(
          file,
          weekIndex,
          type,
          (progress) => {
            updateState(fileName, {
              status: progress < 100 ? 'uploading' : 'done',
              progress,
            })
          }
        )

        // ✅ Calculate compression savings
        const compressedSize = result.data?.compression?.compressedSize || originalSize
        const savings = getCompressionSavings(originalSize, compressedSize)

        updateState(fileName, {
          status: 'done',
          progress: 100,
          compressedSize,
          savings,
        })

        onSuccess?.(result)

        // Auto-clear after 2 seconds
        setTimeout(() => {
          setUploadStates((prev) => {
            const updated = new Map(prev)
            updated.delete(fileName)
            return updated
          })
        }, 2000)
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Upload failed')
        updateState(fileName, {
          status: 'error',
          error: err.message,
        })
        onError?.(err)
      } finally {
        setIsUploading(false)
      }
    },
    [weekIndex, updateState, onSuccess, onError]
  )

  const uploadMultiple = useCallback(
    async (files: File[], type: 'image' | 'video' | 'audio') => {
      for (const file of files) {
        await uploadFile(file, type)
      }
    },
    [uploadFile]
  )

  const clearStates = useCallback(() => {
    setUploadStates(new Map())
  }, [])

  return {
    uploadFile,
    uploadMultiple,
    uploadStates: Array.from(uploadStates.values()),
    isUploading,
    clearStates,
  }
}

/**
 * ✅ Hook for managing upload progress across multiple files
 */
interface UploadBatch {
  totalFiles: number
  uploadedFiles: number
  totalSize: number
  uploadedSize: number
  totalSavings: string
  averageProgress: number
}

export function useMediaUploadBatch() {
  const [batch, setBatch] = useState<UploadBatch>({
    totalFiles: 0,
    uploadedFiles: 0,
    totalSize: 0,
    uploadedSize: 0,
    totalSavings: '0%',
    averageProgress: 0,
  })

  const updateBatch = useCallback(
    (state: Partial<UploadBatch>) => {
      setBatch((prev) => {
        const updated = { ...prev, ...state }
        // Calculate average progress
        if (updated.totalFiles > 0) {
          updated.averageProgress = Math.round(
            (updated.uploadedFiles / updated.totalFiles) * 100
          )
        }
        return updated
      })
    },
    []
  )

  const startBatch = useCallback((files: File[]) => {
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    updateBatch({
      totalFiles: files.length,
      uploadedFiles: 0,
      totalSize,
      uploadedSize: 0,
      totalSavings: '0%',
      averageProgress: 0,
    })
  }, [updateBatch])

  const fileUploaded = useCallback(
    (originalSize: number, compressedSize: number) => {
      setBatch((prev) => {
        const uploadedFiles = prev.uploadedFiles + 1
        const uploadedSize = prev.uploadedSize + compressedSize
        const savings = getCompressionSavings(prev.totalSize, uploadedSize)

        return {
          ...prev,
          uploadedFiles,
          uploadedSize,
          totalSavings: savings,
          averageProgress: Math.round((uploadedFiles / prev.totalFiles) * 100),
        }
      })
    },
    []
  )

  const resetBatch = useCallback(() => {
    setBatch({
      totalFiles: 0,
      uploadedFiles: 0,
      totalSize: 0,
      uploadedSize: 0,
      totalSavings: '0%',
      averageProgress: 0,
    })
  }, [])

  return {
    batch,
    startBatch,
    fileUploaded,
    resetBatch,
  }
}