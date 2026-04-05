"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()
  const [birthDate, setBirthDate] = useState("")
  const [lifeExpectancy, setLifeExpectancy] = useState("80")
  const [error, setError] = useState("")

  function handleStart() {
    if (!birthDate) {
      setError("Please enter your birth date")
      return
    }
    if (new Date(birthDate) > new Date()) {
      setError("Birth date cannot be in the future")
      return
    }
    localStorage.setItem("birthDate", birthDate)
    localStorage.setItem("lifeExpectancy", lifeExpectancy)
    router.push("/grid")
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md w-full"
      >
        {/* Title */}
        <h1 className="text-5xl font-light text-white mb-3 tracking-tight">
          Life in Weeks
        </h1>
        <p className="text-zinc-500 text-sm mb-12 leading-relaxed">
          Every square is one week of your life.
          <br />How many do you have left?
        </p>

        {/* Form */}
        <div className="space-y-4 text-left">

          <div>
            <label className="text-zinc-400 text-xs uppercase tracking-widest block mb-2">
              Your birth date
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={e => {
                setBirthDate(e.target.value)
                setError("")
              }}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-zinc-400 text-xs uppercase tracking-widest block mb-2">
              Life expectancy (years)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="20"
                max="100"
                value={lifeExpectancy}
                onChange={e => setLifeExpectancy(e.target.value)}
                className="flex-1 accent-white"
              />
              <span className="text-white text-sm w-8 text-right">
                {lifeExpectancy}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full bg-white text-black rounded-lg py-3 text-sm font-medium mt-4 hover:bg-zinc-100 transition-colors"
          >
            See my life →
          </motion.button>
        </div>

        {/* Footer note */}
        <p className="text-zinc-700 text-xs mt-10">
          Your data never leaves your device.
        </p>
      </motion.div>

    </main>
  )
}