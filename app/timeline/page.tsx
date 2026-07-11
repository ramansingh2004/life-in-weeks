"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Film,
  ImageIcon,
  Mic,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { TagFilter } from "@/components/TagComponents/TagFilter";
import { useLifeStore } from "@/store/useCapsuleStore";
import { MOOD_COLORS, MOOD_LABELS } from "@/typesDefined";
import { useAuth } from "@/hooks/useQuery";
import {
  InfiniteScrollLoader,
  useCursorPagination,
} from "@/hooks/useCursorPagination";

type MediaItem = {
  _id: string;
  type: "image" | "video" | "audio";
  url: string;
  name: string;
};

type TimelineMemory = {
  weekIndex: number;
  date: string;
  note: string;
  mood: number;
  isPast: boolean;
  isCurrent: boolean;
  tags?: string[];
  media?: MediaItem[];
};

export default function TimelinePage() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useAuth();
  const { getNote } = useLifeStore();

  const [allMemories, setAllMemories] = useState<TimelineMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [moodFilter, setMoodFilter] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [preview, setPreview] = useState<TimelineMemory | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || isLoadingUser) return;

    if (!user) {
      router.push("/login");
      return;
    }

    async function loadMemories() {
      const memories: TimelineMemory[] = [];

      for (let weekIndex = 0; weekIndex < 10000; weekIndex++) {
        const note = getNote(weekIndex);

        if (!note || !note.note || note.note.trim() === "<p></p>") continue;

        const memory: TimelineMemory = {
          weekIndex: note.weekIndex,
          date: note.date,
          note: note.note,
          mood: note.mood,
          isPast: note.isPast,
          isCurrent: note.isCurrent,
          tags: note.tags || [],
        };

        try {
          const response = await fetch(`/api/media?weekIndex=${weekIndex}`);
          if (response.ok) {
            const data = await response.json();
            const media = data.data?.media || [];
            if (Array.isArray(media) && media.length > 0) memory.media = media;
          }
        } catch (error) {
          console.error(`Failed to load media for week ${weekIndex}:`, error);
        }

        memories.push(memory);
      }

      memories.sort((first, second) => second.weekIndex - first.weekIndex);
      setAllMemories(memories);
    }

    loadMemories().finally(() => setLoading(false));
  }, [hydrated, isLoadingUser, user, router, getNote]);

  const filteredMemories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return allMemories.filter((memory) => {
      const matchesSearch =
        normalizedSearch === "" ||
        memory.note.toLowerCase().includes(normalizedSearch) ||
        memory.date.toLowerCase().includes(normalizedSearch);
      const matchesMood = moodFilter === null || memory.mood === moodFilter;
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => memory.tags?.includes(tag));

      return matchesSearch && matchesMood && matchesTags;
    });
  }, [allMemories, searchTerm, moodFilter, selectedTags]);

  const {
    items: paginatedMemories,
    isLoading: isLoadingMore,
    hasMore,
    observerTarget,
    reset: resetPagination,
  } = useCursorPagination<TimelineMemory>({
    initialItems: [],
    itemsPerPage: 15,
    getCursorFromItem: (item) => item.weekIndex,
    onLoadMore: async (cursor) => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (cursor === null) return filteredMemories.slice(0, 15);

      const cursorIndex = filteredMemories.findIndex(
        (memory) => memory.weekIndex === (cursor as number),
      );
      const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
      return filteredMemories.slice(startIndex, startIndex + 15);
    },
  });

  useEffect(() => {
    if (!hydrated) return;
    resetPagination();
  }, [searchTerm, moodFilter, selectedTags, hydrated, resetPagination]);

  useEffect(() => {
    document.body.style.overflow = preview || imagePreview ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preview, imagePreview]);

  if (!hydrated || isLoadingUser || loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf0]">
        <div className="text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#eb5e28] border-t-transparent" />
          <p className="mt-4 text-xs font-medium text-[#77726a]">
            {loading ? "Building your timeline..." : "Loading..."}
          </p>
        </div>
      </main>
    );
  }

  const images = preview?.media?.filter((item) => item.type === "image") || [];
  const videos = preview?.media?.filter((item) => item.type === "video") || [];
  const audios = preview?.media?.filter((item) => item.type === "audio") || [];

  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#252422] selection:bg-[#eb5e28]/25">
      <Sidebar onOpenChange={setIsSidebarOpen} />

      <div
        className={`px-4 pb-16 pt-20 transition-transform duration-300 ease-out sm:px-6 sm:pt-12 ${
          isSidebarOpen ? "lg:translate-x-24" : "translate-x-0"
        }`}
      >
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 border-b border-[#252422]/10 pb-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#625f59]">
                <Sparkles className="h-3.5 w-3.5 text-[#eb5e28]" />
                Your story in chronological order
              </div>
              <button
                onClick={() => router.push("/grid")}
                className="group inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-4 py-2.5 text-xs font-bold transition-all hover:border-[#eb5e28]/40 hover:text-[#eb5e28]"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back to grid
              </button>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-5xl font-semibold leading-none tracking-[-0.065em] sm:text-6xl">
                  Memory{" "}
                  <span className="font-serif font-normal italic text-[#eb5e28]">
                    Timeline
                  </span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#6d6861]">
                  Follow the moments, moods, and milestones that shaped your
                  life—newest first.
                </p>
              </div>
              <div className="rounded-2xl bg-[#252422] px-5 py-4 text-[#fffaf0]">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Memories found
                </p>
                <p className="mt-1 text-xl font-bold">
                  {filteredMemories.length}
                </p>
              </div>
            </div>
          </header>

          <section className="mb-8 rounded-[1.75rem] border border-[#252422]/10 bg-white/70 p-4 shadow-[0_18px_55px_rgba(37,36,34,0.07)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9287]" />
              <input
                type="search"
                placeholder="Search your timeline..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[#252422]/10 bg-[#f3ede2] pl-11 pr-4 text-sm outline-none transition-all placeholder:text-[#9a9287] focus:border-[#eb5e28] focus:ring-4 focus:ring-[#eb5e28]/10"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-[#252422]/10 bg-[#f3ede2] p-3">
              <TagFilter
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                mode="multiple"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#9a9287]">
                Mood
              </span>
              <button
                onClick={() => setMoodFilter(null)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${moodFilter === null ? "border-[#252422] bg-[#252422] text-[#fffaf0]" : "border-[#252422]/10 text-[#77726a] hover:border-[#eb5e28]/35 hover:text-[#eb5e28]"}`}
              >
                All
              </button>
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  onClick={() =>
                    setMoodFilter(moodFilter === mood ? null : mood)
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${moodFilter === mood ? "border-[#eb5e28] bg-[#eb5e28] text-[#fffaf0]" : "border-[#252422]/10 text-[#77726a] hover:border-[#eb5e28]/35 hover:text-[#eb5e28]"}`}
                >
                  {MOOD_LABELS[mood]}
                </button>
              ))}
            </div>

            {(selectedTags.length > 0 || moodFilter !== null) && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#eb5e28]/10 px-4 py-3 text-xs text-[#c9491c]">
                <span className="font-semibold">Filters active</span>
                <button
                  onClick={() => {
                    setSelectedTags([]);
                    setMoodFilter(null);
                  }}
                  className="font-bold hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </section>

          <section className="mx-auto max-w-3xl">
            {allMemories.length === 0 ? (
              <EmptyState
                title="No memories yet"
                copy="Write your first memory from any week on the grid."
                onAction={() => router.push("/grid")}
              />
            ) : filteredMemories.length === 0 ? (
              <EmptyState
                title="No matching memories"
                copy="Try another search, mood, or tag."
                onAction={() => {
                  setSearchTerm("");
                  setMoodFilter(null);
                  setSelectedTags([]);
                }}
                action="Clear filters"
              />
            ) : (
              <>
                <div className="relative space-y-4 before:absolute before:bottom-8 before:left-[15px] before:top-8 before:w-px before:bg-[#252422]/10">
                  {paginatedMemories.map((memory, index) => {
                    const moodColor = memory.mood
                      ? MOOD_COLORS[memory.mood]
                      : "bg-[#403d39]";
                    const imageCount =
                      memory.media?.filter((item) => item.type === "image")
                        .length || 0;
                    const videoCount =
                      memory.media?.filter((item) => item.type === "video")
                        .length || 0;
                    const audioCount =
                      memory.media?.filter((item) => item.type === "audio")
                        .length || 0;

                    return (
                      <motion.article
                        key={memory.weekIndex}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -3 }}
                        transition={{ delay: Math.min(index * 0.035, 0.35) }}
                        className="group relative pl-11"
                      >
                        <button
                          onClick={() => setPreview(memory)}
                          className={`absolute left-0 top-7 z-10 h-8 w-8 rounded-full border-[5px] border-[#fffaf0] ${moodColor} transition-transform group-hover:scale-110`}
                          aria-label={`Open week ${memory.weekIndex + 1}`}
                        />
                        <div
                          onClick={() => setPreview(memory)}
                          className="cursor-pointer rounded-[1.5rem] border border-[#252422]/10 bg-white/70 p-5 shadow-sm transition-all group-hover:border-[#eb5e28]/35 group-hover:shadow-[0_18px_50px_rgba(37,36,34,0.09)] sm:p-6"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#eb5e28]">
                                Week {memory.weekIndex + 1}
                              </p>
                              <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#9a9287]">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {memory.date}
                              </p>
                            </div>
                            {memory.mood > 0 && (
                              <span className="rounded-full bg-[#f3ede2] px-3 py-1.5 text-xs font-semibold text-[#625f59]">
                                {MOOD_LABELS[memory.mood]}
                              </span>
                            )}
                          </div>

                          <div
                            className="prose mt-4 line-clamp-3 max-w-none text-sm leading-7 text-[#57524c]"
                            dangerouslySetInnerHTML={{ __html: memory.note }}
                          />

                          {memory.tags && memory.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {memory.tags.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    if (!selectedTags.includes(tag))
                                      setSelectedTags([...selectedTags, tag]);
                                  }}
                                  className="rounded-full border border-[#eb5e28]/20 bg-[#eb5e28]/10 px-2.5 py-1 text-[10px] font-bold text-[#c9491c]"
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          )}

                          {(imageCount > 0 ||
                            videoCount > 0 ||
                            audioCount > 0) && (
                            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-[#77726a]">
                              {imageCount > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-[#f3ede2] px-2.5 py-1">
                                  <ImageIcon className="h-3 w-3" />
                                  {imageCount}
                                </span>
                              )}
                              {videoCount > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-[#f3ede2] px-2.5 py-1">
                                  <Film className="h-3 w-3" />
                                  {videoCount}
                                </span>
                              )}
                              {audioCount > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-[#f3ede2] px-2.5 py-1">
                                  <Mic className="h-3 w-3" />
                                  {audioCount}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#eb5e28]">
                            Open memory{" "}
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl bg-[#f3ede2]/70 p-3 text-center text-xs text-[#77726a]">
                  <InfiniteScrollLoader
                    isLoading={isLoadingMore}
                    hasMore={hasMore}
                    targetRef={observerTarget}
                    loadingText="Loading more memories..."
                    emptyText="You have reached the beginning of your timeline"
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#252422]/70 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[88svh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#252422]/10 bg-[#fffaf0] p-5 shadow-2xl sm:p-7"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#252422]/10 pb-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#eb5e28]">
                    Memory · Week {preview.weekIndex + 1}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    {preview.date}
                  </h2>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#252422]/10 transition-colors hover:bg-[#f3ede2]"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {preview.mood > 0 && (
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold text-white ${MOOD_COLORS[preview.mood]}`}
                  >
                    {MOOD_LABELS[preview.mood]}
                  </span>
                )}
                {preview.tags?.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (!selectedTags.includes(tag))
                        setSelectedTags([...selectedTags, tag]);
                      setPreview(null);
                    }}
                    className="rounded-full border border-[#eb5e28]/20 bg-[#eb5e28]/10 px-3 py-1.5 text-xs font-bold text-[#c9491c]"
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              <div
                className="prose mt-5 max-w-none rounded-2xl border border-[#252422]/10 bg-white/60 p-5 text-[#57524c]"
                dangerouslySetInnerHTML={{ __html: preview.note }}
              />

              {images.length > 0 && (
                <MediaSection title={`Photos (${images.length})`}>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((item) => (
                      <motion.button
                        key={item._id}
                        layoutId={item._id}
                        onClick={() => setImagePreview(item.url)}
                        className="group relative aspect-square overflow-hidden rounded-xl"
                      >
                        <Image
                          src={item.url}
                          alt={item.name}
                          width={240}
                          height={240}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </motion.button>
                    ))}
                  </div>
                </MediaSection>
              )}
              {videos.length > 0 && (
                <MediaSection title={`Videos (${videos.length})`}>
                  <div className="space-y-3">
                    {videos.map((item) => (
                      <video
                        key={item._id}
                        src={item.url}
                        controls
                        className="max-h-52 w-full rounded-xl bg-[#252422]"
                      />
                    ))}
                  </div>
                </MediaSection>
              )}
              {audios.length > 0 && (
                <MediaSection title={`Voice notes (${audios.length})`}>
                  <div className="space-y-2">
                    {audios.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 rounded-xl bg-[#f3ede2] p-3"
                      >
                        <Mic className="h-4 w-4 text-[#eb5e28]" />
                        <audio src={item.url} controls className="h-8 flex-1" />
                      </div>
                    ))}
                  </div>
                </MediaSection>
              )}

              <div className="mt-7 flex gap-3">
                <button
                  onClick={() => setPreview(null)}
                  className="min-h-12 flex-1 rounded-full border border-[#252422]/15 text-sm font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    router.push(`/grid?week=${preview.weekIndex}`);
                    setPreview(null);
                  }}
                  className="group flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#252422] text-sm font-bold text-[#fffaf0] transition-colors hover:bg-[#eb5e28]"
                >
                  Edit in grid{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImagePreview(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#252422]/95 p-4"
          >
            <motion.img
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              src={imagePreview}
              alt="Memory preview"
              className="max-h-full max-w-full rounded-2xl object-contain"
              onClick={(event) => event.stopPropagation()}
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function EmptyState({
  title,
  copy,
  onAction,
  action = "Go to grid",
}: {
  title: string;
  copy: string;
  onAction: () => void;
  action?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#252422]/15 bg-white/45 px-6 py-20 text-center">
      <CalendarDays className="mx-auto h-7 w-7 text-[#eb5e28]" />
      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#77726a]">
        {copy}
      </p>
      <button
        onClick={onAction}
        className="mt-6 rounded-full bg-[#252422] px-6 py-3 text-sm font-bold text-[#fffaf0] transition-colors hover:bg-[#eb5e28]"
      >
        {action}
      </button>
    </div>
  );
}

function MediaSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-[#eb5e28]">
        {title}
      </p>
      {children}
    </section>
  );
}
