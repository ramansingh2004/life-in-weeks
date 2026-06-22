export function JournalSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 pt-16 sm:pt-10 pb-10">
      {/* Sidebar placeholder */}
      <div className="fixed left-0 top-0 w-14 sm:w-64 h-screen bg-zinc-950 border-r border-zinc-900" />

      {/* Main content */}
      <div className="max-w-2xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <div className="h-6 bg-zinc-900 rounded-lg w-32" />
            <div className="h-4 bg-zinc-900 rounded-lg w-24" />
          </div>

          <div className="h-4 bg-zinc-900 rounded-lg w-48" />
        </div>

        {/* Search skeleton */}
        <div className="h-10 bg-zinc-900 rounded-lg mb-4 animate-pulse" />

        {/* Filters skeleton */}
        <div className="flex gap-2 mb-8 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-8 bg-zinc-900 rounded-full w-20"
            />
          ))}
        </div>

        {/* Entries skeleton */}
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#14213D] border border-zinc-800/80 rounded-xl p-5 animate-pulse"
            >
              {/* Entry header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 bg-zinc-900 rounded-full w-16" />
                    <div className="h-4 bg-zinc-900 rounded w-20" />
                  </div>

                  <div className="h-3 bg-zinc-900 rounded w-32" />
                </div>

                <div className="w-2 h-2 rounded-full bg-zinc-700 flex-shrink-0 mt-1" />
              </div>

              {/* Entry content skeleton */}
              <div className="space-y-2">
                <div className="h-3 bg-zinc-900 rounded" />
                <div className="h-3 bg-zinc-900 rounded" />
                <div className="h-3 bg-zinc-900 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="flex gap-1 justify-center mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-4 bg-brand-orange rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  )
}