'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import domtoimage from 'dom-to-image'

interface CardPreviewProps {
  card: React.ReactNode
  format: 'square' | 'story' | 'rect'
  cardType: string
}

const FORMAT_DIMS = {
  square: { width: 1080, height: 1080, ratio: '1:1' },
  story: { width: 1080, height: 1920, ratio: '9:16' },
  rect: { width: 1200, height: 630, ratio: '16:9' },
}

export function CardPreview({ card, format, cardType }: CardPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const dims = FORMAT_DIMS[format]

  async function downloadCard() {
    if (!cardRef.current) return

    try {
      const dataUrl = await domtoimage.toPng(cardRef.current, {
        quality: 0.95,
      //  scale: 2,
      })

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `life-stats-${cardType}-${Date.now()}.png`
      link.click()
    } catch (error) {
      console.error('Failed to download card:', error)
      alert('Failed to download. Please try again.')
    }
  }

  async function shareCard() {
    if (!cardRef.current) return

    try {
      const dataUrl = await domtoimage.toPng(cardRef.current, {
        quality: 0.95,
      //  scale: 2,
      })

      // Convert to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      // Copy to clipboard
      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])

      alert('✅ Card copied to clipboard! Paste it anywhere.')
    } catch (error) {
      console.error('Failed to share card:', error)
      alert('Failed to copy. Please try downloading instead.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Preview Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 flex items-center justify-center min-h-[600px] overflow-auto">
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

      {/* Info */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
        <div>
          <p className="text-xs text-zinc-500 uppercase">Format</p>
          <p className="text-sm font-light mt-1">{dims.ratio}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase">Dimensions</p>
          <p className="text-sm font-light mt-1">{dims.width}x{dims.height}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase">File Type</p>
          <p className="text-sm font-light mt-1">PNG (transparent)</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={downloadCard}
          className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
        >
          ⬇️ Download PNG
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={shareCard}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
        >
          📋 Copy to Clipboard
        </motion.button>
      </div>

      <p className="text-xs text-zinc-500 text-center">
        💡 Tip: Downloads work best in Chrome/Edge. If issues occur, try a different browser.
      </p>
    </div>
  )
}
