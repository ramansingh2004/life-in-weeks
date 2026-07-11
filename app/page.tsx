'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Flag,
  Grid3X3,
  Heart,
  LockKeyhole,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useQuery'

const ease = [0.22, 1, 0.36, 1] as const

const reveal = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease },
}

const features = [
  {
    icon: Grid3X3,
    label: 'See the big picture',
    title: 'Your life, week by week',
    description:
      'Turn an abstract lifetime into a clear visual map. Every square gives your time a place you can actually see.',
    accent: 'bg-[#eb5e28]',
  },
  {
    icon: BookOpen,
    label: 'Keep what mattered',
    title: 'Notes, moods and memories',
    description:
      'Capture the texture of a week with a thought, a feeling, a photo, or the small moment you never want to lose.',
    accent: 'bg-[#f0c955]',
  },
  {
    icon: Flag,
    label: 'Notice your story',
    title: 'Milestones in context',
    description:
      'Place the chapters and turning points of your life on one timeline—and watch the story connect over time.',
    accent: 'bg-[#87b9ad]',
  },
]

const details = [
  { icon: BarChart3, title: 'Meaningful patterns', copy: 'Understand moods, seasons, and the rhythms that shape your life.' },
  { icon: CalendarDays, title: 'A searchable journal', copy: 'Return to any week, memory, milestone, or chapter in seconds.' },
  { icon: LockKeyhole, title: 'Private by design', copy: 'Your personal story stays personal and remains under your control.' },
]

const previewWeeks = Array.from({ length: 312 }, (_, index) => index)

