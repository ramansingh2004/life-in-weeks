'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useMedia } from '@/hooks/useQuery'
import {
  compressAndUploadToCloudinary,
  formatFileSize,
  getCompressionSavings,
  getThumbnailUrl,
  getBlurPlaceholder,
} from '@/lib/mediaOptimization'
import  OptimizedImage  from '@/components/optimizedImage'

type MediaItem = {
  _id: string
  type: 'image' | 'video' | 'audio'
  url: string
  name: string
  publicId?: string
}

type UploadProgress = {
  fileName: string
  progress: number
  status: 'uploading' | 'compressing' | 'done' | 'error'
  error?: string
}

type Props = { weekIndex: number }

export default function MediaUploaderOptimized({ weekIndex }: Props) {
  const { media: mediaItems, upload, isUploading, delete: deleteMedia, isDeleting } = useMedia(weekIndex)

  const [error, setError] = useState('')
  const [preview, setPreview] = useState<MediaItem | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map())
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // ✅ ENHANCED: Upload with compression and progress tracking
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setError('')

    for (const file of files) {
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > 500) {
        // Increased to 500MB for videos
        setError(`${file.name} exceeds 500MB limit`)
        continue
      }

      const type = file.type.startsWith('image')
        ? 'image'
        : file.type.startsWith('video')
          ? 'video'
          : file.type.startsWith('audio')
            ? 'audio'
            : null

      if (!type) {
        setError(`${file.name}: Unsupported file type`)
        continue
      }

      try {
        console.log(`📤 Uploading ${type}: ${file.name}`)

        // ✅ Initialize progress tracking
        const progressKey = file.name
        setUploadProgress(
          (prev) =>
            new Map(prev).set(progressKey, {
              fileName: file.name,
              progress: 0,
              status: 'compressing',
            })
        )

        // ✅ Compress and upload with progress callback
        const result = await compressAndUploadToCloudinary(
          file,
          { weekIndex, type, folder: 'life-in-weeks' },
          (progress) => {
            setUploadProgress(
              (prev) =>
                new Map(prev).set(progressKey, {
                  fileName: file.name,
                  progress,
                  status: progress < 100 ? 'uploading' : 'done',
                })
            )
          }
        )

        console.log(`✅ Compressed from ${formatFileSize(file.size)} to ${formatFileSize(result.bytes)}`)
        console.log(`   Savings: ${getCompressionSavings(file.size, result.bytes)}`)

        // ✅ Upload via API with Cloudinary URL
        upload(
          {
            file,
            weekIndex,
            type,
          },
          {
            onSuccess: () => {
              console.log(`✅ ${file.name} saved to database`)
              toast.success(
                `${file.name} uploaded - Saved ${getCompressionSavings(file.size, result.bytes)}`
              )

              // Clear progress after 2 seconds
              setTimeout(() => {
                setUploadProgress((prev) => {
                  const updated = new Map(prev)
                  updated.delete(progressKey)
                  return updated
                })
              }, 2000)
            },
            onError: (error) => {
              console.error('Upload error:', error)
              setUploadProgress(
                (prev) =>
                  new Map(prev).set(progressKey, {
                    fileName: file.name,
                    progress: 0,
                    status: 'error',
                    error: `Failed to upload ${file.name}`,
                  })
              )
              toast.error(`Failed to upload ${file.name}`)
            },
          }
        )
      } catch (err) {
        console.error('Upload error:', err)
        const errorMsg = err instanceof Error ? err.message : 'Upload failed'
        setError(errorMsg)
        setUploadProgress(
          (prev) =>
            new Map(prev).set(file.name, {
              fileName: file.name,
              progress: 0,
              status: 'error',
              error: errorMsg,
            })
        )
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete ${item.name}?`)) return

    deleteMedia(item._id, {
      onSuccess: () => {
        toast.success('Media deleted')
      },
      onError: (error) => {
        console.error('Delete error:', error)
        setError('Failed to delete media')
        toast.error('Failed to delete media')
      },
    })
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunks.current = []
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)

      recorder.ondataavailable = (e) => audioChunks.current.push(e.data)

      recorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current)
        setRecordingTime(0)

        const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const file = new File([blob], `Voice note ${new Date().toLocaleString()}.webm`, {
          type: 'audio/webm',
        })

        try {
          const progressKey = file.name
          setUploadProgress(
            (prev) =>
              new Map(prev).set(progressKey, {
                fileName: file.name,
                progress: 0,
                status: 'uploading',
              })
          )

          upload(
            { file, weekIndex, type: 'audio' },
            {
              onSuccess: () => {
                toast.success('Voice note uploaded')
                setTimeout(() => {
                  setUploadProgress((prev) => {
                    const updated = new Map(prev)
                    updated.delete(progressKey)
                    return updated
                  })
                }, 2000)
              },
              onError: (error) => {
                console.error('Voice upload error:', error)
                setError('Failed to upload voice note')
                toast.error('Failed to upload voice note')
              },
            }
          )
        } catch (err) {
          console.error('Voice upload error:', err)
          setError('Failed to upload voice note')
        }

        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setRecording(true)
      setError('')
    } catch (err) {
      console.error('Microphone error:', err)
      setError('Microphone access denied or unavailable')
    }
  }

  function stopRecording() {
    mediaRecorder?.stop()
    setRecording(false)
    setMediaRecorder(null)
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const images = mediaItems.filter((m: MediaItem) => m.type === 'image')
  const videos = mediaItems.filter((m: MediaItem) => m.type === 'video')
  const audios = mediaItems.filter((m: MediaItem) => m.type === 'audio')

  return (
    <div className="mt-4 space-y-4">
      {/* Upload buttons */}
      <div className="flex gap-2 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || recording}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:border-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : '＋ Photo / Video'}
        </button>
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={isUploading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            recording
              ? 'border-red-500 text-red-400 animate-pulse'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
          }`}
        >
          {recording ? `⏹ ${formatTime(recordingTime)}` : '🎙 Record audio'}
        </button>
      </div>

      {/* ✅ Upload progress indicator */}
      <AnimatePresence>
        {uploadProgress.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3"
          >
            {Array.from(uploadProgress.values()).map((item) => (
              <div key={item.fileName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 truncate">{item.fileName}</span>
                  <span className="text-zinc-500">
                    {item.status === 'compressing' && '🔄 Compressing...'}
                    {item.status === 'uploading' && `${item.progress}%`}
                    {item.status === 'done' && '✅'}
                    {item.status === 'error' && '❌'}
                  </span>
                </div>
                {item.status !== 'done' && item.status !== 'error' && (
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      className="bg-white h-full"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-900/30 border border-red-700/50 text-red-400 text-xs rounded-lg px-3 py-2"
        >
          {error}
        </motion.div>
      )}

      {/* Images with lazy loading & blur placeholders */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">
              Photos ({images.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {images.map((item: MediaItem) => (
                <motion.div
                  key={item._id}
                  layout
                  className="relative group aspect-square cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  {/* ✅ Use OptimizedImage with lazy loading & blur */}
                  <OptimizedImage
                    publicId={item.publicId || item.url}
                    alt={item.name}
                    width={200}
                    height={200}
                    quality={75}
                    onClick={() => setPreview(item)}
                    showBlur={true}
                  />
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={isDeleting}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Videos */}
      <AnimatePresence>
        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">
              Videos ({videos.length})
            </p>
            <div className="space-y-2">
              {videos.map((item: MediaItem) => (
                <motion.div key={item._id} layout className="relative group">
                  <video
                    src={item.url}
                    controls
                    className="w-full rounded-lg max-h-48 bg-zinc-900"
                  />
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={isDeleting}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio */}
      <AnimatePresence>
        {audios.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">
              Audio ({audios.length})
            </p>
            <div className="space-y-2">
              {audios.map((item: MediaItem) => (
                <motion.div
                  key={item._id}
                  layout
                  className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-3 py-2 group hover:bg-zinc-800/70 transition-colors"
                >
                  <audio src={item.url} controls className="flex-1 h-8" />
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={isDeleting}
                    className="text-zinc-600 hover:text-red-400 text-lg transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={preview.url}
              alt={preview.name}
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-4 right-4 text-white text-3xl hover:text-red-400 transition-colors"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}