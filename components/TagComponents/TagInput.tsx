'use client'

import { useState, useEffect, useRef } from 'react'
import { ITag } from '@/typesDefined'
import toast from 'react-hot-toast'

interface TagInputProps {
  tags: string[]                        // Current tag names like ["college", "family"]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onTagsChange, placeholder = 'Add tags...' }: TagInputProps) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<ITag[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions as user types
  useEffect(() => {
    if (input.length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    async function fetchSuggestions() {
    try {
      const res = await fetch(`/api/tags/search?q=${encodeURIComponent(input)}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.tags || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  }

    fetchSuggestions()
  }, [input])

  function handleAddTag(tagName: string) {
    const normalized = tagName.toLowerCase().replace(/^#/, '')
    if (!tags.includes(normalized) && tags.length < 10) {
      onTagsChange([...tags, normalized])
    }
    setInput('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  function handleRemoveTag(tagName: string) {
    onTagsChange(tags.filter((t) => t !== tagName))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      handleAddTag(input)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900 text-emerald-200 rounded-full text-sm"
            >
              <span>#{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-emerald-100 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => input.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          maxLength={20}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
          >
            {suggestions.map((tag) => (
              <button
                key={tag._id.toString()}
                onClick={() => handleAddTag(tag.name)}
                className="w-full text-left px-4 py-2 hover:bg-zinc-700 transition flex items-center gap-2"
              >
                {tag.emoji && <span>{tag.emoji}</span>}
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-white">#{tag.displayName}</span>
                <span className="text-xs text-zinc-400 ml-auto">
                  {tag.usageCount}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Quick add button */}
        {input.trim() && (
          <button
            onClick={() => handleAddTag(input)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition"
          >
            Add
          </button>
        )}
      </div>

      <p className="text-xs text-zinc-400">
        {tags.length}/10 tags • Press Enter or click Add
      </p>
    </div>
  )
}