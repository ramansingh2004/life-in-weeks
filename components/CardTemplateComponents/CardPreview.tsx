'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import domtoimage from 'dom-to-image'
import { Download, Copy, Check } from 'lucide-react'

interface CardPreviewProps {
  card: React.ReactNode
  format: 'square' | 'story' | 'rect'
  cardType: string
}

const FORMAT_DIMS = {
  square: { width: 1080, height: 1080, ratio: '1:1', platform: 'Instagram' },
  story: { width: 1080, height: 1920, ratio: '9:16', platform: 'Instagram/TikTok' },
  rect: { width: 1200, height: 630, ratio: '16:9', platform: 'Twitter/Facebook' },
}

export function CardPreview({ card, format, cardType }: CardPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const dims = FORMAT_DIMS[format]
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>(
    'idle'
  )

  async function downloadCard() {
    if (!cardRef.current) return

    setIsDownloading(true)
    setDownloadStatus('downloading')

    try {
      const scale = 2
      const dataUrl = await domtoimage.toPng(cardRef.current, {
        quality: 0.95,
        width: cardRef.current.offsetWidth * scale,
        height: cardRef.current.offsetHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        },
      })

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `life-stats-${cardType}-${format}-${Date.now()}.png`
      link.click()

      setDownloadStatus('success')
      setTimeout(() => setDownloadStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to download card:', error)
      setDownloadStatus('error')
      setTimeout(() => setDownloadStatus('idle'), 2000)
    } finally {
      setIsDownloading(false)
    }
  }

  async function copyToClipboard() {
    if (!cardRef.current) return

    try {
      const scale = 2
      const dataUrl = await domtoimage.toPng(cardRef.current, {
        quality: 0.95,
        width: cardRef.current.offsetWidth * scale,
        height: cardRef.current.offsetHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        },
      })

      const response = await fetch(dataUrl)
      const blob = await response.blob()

      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])

      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy card:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Preview Container */}
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl p-8 flex items-center justify-center min-h-[500px] overflow-auto shadow-2xl">
        <div
          ref={cardRef}
          style={{
            width: `${dims.width}px`,
            height: `${dims.height}px`,
          }}
          className="flex items-center justify-center rounded-lg overflow-hidden shadow-2xl flex-shrink-0"
        >
          {card}
        </div>
      </div>

      {/* Format Info Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-4 gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
      >
        <div className="text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Format</p>
          <p className="text-sm font-light">{dims.ratio}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Platform</p>
          <p className="text-sm font-light">{dims.platform}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Size</p>
          <p className="text-sm font-light">{dims.width}x{dims.height}px</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Type</p>
          <p className="text-sm font-light">PNG • Transparent</p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3"
      >
        {/* Download Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={downloadCard}
          disabled={isDownloading || downloadStatus !== 'idle'}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            downloadStatus === 'success'
              ? 'bg-emerald-600 text-white'
              : downloadStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <AnimatePresence mode="wait">
            {downloadStatus === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Downloaded</span>
              </motion.div>
            ) : downloadStatus === 'error' ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <span>Failed</span>
              </motion.div>
            ) : (
              <motion.div
                key="download"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Copy Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={copyToClipboard}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            isCopied
              ? 'bg-blue-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <AnimatePresence mode="wait">
            {isCopied ? (
              <motion.div
                key="copied"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Copied</span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg"
      >
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-400 flex items-center gap-2">
            <span>💡</span> Pro Tips
          </p>
          <ul className="text-xs text-zinc-500 space-y-1 ml-4">
            <li>• Download works best in Chrome/Edge browsers</li>
            <li>• PNG format supports transparent backgrounds</li>
            <li>• Paste directly into social media or design tools</li>
            <li>• Use different formats for different platforms</li>
          </ul>
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-zinc-600"
      >
        <p>
          Share your stats on{' '}
          <a href="#" className="text-emerald-400 hover:text-emerald-300 transition">
            Twitter
          </a>
          {' '}&{' '}
          <a href="#" className="text-blue-400 hover:text-blue-300 transition">
            Instagram
          </a>
        </p>
      </motion.div>
    </motion.div>
  )
}