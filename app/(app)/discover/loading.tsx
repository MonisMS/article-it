export default function DiscoverLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-40 bg-stone-200 dark:bg-[#1E2533] rounded-lg mb-2" />
        <div className="h-4 w-64 bg-stone-100 dark:bg-[#1E2533]/60 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl aspect-square bg-stone-200 dark:bg-[#1E2533]" />
        ))}
      </div>
    </div>
  )
}
