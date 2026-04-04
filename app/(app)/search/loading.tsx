export default function SearchLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-6 animate-pulse">
      <div className="mb-7 flex flex-col items-center gap-4">
        <div className="h-8 w-48 bg-stone-200 dark:bg-[#1E2533] rounded-lg" />
        <div className="h-12 w-full max-w-xl bg-stone-200 dark:bg-[#1E2533] rounded-xl" />
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {[90, 110, 80, 120, 95].map((w) => (
          <div key={w} className="h-7 bg-stone-100 dark:bg-[#1E2533]/60 rounded-full" style={{ width: w }} />
        ))}
      </div>
    </div>
  )
}
