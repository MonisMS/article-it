const SOURCES = [
  "TechCrunch", "Ars Technica", "The Verge", "Wired", "MIT Tech Review",
  "Hacker News", "Hugging Face", "GitHub Blog", "OpenAI", "DeepMind",
  "Smashing Magazine", "CSS-Tricks", "Dev.to", "Lobste.rs", "TLDR",
  "Krebs on Security", "Schneier", "Towards Data Science", "Lenny's Newsletter",
  "The Pragmatic Engineer", "ByteByteGo", "Not Boring", "Noahpinion",
]

export function SourceMarquee() {
  const doubled = [...SOURCES, ...SOURCES]

  return (
    <div className="bg-lp-surface border-y border-lp-border py-5 overflow-hidden">
      <p className="text-center text-xs font-medium text-lp-text-subtle tracking-widest uppercase mb-4">
        Pulling from 130+ trusted sources
      </p>
      <div className="relative">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {doubled.map((source, i) => (
            <span
              key={i}
              className="text-sm font-medium text-lp-text-muted shrink-0 flex items-center gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-lp-accent/60 inline-block" />
              {source}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-lp-surface to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-lp-surface to-transparent" />
      </div>
    </div>
  )
}