export default function LandingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { user, isLoading: isLoadingUser } = useAuth()

  useEffect(() => {
    if ((status === 'authenticated' && session?.user) || (user && !isLoadingUser)) {
      router.replace('/grid')
    }
  }, [status, session, user, isLoadingUser, router])

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf0] text-[#252422] selection:bg-[#eb5e28]/25">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#252422]/10 bg-[#fffaf0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="Life in Weeks home">
            <span className="grid grid-cols-4 gap-1" aria-hidden="true">
              {Array.from({ length: 7 }, (_, index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 rounded-[2px] bg-[#eb5e28] transition-transform duration-300 group-hover:-translate-y-0.5"
                />
              ))}
            </span>
            <span className="text-lg font-bold tracking-[-0.04em]">Life in Weeks</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#idea" className="transition-colors hover:text-[#eb5e28]">The idea</a>
            <a href="#features" className="transition-colors hover:text-[#eb5e28]">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-[#eb5e28]">How it works</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#252422]/5 sm:block"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-full bg-[#252422] px-4 py-2.5 text-sm font-semibold text-[#fffaf0] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#eb5e28] hover:shadow-lg sm:px-5"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-28 sm:pt-32">
        <div className="mx-auto grid min-h-[calc(100svh-8rem)] max-w-7xl items-center gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 lg:pb-24">
          <motion.div initial="initial" animate="animate" className="relative z-10 max-w-2xl">
            <motion.div
              variants={reveal}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/70 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.15em]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#eb5e28]" />
              A mindful way to see your time
            </motion.div>

            <motion.h1
              variants={reveal}
              className="max-w-3xl text-[clamp(3.5rem,7vw,6.7rem)] font-semibold leading-[0.91] tracking-[-0.075em]"
            >
              Your life is made of weeks.
              <span className="mt-2 block font-serif font-normal italic tracking-[-0.055em] text-[#eb5e28]">
                Make them visible.
              </span>
            </motion.h1>

            <motion.p
              variants={reveal}
              className="mt-8 max-w-xl text-base leading-8 text-[#625f59] sm:text-lg"
            >
              Turn your lifetime into a beautiful, living map. Remember where
              you have been, notice what matters now, and be more intentional
              about the weeks ahead.
            </motion.p>

            <motion.div variants={reveal} className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="group inline-flex min-h-14 items-center justify-center gap-5 rounded-full bg-[#252422] px-6 text-sm font-bold text-[#fffaf0] transition-all duration-300 hover:-translate-y-1 hover:bg-[#eb5e28] hover:shadow-xl"
              >
                Start your life map
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#idea"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#252422]/15 px-6 text-sm font-bold transition-colors hover:border-[#252422]/35 hover:bg-white/70"
              >
                Discover the idea
              </a>
            </motion.div>

            <motion.div variants={reveal} className="mt-9 flex items-center gap-3 text-xs font-medium text-[#77726a]">
              <span className="flex -space-x-2" aria-hidden="true">
                {['bg-[#eb5e28]', 'bg-[#f0c955]', 'bg-[#87b9ad]'].map((color) => (
                  <span key={color} className={`grid h-8 w-8 place-items-center rounded-full border-2 border-[#fffaf0] ${color}`}>
                    <Heart className="h-3.5 w-3.5" />
                  </span>
                ))}
              </span>
              Made for reflection, not productivity pressure.
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            className="relative mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center lg:min-h-[650px]"
          >
            <div className="absolute h-[78%] w-[78%] rounded-[44%_56%_51%_49%] bg-[#eb5e28] sm:h-[82%] sm:w-[82%]" />
            <div className="absolute right-[3%] top-[8%] h-28 w-28 rounded-full border border-[#f0c955] sm:h-44 sm:w-44" />
            <span className="absolute left-[4%] top-[14%] rotate-[-12deg] font-serif text-2xl italic text-white sm:text-3xl">
              This is your life ↘
            </span>

            <div className="relative z-10 w-[92%] rotate-[2deg] rounded-2xl border border-[#252422]/15 bg-[#fffaf0] p-4 shadow-[18px_22px_0_rgba(37,36,34,0.16)] transition-transform duration-500 hover:rotate-0 sm:w-[86%] sm:p-7">
              <div className="flex items-start justify-between border-b border-[#252422]/10 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#eb5e28]">Your lifetime</p>
                  <p className="mt-1 text-2xl font-bold tracking-[-0.05em] sm:text-3xl">4,160 weeks</p>
                </div>
                <span className="rounded-full border border-[#252422]/10 px-3 py-1.5 text-[10px] font-semibold text-[#77726a]">80 years</span>
              </div>

              <div className="my-5 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1 sm:my-7 sm:gap-1.5" aria-label="A preview of the Life in Weeks grid">
                {previewWeeks.map((week) => (
                  <span
                    key={week}
                    className={`aspect-square rounded-[2px] ${
                      week < 116
                        ? week % 19 === 0
                          ? 'bg-[#eb5e28]'
                          : week % 31 === 0
                            ? 'bg-[#f0c955]'
                            : 'bg-[#252422]'
                        : 'bg-[#ded8ce]'
                    }`}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#252422]/10 pt-4 text-[9px] font-bold uppercase tracking-[0.1em] text-[#77726a]">
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-[2px] bg-[#252422]" /> Weeks lived</span>
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-[2px] bg-[#ded8ce]" /> Weeks ahead</span>
                <span className="ml-auto hidden sm:block">Every square has a story</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="idea" className="bg-[#252422] py-24 text-[#fffaf0] sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease }}
          >
            <p className="mb-7 text-xs font-bold uppercase tracking-[0.18em] text-[#f0c955]">The idea</p>
            <h2 className="text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.065em]">
              A lifetime feels infinite.
              <span className="mt-2 block font-serif font-normal italic text-[#f0c955]">A week feels real.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="border-t border-white/15 pt-8 text-[#c4beb5] lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"
          >
            <p className="text-xl leading-8 text-white">
              Most of us think about life in years. But years are too large to
              hold in your hand. A week is different.
            </p>
            <p className="mt-5 leading-7">
              It can contain a first day, a long walk, an ordinary dinner, a
              brave decision, or nothing remarkable at all. Life in Weeks helps
              you keep those pieces together—without asking you to optimize
              every moment.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-14 grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#eb5e28]">Built around your story</p>
              <h2 className="text-[clamp(3rem,5.5vw,5rem)] font-semibold leading-[0.96] tracking-[-0.065em]">
                Small rituals.
                <span className="block font-serif font-normal italic text-[#eb5e28]">A richer record.</span>
              </h2>
            </div>
            <p className="max-w-lg text-base leading-7 text-[#6d6861] lg:justify-self-end">
              Start with a single week. Add only what matters. Over time, the
              quiet details become a story only you could tell.
            </p>
          </div>

          <div className="grid gap-4">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.08, ease }}
                className={`${feature.accent} group grid min-h-64 gap-8 overflow-hidden rounded-[1.75rem] border border-[#252422]/10 p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-9 lg:grid-cols-[80px_180px_1fr] lg:items-center lg:gap-10`}
              >
                <span className="self-start text-xs font-bold tracking-[0.16em]">0{index + 1}</span>
                <div className="relative grid h-32 w-32 place-items-center rounded-full border border-current/60 lg:h-40 lg:w-40">
                  <span className="absolute inset-3 rounded-full border border-dashed border-current/40" />
                  <feature.icon className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" strokeWidth={1.5} />
                </div>
                <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr] lg:items-end lg:gap-12">
                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">{feature.label}</p>
                    <h3 className="max-w-md text-3xl font-semibold leading-none tracking-[-0.05em] sm:text-5xl">{feature.title}</h3>
                  </div>
                  <p className="max-w-xl leading-7 opacity-75">{feature.description}</p>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {details.map((detail) => (
              <div key={detail.title} className="rounded-3xl border border-[#252422]/10 bg-white/70 p-7 transition-colors hover:border-[#eb5e28]/40">
                <detail.icon className="mb-8 h-6 w-6 text-[#eb5e28]" strokeWidth={1.7} />
                <h3 className="text-lg font-bold tracking-[-0.025em]">{detail.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6d6861]">{detail.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#252422]/10 bg-[#f3ede2] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#eb5e28]">How it works</p>
              <h2 className="text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl">
                Begin with one week.
              </h2>
              <p className="mt-6 max-w-md leading-7 text-[#6d6861]">
                No complicated setup and no pressure to document everything.
                Your map becomes more meaningful naturally, one entry at a time.
              </p>
            </div>

            <div className="divide-y divide-[#252422]/10 border-y border-[#252422]/10">
              {[
                ['01', 'Create your life map', 'Add your birthday and see your years translated into a clear week-by-week grid.'],
                ['02', 'Capture what matters', 'Open any week to add a note, mood, memory, photo, tag, or milestone.'],
                ['03', 'Watch your story emerge', 'Return to your timeline, journal, and insights to see the patterns and chapters of your life.'],
              ].map(([number, title, copy], index) => (
                <motion.div
                  key={number}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55, delay: index * 0.08, ease }}
                  className="grid gap-4 py-9 sm:grid-cols-[72px_0.85fr_1.15fr] sm:items-start sm:gap-7"
                >
                  <span className="font-serif text-2xl italic text-[#eb5e28]">{number}</span>
                  <h3 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h3>
                  <p className="leading-7 text-[#6d6861]">{copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="p-3 sm:p-6">
        <div className="relative mx-auto flex min-h-[600px] max-w-[1500px] flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-[#eb5e28] px-5 py-20 text-center text-[#fffaf0] sm:rounded-[2.5rem]">
          <div className="absolute -left-52 -top-52 h-[500px] w-[500px] rounded-full border border-white/20" />
          <div className="absolute -bottom-80 -right-64 h-[680px] w-[680px] rounded-full border border-white/20" />
          <Sparkles className="relative mb-7 h-7 w-7 text-[#f0c955]" />
          <h2 className="relative max-w-5xl text-[clamp(3.3rem,7vw,6.7rem)] font-semibold leading-[0.92] tracking-[-0.07em]">
            One life.
            <span className="mt-2 block font-serif font-normal italic text-[#f0c955]">4,160 chances to notice.</span>
          </h2>
          <p className="relative mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            You do not need to remember everything. Just begin with this week.
          </p>
          <Link
            href="/register"
            className="group relative mt-9 inline-flex min-h-14 items-center justify-center gap-5 rounded-full bg-[#fffaf0] px-7 text-sm font-bold text-[#252422] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            Start your life map free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="relative mt-5 text-xs font-medium text-white/65">No credit card required · Private by default</p>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-12 text-sm text-[#6d6861] sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 font-bold text-[#252422]">
          <span className="grid grid-cols-4 gap-1" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-[2px] bg-[#eb5e28]" />
            ))}
          </span>
          Life in Weeks
        </div>
        <p>Make time visible. Make the weeks count.</p>
        <div className="flex items-center gap-5 font-medium">
          <Link href="/login" className="transition-colors hover:text-[#eb5e28]">Log in</Link>
          <Link href="/register" className="transition-colors hover:text-[#eb5e28]">Get started</Link>
        </div>
      </footer>
    </main>
  )
}