"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Images,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useLifeStore } from "@/store/useCapsuleStore";
import { PhotoGrid } from "./PhotoGrid";
import { PhotoFilters } from "./PhotoFilters";
import { PhotoStats } from "./PhotoStats";
import { PhotoViewer } from "./PhotoViewer";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useQuery";
import {
  InfiniteScrollLoader,
  useCursorPagination,
} from "@/hooks/useCursorPagination";

export type PhotoItem = {
  _id: string;
  weekIndex: number;
  url: string;
  name: string;
  createdAt: Date;
  weekDate?: string;
};

interface RawPhotoData {
  _id: string;
  weekIndex: number;
  url: string;
  name: string;
  createdAt?: string | Date;
}

export function PhotoGallery() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useAuth();
  const { getNote } = useLifeStore();
  const resetPaginationRef = useRef<(() => void) | null>(null);
  const [allPhotos, setAllPhotos] = useState<PhotoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getFilteredPhotos = useCallback(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return [...allPhotos]
      .filter((photo) => {
        if (
          normalizedSearch &&
          !photo.name.toLowerCase().includes(normalizedSearch) &&
          !photo.weekDate?.toLowerCase().includes(normalizedSearch)
        )
          return false;
        if (dateRange.from && photo.createdAt < dateRange.from) return false;
        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (photo.createdAt > endOfDay) return false;
        }
        return true;
      })
      .sort((a, b) =>
        sortBy === "newest"
          ? b.createdAt.getTime() - a.createdAt.getTime()
          : a.createdAt.getTime() - b.createdAt.getTime(),
      );
  }, [allPhotos, dateRange, searchTerm, sortBy]);

  const {
    items: paginatedPhotos,
    isLoading: isLoadingMore,
    hasMore,
    observerTarget,
    reset: resetPagination,
  } = useCursorPagination<PhotoItem>({
    initialItems: [],
    itemsPerPage: 30,
    getCursorFromItem: (item) => item._id,
    onLoadMore: async (cursor) => {
      const filtered = getFilteredPhotos();
      if (cursor === null) return filtered.slice(0, 30);
      const cursorIndex = filtered.findIndex((photo) => photo._id === cursor);
      return filtered.slice(
        cursorIndex >= 0 ? cursorIndex + 1 : 0,
        (cursorIndex >= 0 ? cursorIndex + 1 : 0) + 30,
      );
    },
  });
  resetPaginationRef.current = resetPagination;

  useEffect(() => {
    if (!isLoadingUser && !user) router.push("/login");
  }, [isLoadingUser, user, router]);

  useEffect(() => {
    if (isLoadingUser || !user) return;

    async function fetchPhotos() {
      setIsLoadingPhotos(true);
      setError(null);
      try {
        const response = await fetch("/api/media?type=image");
        const data = await response.json();
        if (!response.ok) {
          const message =
            data.error?.message || data.error || "Failed to fetch photos";
          throw new Error(
            typeof message === "string" ? message : "Failed to fetch photos",
          );
        }

        const media: RawPhotoData[] = data.data?.media || [];
        setAllPhotos(
          media.map((photo) => ({
            _id: photo._id,
            weekIndex: photo.weekIndex,
            url: photo.url,
            name: photo.name,
            createdAt: photo.createdAt ? new Date(photo.createdAt) : new Date(),
            weekDate: getNote(photo.weekIndex)?.date,
          })),
        );
        resetPaginationRef.current?.();
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Failed to fetch photos";
        console.error("Photo gallery failed to load:", cause);
        setError(message);
        setAllPhotos([]);
      } finally {
        setIsLoadingPhotos(false);
      }
    }

    void fetchPhotos();
  }, [getNote, isLoadingUser, reloadKey, user]);

  useEffect(
    () => resetPagination(),
    [searchTerm, sortBy, dateRange, resetPagination],
  );

  const filtered = useMemo(() => getFilteredPhotos(), [getFilteredPhotos]);

  if (isLoadingUser || isLoadingPhotos) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf0] text-[#252422]">
        <div className="text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#eb5e28] border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-[#77726a]">
            Developing your gallery...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#252422] selection:bg-[#eb5e28]/25">
      <Sidebar onOpenChange={setIsSidebarOpen} />
      <div
        className={`px-4 pb-16 pt-20 transition-transform duration-300 sm:px-6 sm:pt-12 ${isSidebarOpen ? "lg:translate-x-24" : ""}`}
      >
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 border-b border-[#252422]/10 pb-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#625f59]">
                <Sparkles className="h-3.5 w-3.5 text-[#eb5e28]" /> Your visual
                archive
              </div>
              <button
                onClick={() => router.push("/grid")}
                className="group inline-flex items-center gap-2 rounded-full border border-[#252422]/10 bg-white/65 px-4 py-2.5 text-xs font-bold transition hover:border-[#eb5e28]/40 hover:text-[#eb5e28]"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />{" "}
                Back to grid
              </button>
            </div>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-5xl font-semibold leading-none tracking-[-0.065em] sm:text-6xl">
                  Photo{" "}
                  <span className="font-serif font-normal italic text-[#eb5e28]">
                    Gallery
                  </span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#6d6861]">
                  A living collection of the faces, places, and ordinary moments
                  that made each week yours.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-[#252422] px-5 py-4 text-[#fffaf0]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0c955] text-[#252422]">
                  <Images className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                    Collection
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {allPhotos.length} photos
                  </p>
                </div>
              </div>
            </div>
          </header>

          {error ? (
            <GalleryState
              icon={<RefreshCw className="h-7 w-7" />}
              title="The gallery could not be loaded"
              copy={error}
            >
              <button
                onClick={() => setReloadKey((value) => value + 1)}
                className="inline-flex items-center gap-2 rounded-full bg-[#eb5e28] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#eb5e28]/20 transition hover:-translate-y-0.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Try again
              </button>
              <button
                onClick={() => router.push("/grid")}
                className="rounded-full border border-[#252422]/15 bg-white/65 px-5 py-3 text-xs font-bold"
              >
                Back to grid
              </button>
            </GalleryState>
          ) : allPhotos.length === 0 ? (
            <GalleryState
              icon={<Camera className="h-7 w-7" />}
              title="Your gallery is ready for its first memory"
              copy="Add a photo to any week and it will become part of this visual archive."
            >
              <button
                onClick={() => router.push("/grid")}
                className="inline-flex items-center gap-2 rounded-full bg-[#eb5e28] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#eb5e28]/20 transition hover:-translate-y-0.5"
              >
                Choose a week <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </GalleryState>
          ) : (
            <>
              <PhotoStats photos={allPhotos} />
              <PhotoFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                totalPhotos={allPhotos.length}
                filteredPhotos={filtered.length}
              />

              {filtered.length === 0 ? (
                <GalleryState
                  icon={<Images className="h-7 w-7" />}
                  title="No photos match these filters"
                  copy="Try a different search, date range, or sort order."
                >
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setDateRange({});
                    }}
                    className="rounded-full bg-[#252422] px-5 py-3 text-xs font-bold text-[#fffaf0]"
                  >
                    Clear filters
                  </button>
                </GalleryState>
              ) : (
                <motion.section
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <PhotoGrid
                    photos={paginatedPhotos}
                    onPhotoClick={setSelectedPhoto}
                  />
                  <InfiniteScrollLoader
                    isLoading={isLoadingMore}
                    hasMore={hasMore}
                    targetRef={observerTarget}
                    loadingText="Loading more memories..."
                    emptyText="You have reached the end of your gallery"
                  />
                </motion.section>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <PhotoViewer
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onNavigate={(direction) => {
              const index = paginatedPhotos.findIndex(
                (photo) => photo._id === selectedPhoto._id,
              );
              const nextIndex = direction === "next" ? index + 1 : index - 1;
              if (nextIndex >= 0 && nextIndex < paginatedPhotos.length)
                setSelectedPhoto(paginatedPhotos[nextIndex]);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function GalleryState({
  icon,
  title,
  copy,
  children,
}: {
  icon: ReactNode;
  title: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[#252422]/10 bg-white/60 p-10 text-center shadow-sm sm:p-16">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#f7ead7] text-[#eb5e28]">
        {icon}
      </span>
      <h2 className="mt-6 font-serif text-3xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6d6861]">
        {copy}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>
    </section>
  );
}