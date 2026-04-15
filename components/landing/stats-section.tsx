"use client"

import { useEffect, useRef, useState } from "react"

const STATS = [
  { value: 130, suffix: "+", label: "Curated sources" },
  { value: 12,  suffix: "",  label: "Topics to follow" },
  { value: 24,  suffix: "h", label: "Feed refresh cycle" },
  { value: 0,   suffix: "",  label: "Algorithms. Ever." },
]

function useCountUp(target: number, duration = 1400, active: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active || target === 0) return
    let start: number | null = null
    let rafId = 0
    const step = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [active, target, duration])

  return active ? count : target
}

function StatCard({ value, suffix, label }: typeof STATS[number]) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const count = useCountUp(value, 1400, active)

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 py-10 px-6">
      <span className="text-5xl sm:text-6xl font-bold text-lp-text tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-sm text-lp-text-subtle font-medium">{label}</span>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="bg-lp-bg border-b border-lp-border">
      <div className="mx-auto max-w-5xl grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-lp-border">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
    </section>
  )
}
