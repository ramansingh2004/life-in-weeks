export default function Loading() {
  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
      {/* Sidebar placeholder */}
      <div className="fixed left-0 top-0 w-14 sm:w-64 h-screen bg-zinc-950 border-r border-zinc-900" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-pulse">
          <div className="h-3 w-24 bg-zinc-900 rounded mb-4" />
          <div className="h-12 w-72 bg-zinc-900 rounded-lg mb-3" />
          <div className="h-4 w-44 bg-zinc-900 rounded" />
        </div>

        {/* Timeline */}
        <div className="mb-12 animate-pulse">
          <div className="h-2 w-full bg-zinc-900 rounded-full mb-6" />

          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-zinc-900 mb-3" />
                <div className="h-3 w-20 bg-zinc-900 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Chapter cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pulse"
            >
              <div className="h-40 bg-zinc-800 rounded-xl mb-5" />

              <div className="h-6 w-48 bg-zinc-800 rounded mb-3" />
              <div className="h-4 w-full bg-zinc-800 rounded mb-2" />
              <div className="h-4 w-3/4 bg-zinc-800 rounded mb-5" />

              <div className="flex gap-3">
                <div className="h-7 w-20 bg-zinc-800 rounded-full" />
                <div className="h-7 w-20 bg-zinc-800 rounded-full" />
                <div className="h-7 w-20 bg-zinc-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}