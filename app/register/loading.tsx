export default function RegisterSkeleton() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background grid decoration */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md relative z-10 px-1">
        {/* Mini grid preview skeleton */}
        <div className="flex flex-wrap gap-[3px] justify-center mb-10 max-w-full overflow-hidden animate-pulse">
          {Array.from({ length: 80 * 4 }, (_, i) => (
            <div
              key={i}
              className={`w-[6px] h-[6px] rounded-[1px] ${
                i === 80
                  ? 'bg-brand-orange'
                  : 'bg-zinc-900'
              }`}
            />
          ))}
        </div>

        {/* Quote skeleton */}
        <div className="mb-8 text-center animate-pulse">
          <div className="h-4 bg-zinc-900 rounded w-64 mx-auto" />
        </div>

        {/* Title skeleton */}
        <div className="text-center mb-10 animate-pulse">
          <div className="h-12 bg-zinc-900 rounded-lg mb-3 w-48 mx-auto" />
          <div className="h-4 bg-zinc-900 rounded w-64 mx-auto" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-5 animate-pulse">
          {/* Birth date label */}
          <div className="h-3 bg-zinc-900 rounded w-24" />

          {/* Birth date input */}
          <div className="h-11 bg-zinc-900 rounded-xl" />

          {/* Life expectancy label */}
          <div className="flex justify-between items-center">
            <div className="h-3 bg-zinc-900 rounded w-32" />
            <div className="h-3 bg-zinc-900 rounded w-12" />
          </div>

          {/* Life expectancy slider */}
          <div className="h-2 bg-zinc-900 rounded-full" />

          <div className="flex justify-between">
            <div className="h-2 bg-zinc-900 rounded w-8" />
            <div className="h-2 bg-zinc-900 rounded w-8" />
          </div>

          {/* Submit button */}
          <div className="h-12 bg-zinc-900 rounded-xl mt-4" />

          {/* Auth links skeleton */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="h-3 bg-zinc-900 rounded w-20" />
            <div className="h-3 bg-zinc-900 rounded w-2" />
            <div className="h-3 bg-zinc-900 rounded w-20" />
          </div>
        </div>

        {/* Features row skeleton */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-10 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="h-4 w-4 bg-zinc-900 rounded" />
              <div className="h-3 w-12 bg-zinc-900 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-4 bg-brand-orange rounded-full animate-pulse"
          />
        ))}
      </div>
    </main>
  )
}