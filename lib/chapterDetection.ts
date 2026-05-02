
type WeekData = {
  weekIndex: number
  mood: number
  tags?: string[]
  note: string
}

export interface DetectedChapter {
  startWeek: number
  endWeek: number
  reason: 'tag_change' | 'mood_shift' | 'milestone' | 'activity_change'
  confidence: number
}

/**
 * Detects potential chapter breaks in life data
 */
export function detectChapterBreaks(weeks: WeekData[]): DetectedChapter[] {
  if (weeks.length === 0) return []

  const breaks: DetectedChapter[] = []

  // Find tag transitions
  for (let i = 1; i < weeks.length; i++) {
    const prev = weeks[i - 1]
    const curr = weeks[i]

    // Check for major tag change
    const prevTags = new Set(prev.tags || [])
    const currTags = new Set(curr.tags || [])
    const newTags = [...currTags].filter(tag => !prevTags.has(tag))

    if (newTags.length >= 2) {
      breaks.push({
        startWeek: curr.weekIndex,
        endWeek: curr.weekIndex,
        reason: 'tag_change',
        confidence: Math.min(newTags.length / 3, 1), // More new tags = higher confidence
      })
    }

    // Check for major mood shift
    const moodDiff = Math.abs(curr.mood - prev.mood)
    if (moodDiff >= 2) {
      // Mood jumped by 2+ points
      breaks.push({
        startWeek: curr.weekIndex,
        endWeek: curr.weekIndex,
        reason: 'mood_shift',
        confidence: Math.min(moodDiff / 5, 1),
      })
    }

    // Check for activity surge
    const prevNoteLength = prev.note?.length || 0
    const currNoteLength = curr.note?.length || 0
    const activityRatio = prevNoteLength > 0 ? currNoteLength / prevNoteLength : 2

    if (activityRatio > 3 || activityRatio < 0.33) {
      breaks.push({
        startWeek: curr.weekIndex,
        endWeek: curr.weekIndex,
        reason: 'activity_change',
        confidence: Math.min(Math.abs(Math.log(activityRatio)) / 2, 1),
      })
    }
  }

  // Merge nearby breaks into chapter boundaries
  const mergedBreaks = mergeNearbyBreaks(breaks)

  return mergedBreaks
}

/**
 * Merges breaks that are close together to avoid fragmentation
 */
function mergeNearbyBreaks(breaks: DetectedChapter[], threshold = 10): DetectedChapter[] {
  if (breaks.length === 0) return []

  const sorted = [...breaks].sort((a, b) => a.startWeek - b.startWeek)
  const merged: DetectedChapter[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]
    const current = sorted[i]

    // If breaks are within 10 weeks and have similar confidence, merge
    if (current.startWeek - last.startWeek <= threshold) {
      // Merge: take highest confidence reason
      if (current.confidence > last.confidence) {
        merged[merged.length - 1] = {
          startWeek: last.startWeek,
          endWeek: current.endWeek,
          reason: current.reason,
          confidence: current.confidence,
        }
      }
    } else {
      merged.push(current)
    }
  }

  return merged
}

/**
 * Generates chapter title and emoji based on tags and mood
 */
export function generateChapterTitle(
  tags: string[],
  averageMood: number,
): { title: string; emoji: string } {
  const tagSet = new Set(tags.map(t => t.toLowerCase()))

  // Title mapping
  const titleMap: { [key: string]: { title: string; emoji: string } } = {
    college: { title: 'The College Years', emoji: '🎓' },
    work: { title: 'Professional Journey', emoji: '💼' },
    travel: { title: 'Adventures & Exploration', emoji: '✈️' },
    family: { title: 'Family Time', emoji: '👨‍👩‍👧‍👦' },
    love: { title: 'Love & Relationships', emoji: '💕' },
    fitness: { title: 'Health & Growth', emoji: '💪' },
    learning: { title: 'Growth & Learning', emoji: '📚' },
    friendship: { title: 'Friendship Era', emoji: '👯' },
    home: { title: 'Building Home', emoji: '🏡' },
    achievement: { title: 'Accomplishments', emoji: '🏆' },
  }

  // Find matching tag
  for (const [tag, info] of Object.entries(titleMap)) {
    if (tagSet.has(tag)) {
      return info
    }
  }

  // Fallback based on mood
  if (averageMood >= 4) {
    return { title: 'Golden Times', emoji: '✨' }
  } else if (averageMood >= 3) {
    return { title: 'Growth Period', emoji: '🌱' }
  } else {
    return { title: 'Challenging Times', emoji: '⛰️' }
  }
}

/**
 * Generates chapter description from top keywords
 */
export function generateChapterDescription(tags: string[]): string {
  const keywordMap: { [key: string]: string } = {
    college: 'academic growth, friendships, and learning',
    work: 'professional development and career progress',
    travel: 'exploration, new experiences, and adventure',
    family: 'quality time with loved ones',
    love: 'deepening relationships and emotional connections',
    fitness: 'health improvements and personal strength',
    learning: 'skill development and knowledge acquisition',
    friendship: 'meaningful friendships and social growth',
    home: 'building stability and establishing roots',
    achievement: 'reaching goals and celebrating wins',
  }

  const topTags = tags.slice(0, 3)
  const descriptions = topTags
    .map(tag => keywordMap[tag.toLowerCase()])
    .filter(Boolean)

  if (descriptions.length > 0) {
    return `A chapter filled with ${descriptions.join(', ')}.`
  }

  return 'A period of growth and discovery in your life.'
}