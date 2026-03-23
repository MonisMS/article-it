export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-32 bg-zinc-200 rounded-lg mb-2" />
        <div className="h-4 w-56 bg-zinc-100 rounded" />
      </div>

      {/* Topic filter skeleton */}
      <div className="flex gap-2 mb-6">
        {[80, 100, 90, 110, 85].map((w) => (
          <div key={w} className="h-7 bg-zinc-200 rounded-full flex-shrink-0" style={{ width: w }} />
        ))}
      </div>

      {/* Article card skeletons */}
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-col gap-3">
            <div className="h-3.5 w-20 bg-zinc-100 rounded" />
            <div className="space-y-1.5">
              <div className="h-4 bg-zinc-200 rounded w-full" />
              <div className="h-4 bg-zinc-200 rounded w-4/5" />
            </div>
            <div className="space-y-1">
              <div className="h-3 bg-zinc-100 rounded w-full" />
              <div className="h-3 bg-zinc-100 rounded w-3/4" />
            </div>
            <div className="flex justify-between pt-1">
              <div className="h-3 w-28 bg-zinc-100 rounded" />
              <div className="h-6 w-14 bg-zinc-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
