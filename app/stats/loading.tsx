export default function Loading() {
  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 pt-16 sm:pt-10 pb-10">
      {/* Sidebar placeholder */}
      <div className="fixed left-0 top-0 w-14 sm:w-64 h-screen bg-zinc-950 border-r border-zinc-900" />

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 animate-pulse">
        <div className="flex justify-between items-center mb-2">
          <div className="h-7 w-32 bg-zinc-900 rounded" />
          <div className="h-4 w-24 bg-zinc-900 rounded" />
        </div>

        <div className="h-4 w-40 bg-zinc-900 rounded" />
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-10 animate-pulse">
        <div className="flex justify-between mb-2">
          <div className="h-3 w-20 bg-zinc-900 rounded" />
          <div className="h-3 w-20 bg-zinc-900 rounded" />
        </div>

        <div className="h-2 w-full bg-zinc-900 rounded-full" />

        <div className="flex justify-between mt-2">
          <div className="h-3 w-8 bg-zinc-900 rounded" />
          <div className="h-3 w-8 bg-zinc-900 rounded" />
          <div className="h-3 w-8 bg-zinc-900 rounded" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 animate-pulse"
          >
            <div className="h-3 w-24 bg-zinc-800 rounded mb-3" />
            <div className="h-8 w-24 bg-zinc-800 rounded mb-2" />
            <div className="h-3 w-20 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      {/* Mood Chart */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
          <div className="h-4 w-28 bg-zinc-800 rounded mb-2" />
          <div className="h-3 w-40 bg-zinc-800 rounded mb-6" />

          <div className="h-40 bg-zinc-800/50 rounded-lg" />
        </div>
      </div>

      {/* Mood Breakdown */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
          <div className="h-4 w-32 bg-zinc-800 rounded mb-5" />

          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 w-16 bg-zinc-800 rounded" />
                <div className="flex-1 h-2 bg-zinc-800 rounded-full" />
                <div className="h-3 w-4 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="max-w-2xl mx-auto text-center mt-8 animate-pulse">
        <div className="h-3 w-72 mx-auto bg-zinc-900 rounded mb-2" />
        <div className="h-3 w-20 mx-auto bg-zinc-900 rounded" />
      </div>
    </main>
  )
}