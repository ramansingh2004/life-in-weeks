import { IUser, IWeek, IMilestone, ITag } from '@/typesDefined'

// ✅ AUTH TYPES
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: IUser
  token: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  birthDate?: string
  lifeExpectancy?: number
}

export interface RegisterResponse {
  id: string
  email: string
  name: string
  message: string
}

export interface ProfileUpdateRequest {
  name?: string
  email?: string
  birthDate?: string
  lifeExpectancy?: number
  image?: string
}

export interface ProfileUpdateResponse {
  user: IUser
}

export interface VerifyEmailRequest {
  token: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ✅ WEEK TYPES
export interface WeekSaveRequest {
  weekIndex: number
  date: string
  isPast: boolean
  isCurrent: boolean
  note?: string
  mood?: number
  tags?: string[]
}

export interface WeekListResponse {
  weeks: IWeek[]
  count: number
  total?: number
  pagination?: {
    limit: number
    skip: number
    hasMore: boolean
  }
}

export interface WeekUpdateRequest {
  note?: string
  mood?: number
  tags?: string[]
}

// ✅ MILESTONE TYPES
export interface MilestoneCreateRequest {
  weekIndex: number
  title: string
  description?: string
  category: 'career' | 'education' | 'health' | 'family' | 'travel' | 'personal' | 'other'
  icon?: string
  date: string
  tags?: string[]
}

export interface MilestoneUpdateRequest {
  title?: string
  description?: string
  category?: string
  icon?: string
  date?: string
  tags?: string[]
}

export interface MilestoneListResponse {
  milestones: IMilestone[]
  count: number
  total?: number
}

// ✅ TAG TYPES
export interface TagCreateRequest {
  name: string
  displayName: string
  color?: string
  emoji?: string
  description?: string
}

export interface TagUpdateRequest {
  displayName?: string
  color?: string
  emoji?: string
  description?: string
}

export interface TagListResponse {
  tags: ITag[]
  count: number
  total?: number
}

export interface TagSearchResponse {
  tags: ITag[]
  count: number
}

// ✅ MEDIA TYPES
export interface MediaUploadRequest {
  file: File
  weekIndex: number
  type: 'image' | 'video' | 'audio'
  name?: string
}

export interface MediaResponse {
  _id: string
  userId: string
  weekIndex: number
  type: 'image' | 'video' | 'audio'
  url: string
  publicId: string
  name: string
  createdAt: Date
}

export interface MediaListResponse {
  media: MediaResponse[]
  count: number
  total?: number
}

// ✅ ERROR RESPONSE (from your API)
export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code: string
    details?: unknown
  }
}

// ✅ SUCCESS RESPONSE (generic)
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}