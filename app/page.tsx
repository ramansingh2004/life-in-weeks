'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/hooks/useQuery'
import { ArrowRight, Calendar, Zap, Eye, Lock, Share2, BarChart3, Brain } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export default function LandingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { user, isLoading: isLoadingUser } = useAuth()

  useEffect(() => {
    if ((status === 'authenticated' && session?.user) || (user && !isLoadingUser)) {
      router.push('/grid')
    }
  }, [status, session, user, isLoadingUser, router])

  return (
    <div className="min-h-screen bg-brand-black text-brand-white selection:bg-brand-orange/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-brand-black/80 backdrop-blur-md z-50 border-b border-brand-navy-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tight">Life <span className="text-brand-orange">in</span> Weeks</div>
          <div className="space-x-6">
            <Link href="/login" className="text-brand-gray hover:text-brand-orange transition-colors">Login</Link>
            <Link href="/register" className="bg-brand-orange text-brand-black px-6 py-2 rounded-lg font-semibold hover:bg-brand-orange/90 transition-colors shadow-[0_0_15px_rgba(252,163,17,0.15)] hover:shadow-[0_0_20px_rgba(252,163,17,0.3)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-brand-navy/30 via-brand-black to-brand-black"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            {...fadeInUp}
            className="text-5xl sm:text-7xl font-light mb-6 tracking-tight text-brand-white"
          >
            You Have <span className="font-extrabold text-brand-orange drop-shadow-[0_0_15px_rgba(252,163,17,0.2)]">4,160 Weeks</span> in a Lifetime
          </motion.h1>

          <motion.p
            {...fadeInUp}
            className="text-xl sm:text-2xl text-brand-gray mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Most people never see their life this way. Life in Weeks transforms your lifespan into a visual grid, helping you understand where you are, appreciate what you have, and intentionally design your future.
          </motion.p>

          <motion.div
            {...fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              href="/register"
              className="bg-brand-orange text-brand-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-orange/95 transition flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(252,163,17,0.2)] hover:shadow-[0_0_30px_rgba(252,163,17,0.45)] duration-300"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="border border-brand-orange/30 text-brand-white px-8 py-4 rounded-lg font-semibold text-lg hover:border-brand-orange/60 hover:bg-brand-navy/20 transition duration-300"
            >
              See How It Works
            </Link>
          </motion.div>

          <motion.div
            {...fadeInUp}
            className="text-brand-gray/60 text-sm space-y-2 font-light"
          >
            <p>✨ No credit card required • Start free today</p>
            <p>Join thousands visualizing and living their best life</p>
          </motion.div>
        </div>
      </motion.section>

      {/* ============ PROBLEM STATEMENT ============ */}
      <section className="py-20 px-4 sm:px-6 bg-brand-black border-t border-brand-navy-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-light mb-4 text-brand-white">The Problem With Time</h2>
              <p className="text-brand-gray text-lg">We often fail to see life for what it truly is</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Problem 1 */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-2xl p-8 hover:border-brand-orange/40 hover:bg-brand-navy/20 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
              >
                <div className="text-5xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold mb-3 text-brand-white">Time Feels Infinite</h3>
                <p className="text-brand-gray/80">
                  {"When you think in years or decades, time feels endless. \"I'll do it later\" becomes \"I'll do it eventually.\" But time isn't infinite — it's precious and finite."}
                </p>
              </motion.div>

              {/* Problem 2 */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-2xl p-8 hover:border-brand-orange/40 hover:bg-brand-navy/20 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
              >
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-3 text-brand-white">No Clear Life Vision</h3>
                <p className="text-brand-gray/80">
                  {"Without a visual representation of your life, it's hard to plan intentionally. Where are you right now? Where do you want to be? How will you get there?"}
                </p>
              </motion.div>

              {/* Problem 3 */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-2xl p-8 hover:border-brand-orange/40 hover:bg-brand-navy/20 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
              >
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-3 text-brand-white">Memories Fade Away</h3>
                <p className="text-brand-gray/80">
                  Life happens in weeks. Important moments, lessons learned, emotions felt — they blur together. Your past deserves to be remembered and honored.
                </p>
              </motion.div>

              {/* Problem 4 */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-2xl p-8 hover:border-brand-orange/40 hover:bg-brand-navy/20 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
              >
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-3 text-brand-white">Living Unconsciously</h3>
                <p className="text-brand-gray/80">
                  Most people drift through life without intentionality. Weeks pass unnoticed. Years blur together. You deserve to live consciously and deliberately.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-brand-black border-t border-brand-navy-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light mb-4 text-brand-white">How It Works</h2>
            <p className="text-brand-gray text-lg">Simple, intuitive, and transformative</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            {/* Step 1 */}
            <motion.div variants={fadeInUp} className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-brand-navy-light border border-brand-orange/30 rounded-full flex items-center justify-center text-2xl font-bold text-brand-orange shadow-[0_0_15px_rgba(252,163,17,0.1)]">
                01
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-brand-white">Visualize Your Life</h3>
                <p className="text-brand-gray text-lg">
                  Create your personal life grid. See your entire lifespan as 52 weeks per year. Each week is a small square. The bigger picture becomes clear instantly.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeInUp} className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-brand-navy-light border border-brand-orange/30 rounded-full flex items-center justify-center text-2xl font-bold text-brand-orange shadow-[0_0_15px_rgba(252,163,17,0.1)]">
                02
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-brand-white">Record Your Story</h3>
                <p className="text-brand-gray text-lg">
                  Click any week to document what happened. Was it amazing? Challenging? Mark your mood. Add photos. Write what you learned. Your life becomes a beautiful, searchable archive.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeInUp} className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-brand-navy-light border border-brand-orange/30 rounded-full flex items-center justify-center text-2xl font-bold text-brand-orange shadow-[0_0_15px_rgba(252,163,17,0.1)]">
                03
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-brand-white">Set Milestones</h3>
                <p className="text-brand-gray text-lg">
                  {"Mark important moments on your grid. Celebrations, achievements, goals. See your milestones at a glance. Celebrate how far you've come and what's still ahead."}
                </p>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div variants={fadeInUp} className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-brand-navy-light border border-brand-orange/30 rounded-full flex items-center justify-center text-2xl font-bold text-brand-orange shadow-[0_0_15px_rgba(252,163,17,0.1)]">
                04
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-brand-white">Design Your Future</h3>
                <p className="text-brand-gray text-lg">
                  {"With your life visualized, plan intentionally. What do you want in the weeks ahead? What's non-negotiable? Use your grid as a roadmap to live deliberately."}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-20 px-4 sm:px-6 bg-brand-black border-t border-brand-navy-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light mb-4 text-brand-white">Powerful Features</h2>
            <p className="text-brand-gray text-lg">Everything you need to see and live your life intentionally</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                icon: Calendar,
                title: "Life Grid",
                description: "See your entire lifespan at a glance. Every week is a small square, giving you perspective on time like never before."
              },
              {
                icon: Brain,
                title: "Memory Journal",
                description: "Record your weeks with rich text, photos, and emotions. Your memories are preserved forever, organized by week."
              },
              {
                icon: BarChart3,
                title: "Mood Tracking",
                description: "Color-code your weeks by mood. See patterns in your emotional life. Understand what brings you joy and what drains you."
              },
              {
                icon: Zap,
                title: "Milestones",
                description: "Mark the moments that matter. Track achievements, celebrations, and turning points. See your journey clearly."
              },
              {
                icon: Eye,
                title: "Timeline View",
                description: "Browse your memories chronologically. Relive your journey. See how far you've come. Remember what made you laugh."
              },
              {
                icon: Share2,
                title: "Life Chapters",
                description: "Group your weeks into chapters. Mark seasons of life. Create a narrative arc from your memories."
              },
              {
                icon: Lock,
                title: "Private & Secure",
                description: "Your life is yours alone. All data is encrypted. Only you can see your grid, memories, and milestones."
              },
              {
                icon: Eye,
                title: "Gallery & Media",
                description: "Add photos and media to your weeks. Create a visual history of your life alongside your written memories."
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-xl p-8 hover:border-brand-orange/40 hover:bg-brand-navy/20 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
              >
                <div className="w-12 h-12 bg-brand-navy-light border border-brand-navy-border/60 text-brand-orange rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand-orange" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-brand-white">{feature.title}</h3>
                <p className="text-brand-gray/80">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ SCREENSHOTS ============ */}
      <section className="py-20 px-4 sm:px-6 bg-brand-black border-t border-brand-navy-border/40">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light mb-4 text-brand-white">See It In Action</h2>
            <p className="text-brand-gray text-lg">Beautiful, intuitive interfaces designed for your life</p>
          </motion.div>

          {/* Main Screenshot Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            {/* Life Grid Screenshot */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-2xl overflow-hidden hover:border-brand-orange/40 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-brand-navy/30 to-brand-black flex flex-col items-center justify-center p-8">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="grid grid-cols-13 gap-1.5 w-full">
                    {[...Array(52)].map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-sm transition-transform duration-200 hover:scale-125 ${
                          i % 12 === 0
                            ? 'bg-brand-orange shadow-[0_0_8px_rgba(252,163,17,0.5)]'
                            : i % 8 === 0
                            ? 'bg-brand-white'
                            : i % 5 === 0
                            ? 'bg-brand-gray/50'
                            : 'bg-brand-navy-light/60 border border-brand-navy-border/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-brand-black/90 border-t border-brand-navy-border/30">
                <h3 className="text-xl font-semibold mb-2 text-brand-white">Life Grid</h3>
                <p className="text-brand-gray text-sm">Visualize your entire lifespan in one view. 4,160 weeks of your life at a glance.</p>
              </div>
            </motion.div>

            {/* Journal Entry Screenshot */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-2xl overflow-hidden hover:border-brand-orange/40 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-brand-navy/30 to-brand-black flex flex-col p-8">
                <div className="mb-6">
                  <div className="h-2 bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange rounded-full w-full mb-4 shadow-[0_0_10px_rgba(252,163,17,0.3)]"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-brand-navy-light/80 rounded w-3/4"></div>
                    <div className="h-3 bg-brand-navy-light/80 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="h-2 bg-brand-navy-light/80 rounded w-full"></div>
                  <div className="h-2 bg-brand-navy-light/80 rounded w-5/6"></div>
                  <div className="h-2 bg-brand-navy-light/80 rounded w-4/5"></div>
                  <div className="h-2 bg-brand-navy-light/80 rounded w-3/4"></div>
                </div>
                <div className="flex gap-2 mt-6">
                  <div className="w-12 h-12 bg-brand-navy-light border border-brand-navy-border/50 rounded-lg"></div>
                  <div className="w-12 h-12 bg-brand-navy-light border border-brand-navy-border/50 rounded-lg"></div>
                </div>
              </div>
              <div className="p-6 bg-brand-black/90 border-t border-brand-navy-border/30">
                <h3 className="text-xl font-semibold mb-2 text-brand-white">Memory Journal</h3>
                <p className="text-brand-gray text-sm">Document your weeks with rich text, photos, mood tracking, and tags.</p>
              </div>
            </motion.div>

            {/* Timeline Screenshot */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-2xl overflow-hidden hover:border-brand-orange/40 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-brand-navy/30 to-brand-black flex flex-col p-8 justify-center">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-3 h-3 bg-brand-orange rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(252,163,17,0.5)]"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-brand-navy-light/80 rounded w-2/3 mb-2"></div>
                        <div className="h-2 bg-brand-navy-light/80 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-brand-black/90 border-t border-brand-navy-border/30">
                <h3 className="text-xl font-semibold mb-2 text-brand-white">Timeline View</h3>
                <p className="text-brand-gray text-sm">Browse your entire life chronologically. Rediscover memories and celebrate milestones.</p>
              </div>
            </motion.div>

            {/* Statistics Screenshot */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-2xl overflow-hidden hover:border-brand-orange/40 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-brand-navy/30 to-brand-black flex flex-col p-8 justify-center">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end gap-1.5 h-32">
                      {[65, 45, 72, 35, 58, 68, 42].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80 ${
                            i % 3 === 0 ? 'bg-brand-orange shadow-[0_0_8px_rgba(252,163,17,0.3)]' : i % 3 === 1 ? 'bg-brand-white' : 'bg-brand-navy-light'
                          }`}
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="text-xs text-brand-gray/60 mt-3 text-center">Mood Pattern</div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-brand-black/90 border-t border-brand-navy-border/30">
                <h3 className="text-xl font-semibold mb-2 text-brand-white">Analytics & Insights</h3>
                <p className="text-brand-gray text-sm">See patterns in your mood, productivity, and life satisfaction over time.</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Secondary Feature Screenshots */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Milestones",
                desc: "Mark achievements and celebrate victories"
              },
              {
                title: "Life Chapters",
                desc: "Group weeks into meaningful seasons"
              },
              {
                title: "Media Gallery",
                desc: "Store photos and memories together"
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-xl p-6 hover:border-brand-orange/40 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
              >
                <div className="aspect-video bg-gradient-to-br from-brand-navy-light to-brand-black border border-brand-navy-border/30 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-4xl transform transition-transform duration-300 hover:scale-110">
                    {idx === 0 ? '🏆' : idx === 1 ? '📖' : '📷'}
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-brand-white">{item.title}</h3>
                <p className="text-brand-gray text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ BENEFITS ============ */}
      <section className="py-20 px-4 sm:px-6 bg-brand-black border-t border-brand-navy-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light mb-4 text-brand-white">Why Life in Weeks Changes Everything</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {[
              {
                title: "🎯 Gain Perspective",
                description: "Seeing your entire life as 52 weeks per year creates an immediate aha moment. Time becomes tangible. You stop taking it for granted."
              },
              {
                title: "💪 Live Intentionally",
                description: "With your life visualized, you plan differently. What matters gets prioritized. What drains you gets eliminated. You design your life instead of drifting."
              },
              {
                title: "📚 Preserve Your Story",
                description: "Your weeks are filled with lessons, joy, and growth. Life in Weeks captures that. Your memories become searchable, organized, and sacred."
              },
              {
                title: "✨ See Your Progress",
                description: "Milestones on your grid show how much you've accomplished. Looking back, you realize you're stronger, wiser, and further along than you thought."
              },
              {
                title: "❤️ Appreciate the Present",
                description: "When you see time as finite, this week becomes precious. You don't wait for perfect conditions. You live now, more fully and intentionally."
              },
              {
                title: "🚀 Plan Your Future",
                description: "The weeks ahead are visible. You can plan meaningful goals. Set milestones. Design the future you want, not the one that happens to you."
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-lg p-6 hover:border-brand-orange/40 hover:shadow-[0_4px_25px_rgba(252,163,17,0.03)] transition duration-300"
              >
                <h3 className="text-xl font-semibold mb-2 text-brand-white">{benefit.title}</h3>
                <p className="text-brand-gray/80">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ STATS / TESTIMONIALS ============ */}
      <section className="py-20 px-4 sm:px-6 bg-brand-black border-t border-brand-navy-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light mb-4 text-brand-white">Join Thousands Living Intentionally</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {[
              { stat: "10,000+", label: "People tracking their life" },
              { stat: "500,000+", label: "Weeks documented" },
              { stat: "50,000+", label: "Milestones celebrated" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="text-center bg-brand-navy/10 border border-brand-navy-border/40 rounded-lg p-8 hover:border-brand-orange/30 transition duration-300"
              >
                <div className="text-4xl font-extrabold text-brand-orange mb-2 drop-shadow-[0_0_10px_rgba(252,163,17,0.2)]">{item.stat}</div>
                <div className="text-brand-gray/80 text-sm">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonials */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                quote: "Seeing my life as 4,160 weeks was a wake-up call. I realized how precious time is. Now I'm more intentional about what I do and who I spend time with.",
                author: "Sarah, 32"
              },
              {
                quote: "I've been using Life in Weeks for a year. Looking back at my grid, I can see how much I've grown. It's like having a visual memoir of my journey.",
                author: "Marcus, 28"
              },
              {
                quote: "This app changed how I plan my weeks. Instead of just reacting to life, I'm designing it. The grid makes everything clear.",
                author: "Elena, 35"
              },
              {
                quote: "I love that I can look back and see the mood patterns in my life. It helped me understand what makes me happy and to avoid what drains me.",
                author: "James, 41"
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-brand-navy/10 border border-brand-navy-border/40 rounded-lg p-8 hover:border-brand-orange/30 transition duration-300"
              >
                <p className="text-brand-white mb-4 italic font-light leading-relaxed">{`"${testimonial.quote}"`}</p>
                <p className="text-brand-orange/80 text-sm">— {testimonial.author}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-brand-black to-brand-navy/30 border-t border-brand-navy-border/40">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-light mb-6 text-brand-white">Your Life Deserves to Be Seen</h2>
            <p className="text-xl text-brand-gray mb-10 max-w-2xl mx-auto">
              Stop drifting. Start designing. Life in Weeks gives you the perspective to live intentionally, the tools to remember what matters, and the vision to create your best future.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Link
                href="/register"
                className="bg-brand-orange text-brand-black px-10 py-4 rounded-lg font-semibold text-lg hover:bg-brand-orange/95 transition flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(252,163,17,0.25)] hover:shadow-[0_0_30px_rgba(252,163,17,0.45)] duration-300"
              >
                Start Visualizing Your Life Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <p className="text-brand-gray/60 text-sm font-light">
              ✨ Free forever • No credit card required • Privacy first
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-brand-black border-t border-brand-navy-border/40 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4 text-brand-white">Life in Weeks</h3>
              <p className="text-brand-gray/60 text-sm">Visualize. Remember. Design. Live intentionally.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-brand-white">Product</h4>
              <ul className="space-y-2 text-brand-gray/60 text-sm">
                <li><a href="#" className="hover:text-brand-orange transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Get Started</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-brand-white">Company</h4>
              <ul className="space-y-2 text-brand-gray/60 text-sm">
                <li><a href="#" className="hover:text-brand-orange transition-colors">About</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-brand-white">Legal</h4>
              <ul className="space-y-2 text-brand-gray/60 text-sm">
                <li><a href="#" className="hover:text-brand-orange transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-brand-navy-border/30 pt-8 text-center text-brand-gray/40 text-sm">
            <p>&copy; 2024 Life in Weeks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}