'use client'

import { useEffect, useState } from 'react'
import { ITag } from '@/typesDefined'
import toast from 'react-hot-toast'

export function TagManager() {
  const [tags, setTags] = useState<ITag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTag, setEditingTag] = useState<ITag | null>(null)
  const [editForm, setEditForm] = useState({ color: '', emoji: '', description: '' })

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleEditClick(tag: ITag) {
    setEditingTag(tag)
    setEditForm({
      color: tag.color,
      emoji: tag.emoji || '',
      description: tag.description || '',
    })
  }

  async function handleSaveEdit() {
    if (!editingTag) return

    try {
      const res = await fetch(`/api/tags/${editingTag.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (res.ok) {
        const data = await res.json()
        setTags(tags.map((t) => (t._id === data.tag._id ? data.tag : t)))
        setEditingTag(null)
        toast.success('Tag updated')
      }
    } catch (_error) {
      toast.error('Failed to update tag')
    }
  }

  async function handleDelete(tagName: string) {
    if (!confirm(`Delete tag #${tagName}?`)) return

    try {
      const res = await fetch(`/api/tags/${tagName}?removeFromWeeks=true`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTags(tags.filter((t) => t.name !== tagName))
        toast.success('Tag deleted')
      }
    } catch (_error) {
      toast.error('Failed to delete tag')
    }
  }

  if (isLoading) {
    return <div className="text-zinc-400">Loading tags...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Manage Tags</h3>
        <span className="text-sm text-zinc-400">{tags.length} tags</span>
      </div>

      {tags.length === 0 ? (
        <p className="text-center py-8 text-zinc-400">No tags created yet</p>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag._id.toString()}
              className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700"
            >
              {editingTag?._id === tag._id ? (
                // Edit mode
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editForm.emoji}
                      onChange={(e) =>
                        setEditForm({ ...editForm, emoji: e.target.value })
                      }
                      placeholder="Emoji"
                      className="w-12 px-2 py-1 bg-zinc-700 rounded border border-zinc-600 text-white"
                      maxLength={2}
                    />
                    <input
                      type="color"
                      value={editForm.color}
                      onChange={(e) =>
                        setEditForm({ ...editForm, color: e.target.value })
                      }
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <span className="text-white">#{tag.displayName}</span>
                  </div>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 bg-zinc-700 rounded border border-zinc-600 text-white text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTag(null)}
                      className="px-4 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex items-center gap-2">
                    {tag.emoji && <span className="text-lg">{tag.emoji}</span>}
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-white font-medium">#{tag.displayName}</span>
                  </div>
                  <div className="flex-1">
                    {tag.description && (
                      <p className="text-xs text-zinc-400">{tag.description}</p>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {tag.usageCount} week{tag.usageCount !== 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={() => handleEditClick(tag)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tag.name)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}