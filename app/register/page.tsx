"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError("")

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required"); return
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match"); return
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters"); return
    }

    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    // Fetch user after registration
    const meRes = await fetch("/api/auth/me")
    const meData = await meRes.json()
    setUser(meData.user)

    router.push("/")
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">
            Create account
          </h1>
          <p className="text-zinc-500 text-sm">
            Start mapping your life in weeks
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
          />
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-400 text-xs"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white text-black rounded-xl py-3 text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Creating account..." : "Create account →"}
          </motion.button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-700 text-xs">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Sign in link */}
        <p className="text-zinc-600 text-xs text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </p>

        {/* Privacy */}
        <p className="text-zinc-800 text-xs text-center mt-6">
          Your data is stored securely in the cloud
        </p>
      </motion.div>
    </main>
  )
}