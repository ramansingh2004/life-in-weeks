"use client"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { uploadMedia, getWeekMedia, deleteMedia } from "@/lib/api"

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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMedia()
  }, [weekIndex])

  async function loadMedia() {
    try {
      const { media } = await getWeekMedia(weekIndex)
      setMediaItems(media)
    } catch {
      console.error("Failed to load media")
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setError("")
    setUploading(true)

    for (const file of files) {
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > 50) { setError(`${file.name} exceeds 50MB`); continue }

      const type = file.type.startsWith("image") ? "image"
        : file.type.startsWith("video") ? "video"
        : file.type.startsWith("audio") ? "audio"
        : null

      if (!type) { setError("Unsupported file type"); continue }

      try {
        await uploadMedia(file, weekIndex, type)
      } catch {
        setError("Upload failed. Try again.")
      }
    }

    setUploading(false)
    await loadMedia()
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleDelete(item: MediaItem) {
    try {
      await deleteMedia(item._id)
      await loadMedia()
    } catch {
      setError("Delete failed")
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunks.current = []

      recorder.ondataavailable = e => audioChunks.current.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" })
        const file = new File([blob], `Voice note ${new Date().toLocaleString()}.webm`, { type: "audio/webm" })
        await uploadMedia(file, weekIndex, "audio")
        stream.getTracks().forEach(t => t.stop())
        await loadMedia()
      }

      recorder.start()
      setMediaRecorder(recorder)
      setRecording(true)
    } catch {
      setError("Microphone access denied.")
    }
  }

  function stopRecording() {
    mediaRecorder?.stop()
    setRecording(false)
    setMediaRecorder(null)
  }

  const images = mediaItems.filter(m => m.type === "image")
  const videos = mediaItems.filter(m => m.type === "video")
  const audios = mediaItems.filter(m => m.type === "audio")

  return (
    <div className="mt-4">

      {/* Upload buttons */}
      <div className="flex gap-2 flex-wrap mb-4">
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
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:border-zinc-500 transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "＋ Photo / Video"}
        </button>
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
            recording
              ? "border-red-500 text-red-400 animate-pulse"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
          }`}
        >
          {recording ? "⏹ Stop recording" : "🎙 Record audio"}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {/* Images */}
      {images.length > 0 && (
        <div className="mb-4">
          <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">Photos</p>
          <div className="grid grid-cols-3 gap-2">
            {images.map(item => (
              <div key={item._id} className="relative group aspect-square">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg cursor-pointer"
                  onClick={() => setPreview(item)}
                />
                <button
                  onClick={() => handleDelete(item)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div className="mb-4">
          <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">Videos</p>
          <div className="space-y-2">
            {videos.map(item => (
              <div key={item._id} className="relative group">
                <video src={item.url} controls className="w-full rounded-lg max-h-48 bg-zinc-900" />
                <button
                  onClick={() => handleDelete(item)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio */}
      {audios.length > 0 && (
        <div className="mb-4">
          <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">Audio</p>
          <div className="space-y-2">
            {audios.map(item => (
              <div key={item._id} className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-3 py-2">
                <audio src={item.url} controls className="flex-1 h-8" />
                <button
                  onClick={() => handleDelete(item)}
                  className="text-zinc-600 hover:text-zinc-400 text-lg transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={preview.url}
              alt={preview.name}
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={() => setPreview(null)} className="absolute top-4 right-4 text-white text-2xl">×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}