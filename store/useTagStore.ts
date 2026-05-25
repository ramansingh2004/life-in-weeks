import { create } from 'zustand'
import { ITag } from '@/typesDefined'

interface TagStore {
  tags: ITag[]
  selectedTags: string[]
  
  fetchTags: () => Promise<void>
  setTags: (tags: ITag[]) => void
  setSelectedTags: (tags: string[]) => void
  createTag: (name: string, displayName: string) => Promise<ITag>
  deleteTag: (tagName: string) => Promise<void>
  mergeTags: (sourceName: string, targetName: string) => Promise<void>
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  selectedTags: [],

  fetchTags: async () => {
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        set({ tags: data.data?.tags || [] })
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  },

  setTags: (tags) => set({ tags }),

  setSelectedTags: (tags) => set({ selectedTags: tags }),

  createTag: async (name, displayName) => {
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    })
    const data = await res.json()
    if (data.data?.tag) {
      set({ tags: [...get().tags, data.data.tag] })
      return data.data.tag
    }
    throw new Error('Failed to create tag')
  },

  deleteTag: async (tagName) => {
    const res = await fetch(`/api/tags/${tagName}?removeFromWeeks=true`, {
      method: 'DELETE',
    })
    if (res.ok) {
      set({ tags: get().tags.filter((t) => t.name !== tagName) })
    }
  },

  mergeTags: async (sourceName, targetName) => {
    const res = await fetch(`/api/tags/${sourceName}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetTagName: targetName }),
    })
    if (res.ok) {
      await get().fetchTags()
    }
  },
}))