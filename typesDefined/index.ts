import { ObjectId } from 'mongodb';

// Week types
export interface Week  {
  index: number
  date: string
  year: number
  isPast: boolean
  isCurrent: boolean
  isFuture: boolean
  // tags: string[]
  // createdAt: Date
  // updatedAt: Date
}

export interface WeekData  {
  weekIndex: number
  date: string
  isPast: boolean
  isCurrent: boolean
  note: string
  mood: number
  tags: string[]
}

// Mood types
export type MoodLevel = 0 | 1 | 2 | 3 | 4 | 5

export const MOOD_LABELS: Record<number, string> = {
  0: "",
  1: "Terrible",
  2: "Bad",
  3: "Okay",
  4: "Good",
  5: "Amazing",
}

export const MOOD_COLORS: Record<number, string> = {
  1: "bg-red-900",
  2: "bg-orange-900",
  3: "bg-yellow-900",
  4: "bg-green-900",
  5: "bg-emerald-700",
}

export const MOOD_TEXT_COLORS: Record<number, string> = {
  1: "text-red-400",
  2: "text-orange-400",
  3: "text-yellow-400",
  4: "text-green-400",
  5: "text-emerald-400",
}

export interface LifeStore  {
  birthDate: string
  lifeExpectancy: number
  notes: Record<number, WeekData>
  isSynced: boolean
 
  setBirthDate: (date: string) => void
  setLifeExpectancy: (years: number) => void
  saveNote: (data: WeekData) => Promise<void>
  getNote: (weekIndex: number) => WeekData | undefined
  hasNote: (weekIndex: number) => boolean
  syncFromBackend: () => Promise<void>
  reset: () => void
}

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  googleId?: string | null
  image?: string | null
  birthDate?: string
  lifeExpectancy: number
  isEmailVerified: boolean
  emailVerificationToken?: string | null
  emailVerificationExpires?: Date | null
  createdAt: Date
  updatedAt?: Date
}


export interface IWeek {
  _id: string
  userId: string
  weekIndex: number
  note: string
  mood: number
  isPast: boolean
  isCurrent: boolean
  date: string
  tags: string[]               // Array of tag names ["college", "family"]
  createdAt: Date
  updatedAt: Date
}

export interface IMedia {
  _id: string
  userId: string
  weekIndex: number
  type: "image" | "video" | "audio"
  url: string
  publicId: string
  name: string
  createdAt: Date
}

export interface User  {
  id: string
  name: string
  email: string
  birthDate?: string
  lifeExpectancy: number
}

export type AuthStore = {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  career: { bg: "bg-blue-900/30", text: "text-blue-400", icon: "💼" },
  education: { bg: "bg-purple-900/30", text: "text-purple-400", icon: "🎓" },
  health: { bg: "bg-green-900/30", text: "text-green-400", icon: "💪" },
  family: { bg: "bg-pink-900/30", text: "text-pink-400", icon: "👨‍👩‍👧‍👦" },
  travel: { bg: "bg-amber-900/30", text: "text-amber-400", icon: "✈️" },
  personal: { bg: "bg-yellow-900/30", text: "text-yellow-400", icon: "✨" },
  other: { bg: "bg-zinc-800/30", text: "text-zinc-400", icon: "📌" },
}

export interface IMilestone {
  _id: string
  userId: string
  weekIndex: number
  title: string
  description: string
  category: "career" | "education" | "health" | "family" | "travel" | "personal" | "other"
  icon: string
  date: string // ISO date
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ITag {
  _id: ObjectId
  userId: ObjectId
  name: string                  // "college" (lowercase, no #)
  displayName: string           // "College" (user-friendly)
  color: string                 // hex color for UI (#FF6B6B)
  description?: string          // "My college years 2020-2024"
  emoji?: string               // Optional emoji 🎓
  usageCount: number           // How many weeks tagged
  createdAt: Date
  updatedAt: Date
}

export interface TagPillProps {
  name: string
  color?: string
  emoji?: string
  onClick?: () => void
  onRemove?: () => void
  showCount?: number
}

export interface LifeChapter {
  userId: ObjectId
  startWeek: number
  endWeek: number
  title: string
  emoji: string
  description: string
  keyTags: string[]
  averageMood: number
  photoCount: number
  milestoneCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Chapter {
  _id: string
  startWeek: number
  endWeek: number
  title: string
  emoji: string
  description: string
  keyTags: string[]
  averageMood: number
  photoCount: number
  milestoneCount: number
}

export interface StatsCard {
  type: 'summary' | 'mood' | 'milestones' | 'travel' | 'chapter' | 'progress'
  theme: 'dark' | 'light' | 'gradient' | 'neon'
  format: 'square' | 'story' | 'rect' // 1080x1080, 1080x1350, 1200x630
  data: any
}