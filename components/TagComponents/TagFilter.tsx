"use client"

import { useEffect, useState } from 'react'
import { useLifeStore } from '@/store/useCapsuleStore'

interface TagFilterProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  mode?: 'single' | 'multiple'
}

interface Tag {
  _id?: string
  name: string
  displayName?: string
  color?: string
  emoji?: string
  usageCount?: number
}

export function TagFilter({
  selectedTags,
  onTagsChange,
  mode = 'multiple',
}: TagFilterProps) {
  const { notes } = useLifeStore()
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    async function fetchTags() {
    try {
      setIsLoading(true)
      
      // Debug: Log what we're trying to fetch
      console.log('🔍 TagFilter: Attempting to fetch tags from API...')

      // First, try to fetch from API
      const res = await fetch('/api/tags')
      console.log(`📡 API Response status: ${res.status}`)
      
      if (res.ok) {
        const data = await res.json()
        console.log('✅ API returned tags:', data.tags)
        
        if (data.tags && data.tags.length > 0) {
          setAllTags(data.tags)
          setDebugInfo(`Loaded ${data.tags.length} tags from API`)
          setIsLoading(false)
          return
        }
      } else {
        const error = await res.text()
        console.error('❌ API error:', res.status, error)
      }
    } catch (error) {
      console.error('❌ Failed to fetch tags from API:', error)
    }

    // Fallback: Extract tags from Zustand store (weeks)
    console.log('🔄 Falling back to extract tags from weeks...')
    const tagsFromStore = new Map<string, { count: number; displayName: string }>()

    const allNotes = Object.values(notes)
    console.log(`📋 Total weeks in store: ${allNotes.length}`)

    allNotes.forEach((note: any) => {
      if (note && note.tags && Array.isArray(note.tags)) {
        console.log(`  Week ${note.weekIndex}: tags = ${note.tags.join(', ')}`)
        
        note.tags.forEach((tag: string) => {
          const existing = tagsFromStore.get(tag)
          tagsFromStore.set(tag, {
            count: (existing?.count || 0) + 1,
            displayName: existing?.displayName || tag.charAt(0).toUpperCase() + tag.slice(1),
          })
        })
      }
    })

    const extractedTags = Array.from(tagsFromStore.entries())
      .map(([name, data]) => ({
        _id: name,
        name,
        displayName: data.displayName,
        usageCount: data.count,
        color: '#6366f1', // Default color
      }))
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))

    console.log(`📊 Extracted ${extractedTags.length} tags from store:`, extractedTags)
    setDebugInfo(`Loaded ${extractedTags.length} tags from store (API fallback)`)
    setAllTags(extractedTags)
    setIsLoading(false)
  }

    fetchTags()
  }, [notes])

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
      
      {/* Debug info */}
      {debugInfo && (
        <p className="text-xs text-zinc-500 italic">{debugInfo}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {allTags.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No tags created yet. Add tags when saving weeks!
          </p>
        ) : (
          allTags.map((tag) => (
            <button
              key={tag._id || tag.name}
              onClick={() => handleTagClick(tag.name)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                selectedTags.includes(tag.name)
                  ? 'ring-2 ring-offset-2 ring-offset-zinc-900'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: `${tag.color || '#6366f1'}20`,
                color: tag.color || '#6366f1',
                border: `1px solid ${tag.color || '#6366f1'}40`,
              }}
            >
              {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
              #{tag.displayName || tag.name}
              {tag.usageCount !== undefined && (
                <span className="ml-2 text-xs opacity-75">({tag.usageCount})</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
