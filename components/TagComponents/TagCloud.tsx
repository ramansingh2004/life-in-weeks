'use client'

import { useEffect, useState } from 'react'
import { ITag } from '@/typesDefined'
import { TagPill } from './TagPill'

interface TagCloudProps {
  onTagClick?: (tagName: string) => void
  limit?: number
}

export function TagCloud({ onTagClick, limit = 20 }: TagCloudProps) {
  const [tags, setTags] = useState<ITag[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
     async function fetchTags() {
    try {
      setIsLoading(true)
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags.slice(0, limit))
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setIsLoading(false)
    }
  }

    fetchTags()
  }, [limit])

  if (isLoading) return <div className="text-zinc-400">Loading tags...</div>

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400">
        No tags yet. Start tagging weeks to see them here!
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {tags.map((tag) => (
        <TagPill
          key={tag._id.toString()}
          name={tag.name}
          color={tag.color}
          emoji={tag.emoji}
          showCount={tag.usageCount}
          onClick={() => onTagClick?.(tag.name)}
        />
      ))}
    </div>
  )
}