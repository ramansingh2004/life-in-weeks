'use client'
import { TagPillProps } from "@/typesDefined"

export function TagPill({
  name,
  color = '#6366f1',
  emoji,
  onClick,
  onRemove,
  showCount,
}: TagPillProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition hover:opacity-80"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {emoji && <span>{emoji}</span>}
      <span>#{name}</span>
      {showCount !== undefined && (
        <span className="ml-1 text-xs opacity-75">({showCount})</span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:text-red-400 transition"
        >
          ✕
        </button>
      )}
    </button>
  )
}