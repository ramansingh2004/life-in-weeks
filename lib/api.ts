// Weeks
export async function saveWeek(data: {
  weekIndex: number
  note: string
  mood: number
  isPast: boolean
  isCurrent: boolean
  date: string
}) {
  const res = await fetch("/api/weeks", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to save week")
  return res.json()
}

export async function getAllWeeks() {
  const res = await fetch("/api/weeks")
  if (!res.ok) throw new Error("Failed to fetch weeks")
  return res.json()
}

// Media
export async function uploadMedia(file: File, weekIndex: number, type: string) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("weekIndex", String(weekIndex))
  formData.append("type", type)

  const res = await fetch("/api/media", {
    method: "POST",
    body: formData,
  })
  if (!res.ok) throw new Error("Failed to upload media")
  return res.json()
}

export async function getWeekMedia(weekIndex: number) {
  const res = await fetch(`/api/media?weekIndex=${weekIndex}`)
  if (!res.ok) throw new Error("Failed to fetch media")
  return res.json()
}
 
export async function deleteMedia(mediaId: string) {
  const res = await fetch("/api/media", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mediaId }),
  })
  if (!res.ok) throw new Error("Failed to delete media")
  return res.json()
}

// Auth
export async function getMe() {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include", // REQUIRED
  })
  if (!res.ok) return null
  return res.json()
}

export async function updateProfile(data: {
  birthDate?: string
  lifeExpectancy?: number
}) {
  const res = await fetch("/api/auth/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update profile")
  return res.json()
}