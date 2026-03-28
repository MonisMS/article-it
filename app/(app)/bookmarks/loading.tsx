export default function BookmarksLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-8 pb-6 border-b border-stone-200 dark:border-[#1E2A3A]">
        <div className="h-8 w-40 bg-stone-200 dark:bg-[#1E2533] rounded-lg mb-2" />
        <div className="h-4 w-64 bg-stone-100 dark:bg-[#1E2533]/60 rounded" />
      </div>

      <div className="px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-4">
              <div className="h-7 w-10 bg-stone-200 dark:bg-[#1E2533] rounded mb-1" />
              <div className="h-3 w-16 bg-stone-100 dark:bg-[#1E2533]/60 rounded" />
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-4 flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-stone-100 dark:bg-[#1E2533] flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3 w-20 bg-stone-100 dark:bg-[#1E2533]/60 rounded" />
                <div className="h-4 bg-stone-200 dark:bg-[#1E2533] rounded w-full" />
                <div className="h-4 bg-stone-200 dark:bg-[#1E2533] rounded w-3/4" />
                <div className="h-3 bg-stone-100 dark:bg-[#1E2533]/60 rounded w-full mt-1" />
                <div className="h-3 bg-stone-100 dark:bg-[#1E2533]/60 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
