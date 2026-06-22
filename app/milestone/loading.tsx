export default function MilestonesSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white pt-14 sm:pt-10 px-4 py-10">
      {/* Sidebar placeholder */}
      <div className="fixed left-0 top-0 w-14 sm:w-64 h-screen bg-zinc-950 border-r border-zinc-900" />

      {/* Main content */}
      <div className="max-w-3xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-8 bg-zinc-900 rounded-lg w-56 mb-2" />
              <div className="h-4 bg-zinc-900 rounded-lg w-40" />
            </div>

            <div className="h-4 bg-zinc-900 rounded-lg w-32" />
          </div>
        </div>

        {/* Filters skeleton */}
        <div className="mb-8 flex gap-2 flex-wrap animate-pulse">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 bg-zinc-900 rounded-lg w-24"
            />
          ))}
        </div>

        {/* Timeline items skeleton */}
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-start gap-3">
                {/* Icon placeholder */}
                <div className="w-8 h-8 bg-zinc-800 rounded flex-shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <div className="h-5 bg-zinc-800 rounded w-40" />
                    <div className="h-3 bg-zinc-800 rounded w-20" />
                  </div>

                  <div className="h-4 bg-zinc-800 rounded w-56 mb-2" />

                  <div className="h-3 bg-zinc-800 rounded w-32" />
                </div>
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