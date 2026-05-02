"use client"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { uploadMedia, getWeekMedia, deleteMedia } from "@/lib/api"
import Image from "next/image"

type MediaItem = {
  _id: string
  type: "image" | "video" | "audio"
  url: string
  name: string
}

type Props = { weekIndex: number }

export default function MediaUploader({ weekIndex }: Props) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<MediaItem | null>(null)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function loadMedia() {
      try {
        const { media } = await getWeekMedia(weekIndex)
        setMediaItems(media || [])
      } catch (err) {
        console.error("Failed to load media:", err)
      }
    }

    loadMedia()
  }, [weekIndex])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setError("")
    setUploading(true)

    for (const file of files) {
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > 100) {
        setError(`${file.name} exceeds 100MB limit`)
        continue
      }

      const type = file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
        ? "audio"
        : null

      if (!type) {
        setError(`${file.name}: Unsupported file type`)
        continue
      }

      try {
        console.log(`📤 Uploading ${type}: ${file.name}`)
        await uploadMedia(file, weekIndex, type)
        console.log(`✅ ${file.name} uploaded`)
      } catch (err) {
        console.error("Upload error:", err)
        setError(`Failed to upload ${file.name}`)
      }
    }

    setUploading(false)
    
    // Reload media after uploads
    try {
      const { media } = await getWeekMedia(weekIndex)
      setMediaItems(media || [])
    } catch (err) {
      console.error("Failed to reload media:", err)
    }
    
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete ${item.name}?`)) return

    try {
      await deleteMedia(item._id)
      // Reload media after deletion
      const { media } = await getWeekMedia(weekIndex)
      setMediaItems(media || [])
    } catch (err) {
      console.error("Delete error:", err)
      setError("Failed to delete media")
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunks.current = []
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)

      recorder.ondataavailable = (e) => audioChunks.current.push(e.data)

      recorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current)
        setRecordingTime(0)

        const blob = new Blob(audioChunks.current, { type: "audio/webm" })
        const file = new File([blob], `Voice note ${new Date().toLocaleString()}.webm`, {
          type: "audio/webm",
        })

        try {
          await uploadMedia(file, weekIndex, "audio")
          // Reload media after recording
          const { media } = await getWeekMedia(weekIndex)
          setMediaItems(media || [])
        } catch (err) {
          console.error("Voice upload error:", err)
          setError("Failed to upload voice note")
        }

        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setRecording(true)
      setError("")
    } catch (err) {
      console.error("Microphone error:", err)
      setError("Microphone access denied or unavailable")
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
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const images = mediaItems.filter((m) => m.type === "image")
  const videos = mediaItems.filter((m) => m.type === "video")
  const audios = mediaItems.filter((m) => m.type === "audio")

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
          disabled={uploading || recording}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:border-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "＋ Photo / Video"}
        </button>
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={uploading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            recording
              ? "border-red-500 text-red-400 animate-pulse"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
          }`}
        >
          {recording ? `⏹ ${formatTime(recordingTime)}` : "🎙 Record audio"}
        </button>
      </div>

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

      {/* Images */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">
              Photos ({images.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {images.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  className="relative group aspect-square"
                >
                  <Image
                    src={item.url}
                    alt={item.name}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreview(item)}
                  />
                  <button
                    onClick={() => handleDelete(item)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
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
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">
              Videos ({videos.length})
            </p>
            <div className="space-y-2">
              {videos.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  className="relative group"
                >
                  <video
                    src={item.url}
                    controls
                    className="w-full rounded-lg max-h-48 bg-zinc-900"
                  />
                  <button
                    onClick={() => handleDelete(item)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
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
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">
              Audio ({audios.length})
            </p>
            <div className="space-y-2">
              {audios.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-3 py-2 group hover:bg-zinc-800/70 transition-colors"
                >
                  <audio src={item.url} controls className="flex-1 h-8" />
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-zinc-600 hover:text-red-400 text-lg transition-colors flex-shrink-0"
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
