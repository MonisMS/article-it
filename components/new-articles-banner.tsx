export function NewArticlesBanner({ count, sinceLabel = "your last visit" }: { count: number; sinceLabel?: string }) {
  return (
    <div className="border-b border-stone-200/80 dark:border-[#1E2A3A] pb-4">
      <p className="text-sm text-stone-500 dark:text-[#8A95A7]">
        <span className="font-medium text-stone-700 dark:text-[#B8C0CC]">
          {count} new article{count === 1 ? "" : "s"}
        </span>
        {" "}since {sinceLabel}
      </p>
    </div>
  )
}
