"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useLifeStore } from "@/store/useCapsuleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { getMe } from "@/lib/api"

const QUOTES = [
  "The average person lives just 4,000 weeks.",
  "Most of your Mondays are already behind you.",
  "You have lived more weeks than you think.",
  "Time is the only currency that can't be earned back.",
]

export default function Home() {
  const router = useRouter()
  const { birthDate, lifeExpectancy, setBirthDate, setLifeExpectancy } = useLifeStore()
  const { user, setUser } = useAuthStore()
  
  const [error, setError] = useState("")
  const [started, setStarted] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Step 1: Hydrate Zustand stores
  useEffect(() => {
    setHydrated(true)
  }, [])

  // Step 2: Load user from backend if hydrated
  useEffect(() => {
    if (!hydrated) return

    async function loadUser() {
      try {
        const data = await getMe()
        if (data?.user) {
          setUser(data.user)
          // Sync birthDate & lifeExpectancy from backend
          if (data.user.birthDate) {
            setBirthDate(data.user.birthDate)
          }
          if (data.user.lifeExpectancy) {
            setLifeExpectancy(data.user.lifeExpectancy)
          }
        }
      } catch (err) {
        console.error("Failed to load user:", err)
      }
    }

    loadUser()
  }, [hydrated, setUser, setBirthDate, setLifeExpectancy])

  // Set random quote
  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length))
  }, [])

  async function handleStart() {
    if (!birthDate) {
      setError("Please enter your birth date")
      return
    }

    if (new Date(birthDate) > new Date()) {
      setError("Birth date cannot be in the future")
      return
    }

    // If NOT logged in → go to login
    if (!user) {
      localStorage.setItem(
        "tempLifeData",
        JSON.stringify({ birthDate, lifeExpectancy })
      )
      router.push("/login")
      return
    }

    // If logged in → save to backend first
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ birthDate, lifeExpectancy }),
      })

      if (!res.ok) {
        setError("Failed to save profile")
        return
      }

      // Update local store
      setBirthDate(birthDate)
      setLifeExpectancy(lifeExpectancy)

      // Navigate to grid with animation
      setStarted(true)
      setTimeout(() => router.push("/grid"), 600)
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("Failed to save profile")
    }
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-600 text-xs">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background grid decoration */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Subtle glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}
      />

      <AnimatePresence>
        {!started ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-md relative z-10 px-1"
          >
            {/* Mini grid preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-[3px] justify-center mb-10 max-w-full overflow-hidden"
            >
              {Array.from({ length: 80 * 4 }, (_, i) => (
                <div
                  key={i}
                  className={`w-[6px] h-[6px] rounded-[1px] ${
                    i < 80
                      ? "bg-zinc-500"
                      : i === 80
                      ? "bg-white animate-pulse"
                      : "bg-zinc-800"
                  }`}
                />
              ))}
            </motion.div>

            {/* Quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-zinc-600 text-xs text-center mb-8 italic"
            >
              {quoteIndex !== null && `"${QUOTES[quoteIndex]}"`}
            </motion.p>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-10"
            >
              <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight mb-3">
                Life in Weeks
              </h1>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Every square is one week of your life. <br />
                How many do you have left?
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-5"
            >
              {/* Birth date */}
              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-widest block mb-2">
                  Your birth date
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value)
                    setError("")
                  }}
                  className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors backdrop-blur-sm"
                />
              </div>

              {/* Life expectancy */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-zinc-500 text-xs uppercase tracking-widest">
                    Life expectancy
                  </label>
                  <span className="text-zinc-400 text-xs">{lifeExpectancy} years</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={lifeExpectancy}
                  onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                  className="w-full accent-white"
                />
                <div className="flex justify-between text-zinc-700 text-xs mt-1">
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-400 text-xs"
                >
                  {error}
                </motion.p>
              )}

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className="w-full bg-white text-black rounded-xl py-3.5 text-sm font-medium hover:bg-zinc-100 transition-colors mt-2"
              >
                See my life →
              </motion.button>
            </motion.div>

            {/* Features row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-10"
            >
              {[
                { icon: "◈", label: "Grid view" },
                { icon: "◎", label: "Journal" },
                { icon: "◉", label: "Stats" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-1.5">
                  <span className="text-zinc-600 text-sm">{f.icon}</span>
                  <span className="text-zinc-700 text-xs">{f.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Auth links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex justify-center gap-4 mt-8"
            >
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-zinc-700 text-xs">Signed in as {user.name}</span>
                  <button
                    onClick={async () => {
                      await useAuthStore.getState().logout()
                      setUser(null)
                    }}
                    className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
                  >
                    Sign in
                  </Link>
                  <span className="text-zinc-800 text-xs">·</span>
                  <Link
                    href="/register"
                    className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
                  >
                    Create account
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        ) : (
          /* Transition out animation */
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="flex gap-1 justify-center mb-3">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="w-2 h-2 bg-zinc-600 rounded-[1px]"
                />
              ))}
            </div>
            <p className="text-zinc-600 text-xs">Building your grid...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
