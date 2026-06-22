export default function Loading() {
  return (
    <main className="min-h-screen bg-black flex lg:grid lg:grid-cols-12 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-50 h-9 w-28 rounded-full bg-zinc-900 animate-pulse" />

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 border-r border-zinc-900/60">
        {/* Logo */}
        <div className="h-8 w-44 bg-zinc-900 rounded animate-pulse mt-8" />

        {/* Content */}
        <div className="my-auto space-y-10 max-w-sm">
          {/* Heading */}
          <div>
            <div className="h-8 w-56 bg-zinc-900 rounded mb-3 animate-pulse" />
            <div className="h-8 w-40 bg-zinc-900 rounded mb-4 animate-pulse" />
            <div className="h-3 w-full bg-zinc-900 rounded animate-pulse" />
          </div>

          {/* Feature list */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-4 h-4 rounded-full bg-zinc-900 animate-pulse mt-1" />
              <div className="flex-1">
                <div className="h-3 w-40 bg-zinc-900 rounded mb-2 animate-pulse" />
                <div className="h-3 w-full bg-zinc-900 rounded animate-pulse" />
              </div>
            </div>
          ))}

          {/* Social proof card */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
            <div className="h-4 w-24 bg-zinc-900 rounded mb-2 animate-pulse" />
            <div className="h-3 w-48 bg-zinc-900 rounded animate-pulse" />
          </div>
        </div>

        {/* Security note */}
        <div className="h-3 w-56 bg-zinc-900 rounded animate-pulse" />
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full col-span-12 lg:col-span-7 flex items-center justify-center px-4 md:px-8 py-12 relative z-10">
        <div className="w-full max-w-sm bg-zinc-950/60 border border-zinc-800 rounded-3xl p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="h-8 w-44 bg-zinc-900 rounded mb-3 animate-pulse" />
            <div className="h-4 w-40 bg-zinc-900 rounded animate-pulse" />
          </div>

          {/* Tabs */}
          <div className="h-10 bg-zinc-900 rounded-xl mb-6 animate-pulse" />

          {/* Google signup button */}
          <div className="h-12 bg-zinc-900 rounded-xl mb-4 animate-pulse" />

          {/* Helper text */}
          <div className="h-3 w-48 mx-auto bg-zinc-900 rounded mb-6 animate-pulse" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <div className="h-3 w-4 bg-zinc-800 rounded" />
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Login link */}
          <div className="h-4 w-40 mx-auto bg-zinc-900 rounded animate-pulse" />
        </div>

        {/* Footer note */}
        <div className="absolute bottom-20">
          <div className="h-3 w-56 bg-zinc-900 rounded animate-pulse" />
        </div>
      </div>
    </main>
  )
}