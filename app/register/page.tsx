"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Grid3X3,
  Heart,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { useLifeStore } from "@/store/useCapsuleStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/hooks/useQuery";

const QUOTES = [
  "The average person lives just 4,000 weeks.",
  "Most of your Mondays are already behind you.",
  "You have lived more weeks than you think.",
  "Time is the only currency that can't be earned back.",
];

const previewWeeks = Array.from({ length: 240 }, (_, index) => index);
const ease = [0.22, 1, 0.36, 1] as const;

export default function Register() {
  const router = useRouter();
  const { birthDate, lifeExpectancy, setBirthDate, setLifeExpectancy } =
    useLifeStore();
  const { user, setUser } = useAuthStore();

  const {
    user: backendUser,
    isLoading: isLoadingUser,
    isError,
    updateProfile,
    isUpdatingProfile,
    updateProfileError,
  } = useAuth();

  const authError = isError ? new Error("Authentication failed") : null;
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
  }, []);

  useEffect(() => {
    if (!hydrated || isLoadingUser) return;

    if (backendUser) {
      setUser(backendUser);

      if (backendUser.birthDate) {
        setBirthDate(backendUser.birthDate);
      }

      if (backendUser.lifeExpectancy) {
        setLifeExpectancy(backendUser.lifeExpectancy);
      }
    }
  }, [
    hydrated,
    backendUser,
    isLoadingUser,
    setUser,
    setBirthDate,
    setLifeExpectancy,
  ]);

  async function handleStart() {
    if (!birthDate) {
      setError("Please enter your birth date");
      return;
    }

    if (new Date(birthDate) > new Date()) {
      setError("Birth date cannot be in the future");
      return;
    }

    if (!user) {
      localStorage.setItem(
        "tempLifeData",
        JSON.stringify({ birthDate, lifeExpectancy }),
      );
      router.push("/login");
      return;
    }

    updateProfile(
      { birthDate, lifeExpectancy },
      {
        onSuccess: () => {
          setBirthDate(birthDate);
          setLifeExpectancy(lifeExpectancy);
          setStarted(true);
          setTimeout(() => router.push("/grid"), 600);
        },
        onError: (profileError) => {
          console.error("Error saving profile:", profileError);
          setError("Failed to save profile");
        },
      },
    );
  }

  const displayedError =
    error || updateProfileError?.message || authError?.message;

  return (
    <main className="h-[100svh] overflow-hidden bg-[#fffaf0] text-[#252422] selection:bg-[#eb5e28]/25">
      <nav className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Life in Weeks home"
          >
            <span className="grid grid-cols-4 gap-1" aria-hidden="true">
              {Array.from({ length: 7 }, (_, index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 rounded-[2px] bg-[#eb5e28] transition-transform duration-300 group-hover:-translate-y-0.5 lg:bg-[#fffaf0]"
                />
              ))}
            </span>
            <span className="text-base font-bold tracking-[-0.04em] lg:text-[#fffaf0]">
              Life in Weeks
            </span>
          </Link>

          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/55 px-4 py-2.5 text-xs font-bold backdrop-blur-md transition-colors hover:bg-white lg:border-white/20 lg:bg-white/10 lg:text-[#fffaf0] lg:hover:bg-white/15"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="grid h-full lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden h-full overflow-hidden bg-[#eb5e28] px-10 pb-8 pt-24 text-[#fffaf0] lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute -left-56 -top-52 h-[560px] w-[560px] rounded-full border border-white/20" />
          <div className="absolute -bottom-80 -right-64 h-[720px] w-[720px] rounded-full border border-white/20" />
          <div className="absolute right-[8%] top-[14%] h-44 w-44 rounded-full border border-[#f0c955]/70" />
          <span
            className="absolute right-[12%] top-[19%] text-[#f0c955]"
            aria-hidden="true"
          >
            ✦
          </span>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="relative z-10 max-w-2xl"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#f0c955]" />
              Your story is already happening
            </div>
            <h1 className="text-[clamp(3.2rem,5vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.075em]">
              Begin with
              <span className="mt-2 block font-serif font-normal italic text-[#f0c955]">
                this week.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/75 xl:text-base">
              Add two simple details to create a personal map of your lifetime.
              No pressure to remember everything—just a clearer way to notice.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 1.5 }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            className="relative z-10 mx-auto my-4 w-full max-w-2xl rounded-2xl border border-[#252422]/15 bg-[#fffaf0] p-5 text-[#252422] shadow-[14px_16px_0_rgba(37,36,34,0.16)]"
          >
            <div className="flex items-start justify-between border-b border-[#252422]/10 pb-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#eb5e28]">
                  Your lifetime
                </p>
                <p className="mt-1 text-2xl font-bold tracking-[-0.05em]">
                  4,160 weeks
                </p>
              </div>
              <span className="rounded-full border border-[#252422]/10 px-3 py-1.5 text-[9px] font-semibold text-[#77726a]">
                80 years
              </span>
            </div>

            <div
              className="my-4 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1"
              aria-hidden="true"
            >
              {previewWeeks.map((week) => (
                <span
                  key={week}
                  className={`aspect-square rounded-[2px] ${
                    week < 88
                      ? week % 17 === 0
                        ? "bg-[#eb5e28]"
                        : week % 29 === 0
                          ? "bg-[#f0c955]"
                          : "bg-[#252422]"
                      : "bg-[#ded8ce]"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-[#252422]/10 pt-4 text-[8px] font-bold uppercase tracking-[0.1em] text-[#77726a]">
              <span>Every square has a story</span>
              <span className="text-[#eb5e28]">Yours starts here ↗</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="relative z-10 flex items-center justify-between gap-6 border-t border-white/20 pt-4"
          >
            <p className="max-w-sm font-serif text-sm italic text-white/85">
              {quoteIndex !== null
                ? `“${QUOTES[quoteIndex]}”`
                : "Your weeks become your story."}
            </p>
            <div className="flex -space-x-2" aria-hidden="true">
              {["bg-[#f0c955]", "bg-[#87b9ad]", "bg-[#fffaf0]"].map((color) => (
                <span
                  key={color}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 border-[#eb5e28] text-[#252422] ${color}`}
                >
                  <Heart className="h-3.5 w-3.5" />
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="relative flex h-full items-center justify-center overflow-hidden px-5 pb-1 pt-16 sm:px-8 lg:px-12 lg:py-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(37,36,34,0.22) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
              maskImage: "linear-gradient(to bottom, black, transparent 75%)",
            }}
          />

          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.65, ease }}
                className="relative z-10 w-full max-w-xl"
              >
                <div className="hidden">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#eb5e28]">
                    Create your life map
                  </p>
                  <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl">
                    Begin with
                    <span className="block font-serif font-normal italic text-[#eb5e28]">
                      this week.
                    </span>
                  </h1>
                  <p className="mt-5 max-w-lg text-sm leading-6 text-[#6d6861]">
                    Add two simple details and see your lifetime become visible.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[#252422]/10 bg-white/70 p-4 shadow-[0_24px_80px_rgba(37,36,34,0.10)] backdrop-blur-sm sm:p-6">
                  <div className="mb-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#252422] text-[#fffaf0]">
                      <CalendarDays className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#eb5e28]">
                      Your starting point
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                      Create your life map
                    </h2>
                    <p className="mt-2 hidden text-sm leading-6 text-[#6d6861] sm:block">
                      Your birth date places you on the map. You can change your
                      life expectancy at any time.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="birthDate"
                        className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#625f59]"
                      >
                        Your birth date
                      </label>
                      <input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(event) => {
                          setBirthDate(event.target.value);
                          setError("");
                        }}
                        className="h-11 w-full rounded-xl border border-[#252422]/12 bg-[#f3ede2] px-4 text-sm font-medium text-[#252422] outline-none transition-all focus:border-[#eb5e28] focus:ring-4 focus:ring-[#eb5e28]/10"
                      />
                    </div>

                    <div className="rounded-xl border border-[#252422]/10 bg-[#f3ede2] p-3 sm:p-4">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <label
                            htmlFor="lifeExpectancy"
                            className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#625f59]"
                          >
                            Life expectancy
                          </label>
                          <p className="mt-1 hidden text-xs text-[#77726a] sm:block">
                            Used to calculate your complete grid
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#252422] px-3 py-1.5 text-xs font-bold text-[#fffaf0]">
                          {lifeExpectancy} years
                        </span>
                      </div>
                      <input
                        id="lifeExpectancy"
                        type="range"
                        min="50"
                        max="100"
                        value={lifeExpectancy}
                        onChange={(event) =>
                          setLifeExpectancy(Number(event.target.value))
                        }
                        className="h-2 w-full cursor-pointer accent-[#eb5e28]"
                      />
                      <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#9a9287]">
                        <span>50 years</span>
                        <span>100 years</span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {displayedError && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          role="alert"
                          className="rounded-xl border border-red-500/20 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                        >
                          {displayedError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={handleStart}
                      disabled={isUpdatingProfile}
                      className="group flex min-h-11 w-full items-center justify-center gap-4 rounded-full bg-[#252422] px-6 text-sm font-bold text-[#fffaf0] shadow-lg transition-colors hover:bg-[#eb5e28] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {isUpdatingProfile
                        ? "Saving your details..."
                        : user
                          ? "Build my life grid"
                          : "Continue to sign in"}
                      {!isUpdatingProfile && (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </motion.button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#252422]/10 pt-4">
                    {[
                      { icon: Grid3X3, label: "Life grid" },
                      { icon: BookOpen, label: "Journal" },
                      { icon: BarChart3, label: "Insights" },
                    ].map((feature) => (
                      <div
                        key={feature.label}
                        className="flex flex-col items-center gap-2 text-center text-[10px] font-semibold text-[#77726a]"
                      >
                        <feature.icon
                          className="h-4 w-4 text-[#eb5e28]"
                          strokeWidth={1.8}
                        />
                        {feature.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-2 flex flex-col items-center justify-center gap-1.5 text-[10px] text-[#77726a] sm:flex-row sm:gap-4">
                  <span className="flex items-center gap-1.5">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Your details stay private
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-[#bdb5a9] sm:block" />
                  {user ? (
                    <span className="flex items-center gap-2">
                      Signed in as{" "}
                      <strong className="text-[#252422]">{user.name}</strong>
                      <button
                        onClick={async () => {
                          await useAuthStore.getState().logout();
                        }}
                        className="font-semibold text-[#eb5e28] hover:underline"
                      >
                        Sign out
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="font-bold text-[#eb5e28] hover:underline"
                      >
                        Sign in
                      </Link>
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease }}
                className="relative z-10 text-center"
              >
                <div className="mx-auto mb-7 grid h-20 w-20 place-items-center rounded-[1.75rem] bg-[#eb5e28] shadow-[0_20px_50px_rgba(235,94,40,0.25)]">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[0, 1, 2, 3].map((index) => (
                      <motion.span
                        key={index}
                        animate={{ opacity: [0.25, 1, 0.25] }}
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          delay: index * 0.14,
                        }}
                        className="h-2.5 w-2.5 rounded-[2px] bg-[#fffaf0]"
                      />
                    ))}
                  </div>
                </div>
                <h2 className="text-3xl font-semibold tracking-[-0.045em]">
                  Building your life map
                </h2>
                <p className="mt-3 text-sm text-[#6d6861]">
                  Placing every week into perspective...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
