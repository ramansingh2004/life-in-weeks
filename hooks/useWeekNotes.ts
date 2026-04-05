import { useState, useEffect } from "react"
import { WeekData } from "@/typesDefined/index"


export function useWeekNotes() {
  const [notes, setNotes] = useState<Record<number, WeekData>>({})

  useEffect(() => {
    const stored = localStorage.getItem("weekNotes")
    if (stored) setNotes(JSON.parse(stored))
  }, [])

  function saveNote(data: WeekData) {
    const updated = { ...notes, [data.weekIndex]: data }
    setNotes(updated)
    localStorage.setItem("weekNotes", JSON.stringify(updated))
  }

  function getNote(weekIndex: number): WeekData | undefined {
    return notes[weekIndex]
  }

  function hasNote(weekIndex: number): boolean {
    return !!notes[weekIndex]?.note
  }

  return { notes, saveNote, getNote, hasNote }
}