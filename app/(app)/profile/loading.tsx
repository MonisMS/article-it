export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto pb-16 animate-pulse">
      {/* Hero */}
      <div className="px-4 sm:px-6 pt-10 pb-8 border-b border-stone-200 dark:border-[#1E2A3A]">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="w-20 h-20 rounded-2xl bg-stone-200 dark:bg-[#1E2533] flex-shrink-0" />
          <div className="flex-1">
            <div className="h-7 w-40 bg-stone-200 dark:bg-[#1E2533] rounded mb-2" />
            <div className="h-4 w-52 bg-stone-100 dark:bg-[#1E2533]/60 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-stone-200 dark:border-[#1E2A3A]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-20 bg-stone-100 dark:bg-[#1E2533]/60 rounded" />
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 flex flex-col gap-5 mt-8">
        {[180, 120, 200, 150].map((h, i) => (
          <div key={i} className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26]" style={{ height: h }} />
        ))}
      </div>
    </div>
  )
}
