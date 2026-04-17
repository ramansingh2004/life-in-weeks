// Week types
export type Week = {
  index: number
  date: string
  year: number
  isPast: boolean
  isCurrent: boolean
  isFuture: boolean
}

export type WeekData = {
  weekIndex: number
  date: string
  isPast: boolean
  isCurrent: boolean
  note: string
  mood: number
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

export type LifeStore = {
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
  birthDate?: string
  lifeExpectancy: number
  createdAt: Date
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

export type User = {
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