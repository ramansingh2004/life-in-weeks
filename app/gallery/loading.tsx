export default function Gallery() {
  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
      {/* Sidebar placeholder */}
    <div className="fixed left-0 top-0 w-14 sm:w-64 h-screen bg-zinc-950 border-r border-zinc-900" />

      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 animate-pulse">
          {/* Back button */}
          <div className="h-3 bg-zinc-900 rounded w-20 mb-4" />

          {/* Title */}
          <div className="h-8 bg-zinc-900 rounded-lg w-48 mb-2" />

          {/* Subtitle */}
          <div className="h-4 bg-zinc-900 rounded w-64" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#14213D] border border-zinc-800/80 rounded-lg p-4 animate-pulse"
            >
              {/* Label */}
              <div className="h-3 bg-zinc-900 rounded w-16 mb-2" />

              {/* Value */}
              <div className="h-6 bg-zinc-900 rounded w-24 mb-2" />

              {/* Description */}
              <div className="h-3 bg-zinc-900 rounded w-20" />
            </div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="mb-8 space-y-4 animate-pulse">
          {/* Search bar and filter button */}
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-zinc-900 rounded-lg" />
            <div className="h-10 bg-zinc-900 rounded-lg w-32" />
          </div>

          {/* Results info */}
          <div className="h-3 bg-zinc-900 rounded w-40" />
        </div>

        {/* Photo Grid skeleton */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            const heights = ['h-48', 'h-64', 'h-56', 'h-72']
            const heightClass = heights[i % heights.length]

            return (
              <div
                key={i}
                className="break-inside-avoid animate-pulse"
              >
                <div
                  className={`bg-zinc-900 rounded-lg ${heightClass} overflow-hidden relative`}
                >
                  {/* Overlay placeholder */}
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full p-3">
                      <div className="h-4 bg-zinc-800 rounded w-24 mb-2" />
                      <div className="h-3 bg-zinc-800 rounded w-16" />
                    </div>
                  </div>

                  {/* Icon placeholder */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-zinc-800 rounded-full" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Infinite scroll loader skeleton */}
        <div className="flex gap-1 justify-center mt-12">
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