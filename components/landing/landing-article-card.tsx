import { Clock } from "lucide-react"

export type LandingArticleCardData = {
  topic: string
  title: string
  description: string
  source: string
  published: string
  readTime: string
}

type Props = {
  article: LandingArticleCardData
  variant?: "default" | "featured"
  className?: string
}

export function LandingArticleCard({ article, variant = "default", className }: Props) {
  return (
    <article
      className={[
        "group rounded-3xl bg-app-surface shadow-sm shadow-black/5 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-md hover:shadow-black/10",
        variant === "featured" ? "p-7" : "p-6",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-app-accent-light px-3 py-1 text-[11px] font-semibold tracking-wide text-app-text">
          {article.topic}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-app-text-subtle">
          <Clock className="h-3.5 w-3.5" />
          {article.readTime}
        </div>
      </div>

      <h3
        className={[
          "mt-4 font-semibold leading-snug text-app-text transition-colors",
          "group-hover:text-app-accent",
          variant === "featured" ? "text-[20px] sm:text-[22px]" : "text-[16px]",
          "line-clamp-2",
        ].join(" ")}
      >
        {article.title}
      </h3>

      <p
        className={[
          "mt-2 text-sm leading-relaxed text-app-text-muted",
          variant === "featured" ? "line-clamp-3" : "line-clamp-2",
        ].join(" ")}
      >
        {article.description}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 text-[12px] text-app-text-subtle">
        <span className="truncate">{article.source}</span>
        <span className="shrink-0">{article.published}</span>
      </div>
    </article>
  )
}
