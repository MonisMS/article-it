const SOURCES = [
  "Hacker News",
  "r/programming",
  "r/MachineLearning",
  "YouTube Channels",
  "Substack Newsletters",
  "GitHub Releases",
  "TLDR Newsletter",
  "Lobste.rs",
  "The Changelog",
  "Tech Blogs",
  "r/webdev",
  "Morning Brew",
  "r/startups",
  "Dev.to",
  "r/netsec",
]

export function SourceMarquee() {
  const doubled = [...SOURCES, ...SOURCES]

  return (
    <div className="bg-app-bg py-10 overflow-hidden">
      <p className="text-center text-xs font-semibold text-app-text-subtle tracking-widest uppercase mb-5">
        We pull from across the web so you don&apos;t have to
      </p>
      <div className="relative">
        <div className="flex gap-3 animate-marquee whitespace-nowrap">
          {doubled.map((source, i) => (
            <span
              key={i}
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-app-surface px-4 py-2 text-sm font-medium text-app-text-muted shadow-xs shadow-black/5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-app-accent inline-block" />
              {source}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-app-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-app-bg to-transparent" />
      </div>
    </div>
  )
}
