const TOPICS = [
  { icon: "⚛️",  name: "React" },
  { icon: "🟨",  name: "JavaScript" },
  { icon: "🤖",  name: "AI & ML" },
  { icon: "🚀",  name: "Startups" },
  { icon: "🛡️",  name: "Cybersecurity" },
  { icon: "📈",  name: "Finance" },
  { icon: "🎨",  name: "Design" },
  { icon: "☁️",  name: "DevOps" },
  { icon: "📱",  name: "Product" },
  { icon: "🧬",  name: "Science" },
  { icon: "💼",  name: "Marketing" },
  { icon: "🌍",  name: "Open Source" },
]

export function TopicsStrip() {
  const doubled = [...TOPICS, ...TOPICS]

  return (
    <section className="bg-lp-surface/30 py-20 border-t border-lp-border overflow-hidden">
      <p className="text-center text-xs font-semibold tracking-widest uppercase text-lp-text-subtle mb-8">
        Topics you can follow
      </p>

      <div className="relative">
        <div className="flex gap-3 animate-marquee-slow">
          {doubled.map(({ icon, name }, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 shrink-0 rounded-full border border-lp-border bg-lp-surface px-4 py-2 text-sm font-medium text-lp-text-muted"
            >
              <span>{icon}</span>
              {name}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-lp-surface/30 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-lp-surface/30 to-transparent" />
      </div>
    </section>
  )
}
