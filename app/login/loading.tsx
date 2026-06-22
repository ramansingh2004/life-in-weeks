export default function Loading() {
  return (
    <main className="min-h-screen bg-black flex lg:grid lg:grid-cols-12 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-50 h-9 w-28 rounded-full bg-zinc-900 animate-pulse" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 border-r border-zinc-900/60">
        {/* Brand */}
        <div className="h-8 w-40 bg-zinc-900 rounded animate-pulse mt-8" />

        {/* Content */}
        <div className="my-auto space-y-10 max-w-sm">
          {/* Grid Preview */}
          <div>
            <div className="flex justify-between mb-4">
              <div className="h-3 w-20 bg-zinc-900 rounded animate-pulse" />
              <div className="h-3 w-16 bg-zinc-900 rounded animate-pulse" />
            </div>

            <div
              className="grid gap-1.5 p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800"
              style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
            >
              {Array.from({ length: 120 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-[2px] bg-zinc-900 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="space-y-3">
            <div className="h-4 bg-zinc-900 rounded animate-pulse" />
            <div className="h-4 bg-zinc-900 rounded w-5/6 animate-pulse" />
            <div className="h-3 bg-zinc-900 rounded w-24 animate-pulse" />
          </div>

          {/* Features */}
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 animate-pulse" />
              <div className="flex-1">
                <div className="h-3 w-32 bg-zinc-900 rounded mb-2 animate-pulse" />
                <div className="h-3 w-48 bg-zinc-900 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="h-3 w-56 bg-zinc-900 rounded animate-pulse" />
      </div>

      {/* Right Panel */}
      <div className="w-full lg:col-span-7 flex items-center justify-center px-4 md:px-8 py-12 relative z-10">
        <div className="w-full max-w-sm bg-zinc-950/60 border border-zinc-800 rounded-3xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="h-8 w-40 bg-zinc-900 rounded mb-3 animate-pulse" />
            <div className="h-4 w-32 bg-zinc-900 rounded animate-pulse" />
          </div>

          {/* Tabs */}
          <div className="h-10 rounded-xl bg-zinc-900 mb-6 animate-pulse" />

          {/* Google button */}
          <div className="h-12 rounded-xl bg-zinc-900 mb-4 animate-pulse" />

          {/* Helper text */}
          <div className="h-3 w-48 mx-auto bg-zinc-900 rounded mb-6 animate-pulse" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <div className="h-3 w-4 bg-zinc-800 rounded" />
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Signup link */}
          <div className="h-4 w-40 mx-auto bg-zinc-900 rounded animate-pulse" />
        </div>
      </div>
    </main>
  )
}