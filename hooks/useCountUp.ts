import { useEffect, useState } from "react"

export function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const steps = 40
    const increment = target / steps
    const interval = duration / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setValue(target)
        clearInterval(timer)
      } else {
        setValue(Math.floor(current))
      }
    }, interval)

    return () => clearInterval(timer)
  }, [target, duration])

  return value
}