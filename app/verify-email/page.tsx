'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const verified = searchParams.get('verified')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (verified === 'true') {
      // Email verified - countdown to login
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push('/login')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [verified, router])

  if (verified === 'true') {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-light mb-2">Email Verified!</h1>
          <p className="text-zinc-400 mb-6">
            Your email has been verified successfully. You can now log in.
          </p>
          <p className="text-zinc-500 text-sm">
            Redirecting to login in {countdown} seconds...
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 w-full bg-white text-black py-2.5 rounded-lg font-medium hover:bg-zinc-100 transition-colors"
          >
            Go to Login Now
          </button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-6xl mb-4">📧</div>
        <h1 className="text-3xl font-light mb-2">Verify Your Email</h1>
        <p className="text-zinc-400 mb-6">
          We&apos;ve sent a verification link to your email address. Please click the link to verify your account and complete registration.
        </p>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-zinc-300">
            <strong>Didn&apos;t receive the email?</strong>
          </p>
          <ul className="text-xs text-zinc-400 mt-3 text-left space-y-2">
            <li>✓ Check your spam folder</li>
            <li>✓ Make sure you entered the correct email</li>
            <li>✓ The link expires in 24 hours</li>
          </ul>
        </div>

        <button
          onClick={() => router.push('/login')}
          className="w-full border border-zinc-700 text-zinc-400 py-2.5 rounded-lg hover:border-zinc-600 transition-colors"
        >
          Back to Login
        </button>
      </motion.div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-zinc-400">Loading...</p>
          </motion.div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
