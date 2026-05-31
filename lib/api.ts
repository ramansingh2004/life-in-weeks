import { IMedia } from '@/typesDefined'

// Weeks
export async function saveWeek(data: {
  weekIndex: number
  note: string
  mood: number
  isPast: boolean
  isCurrent: boolean
  date: string
}) {
  const res = await fetch('/api/weeks', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to save week')
  return res.json()
}

export async function getAllWeeks() {
  const res = await fetch('/api/weeks')
  if (!res.ok) throw new Error('Failed to fetch weeks')
  return res.json()
}

export interface UploadMediaResponse {
  success: boolean
  data?: {
    media: IMedia
    url: string
    publicId: string
    compression?: {
      originalSize: number
      compressedSize: number
      saved: string
    }
  }
  message?: string
}

// ✅ OPTIMIZED MEDIA FUNCTIONS

/**
 * ✅ Upload media with progress tracking and compression
 * @param file - File to upload
 * @param weekIndex - Week index for organizing media
 * @param type - Media type (image, video, audio)
 * @param onProgress - Progress callback (0-100)
 */
export async function uploadMedia(
  file: File,
  weekIndex: number,
  type: string,
  onProgress?: (progress: number) => void
): Promise<UploadMediaResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('weekIndex', String(weekIndex))
  formData.append('type', type)

  return new Promise<UploadMediaResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // ✅ Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100
        onProgress?.(Math.round(percentComplete))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 201 || xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } catch {
          console.log('Failed to parse response');
          reject(new Error('Failed to parse response'))
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload request failed'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'))
    })

    xhr.open('POST', '/api/media', true)
    xhr.send(formData)
  })
}

/**
 * ✅ Get week media with optional caching
 */
export async function getWeekMedia(weekIndex: number) {
  const res = await fetch(`/api/media?weekIndex=${weekIndex}`)
  if (!res.ok) throw new Error('Failed to fetch media')
  return res.json()
}

/**
 * ✅ Delete media by ID
 */
export async function deleteMedia(mediaId: string) {
  const res = await fetch(`/api/media?id=${mediaId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to delete media')
  return res.json()
}

// Auth
export async function getMe() {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include', // REQUIRED
  })
  if (!res.ok) return null
  return res.json()
}

export async function updateProfile(data: {
  birthDate?: string
  lifeExpectancy?: number
}) {
  const res = await fetch('/api/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}