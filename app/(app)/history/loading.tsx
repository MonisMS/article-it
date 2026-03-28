export default function HistoryLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-8 pb-6 border-b border-stone-200 dark:border-[#1E2A3A]">
        <div className="h-8 w-36 bg-stone-200 dark:bg-[#1E2533] rounded-lg mb-2" />
        <div className="h-4 w-56 bg-stone-100 dark:bg-[#1E2533]/60 rounded" />
      </div>

      <div className="px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-5 py-4">
              <div className="h-7 w-10 bg-stone-200 dark:bg-[#1E2533] rounded mb-1" />
              <div className="h-3 w-24 bg-stone-100 dark:bg-[#1E2533]/60 rounded" />
            </div>
          ))}
        </div>

        {/* Month label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-3 w-24 bg-stone-200 dark:bg-[#1E2533] rounded" />
          <div className="flex-1 h-px bg-stone-100 dark:bg-[#1E2A3A]/60" />
        </div>

        {/* Digest rows */}
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#1E2533] flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-stone-200 dark:bg-[#1E2533] rounded mb-1.5" />
                <div className="h-3 w-24 bg-stone-100 dark:bg-[#1E2533]/60 rounded" />
              </div>
              <div className="h-3 w-16 bg-stone-100 dark:bg-[#1E2533]/60 rounded hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
