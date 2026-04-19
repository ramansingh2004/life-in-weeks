'use client'

import { useEffect, useState } from 'react'
import { ITag } from '@/typesDefined'
import { TagPill } from './TagPill'

interface TagFilterProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  mode?: 'single' | 'multiple'
}

export function TagFilter({
  selectedTags,
  onTagsChange,
  mode = 'multiple',
}: TagFilterProps) {
  const [allTags, setAllTags] = useState<ITag[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        setAllTags(data.tags || [])
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleTagClick(tagName: string) {
    if (mode === 'single') {
      onTagsChange([tagName])
    } else {
      if (selectedTags.includes(tagName)) {
        onTagsChange(selectedTags.filter((t) => t !== tagName))
      } else {
        onTagsChange([...selectedTags, tagName])
      }
    }
  }

  if (isLoading) return <div className="text-zinc-400 text-sm">Loading tags...</div>

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
        Filter by tags
      </p>
      <div className="flex flex-wrap gap-2">
        {allTags.length === 0 ? (
          <p className="text-sm text-zinc-500">No tags created yet</p>
        ) : (
          allTags.map((tag) => (
            <button
              key={tag._id.toString()}
              onClick={() => handleTagClick(tag.name)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                selectedTags.includes(tag.name)
                  ? 'ring-2 ring-offset-2 ring-offset-zinc-900'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                borderColor: tag.color,
              }}
            >
              {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
              #{tag.displayName}
            </button>
          ))
        )}
      </div>
    </div>
  )
}