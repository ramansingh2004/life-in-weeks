export function GridSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Sidebar skeleton */}
      <div className="fixed left-0 top-0 w-14 sm:w-64 h-screen bg-zinc-950 border-r border-zinc-900">
        <div className="p-4 space-y-4 animate-pulse">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 bg-zinc-900 rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-14 sm:pt-10 px-4 sm:px-6 py-10 sm:ml-64">
        <div className="max-w-5xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-zinc-900 rounded-lg mb-3 w-56" />
            <div className="h-4 bg-zinc-900 rounded-lg w-80" />
          </div>

          {/* Date search skeleton */}
          <div className="h-10 bg-zinc-900 rounded-lg mb-6 animate-pulse" />

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 bg-zinc-900 rounded-lg border border-zinc-800"
              />
            ))}
          </div>

          {/* Grid skeleton */}
          <div className="mb-10 overflow-x-auto pb-4">
            <div className="flex gap-2">
              {/* Year labels */}
              <div className="flex flex-col gap-[4px] pt-[1px] flex-shrink-0">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-[14px]"
                  />
                ))}
              </div>

              {/* Grid squares skeleton */}
              <div className="flex flex-col gap-[4px] flex-shrink-0 animate-pulse">
                {[...Array(16)].map((_, yearIdx) => (
                  <div
                    key={yearIdx}
                    className="flex gap-[4px]"
                  >
                    {[...Array(52)].map((_, weekIdx) => (
                      <div
                        key={weekIdx}
                        className="w-[14px] h-[14px] rounded-[2px] bg-zinc-900"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Column labels */}
            <div className="flex gap-[4px] mt-3 ml-8">
              {[...Array(52)].map((_, i) => (
                <div
                  key={i}
                  className="w-[14px] text-center flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Legend skeleton */}
          <div className="flex items-center gap-6 flex-wrap text-xs mb-10 animate-pulse">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2"
              >
                <div className="w-[14px] h-[14px] rounded-[2px] bg-zinc-900" />
                <div className="h-3 bg-zinc-900 rounded w-16" />
              </div>
            ))}
          </div>

          {/* Footer skeleton */}
          <div className="text-center pb-10 animate-pulse">
            <div className="h-4 bg-zinc-900 rounded-lg w-72 mx-auto mb-2" />
            <div className="h-4 bg-zinc-900 rounded-lg w-64 mx-auto" />
          </div>
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