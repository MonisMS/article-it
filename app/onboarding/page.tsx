"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BookOpen, Check, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Topic = {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
}

// ─── Background ───────────────────────────────────────────────────────────────

function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-app-bg">
      <div className="absolute left-1/2 -top-40 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-app-accent/8 blur-[80px]" />
      <div className="absolute -right-32 bottom-0 h-[320px] w-[320px] rounded-full bg-app-accent/6 blur-[90px]" />
      <div className="absolute -left-24 top-1/3 h-[280px] w-[280px] rounded-full bg-app-accent/5 blur-[80px]" />
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300 ${
              step < current
                ? "bg-app-accent text-white"
                : step === current
                ? "bg-app-accent-light border border-app-accent text-app-accent"
                : "bg-app-surface border border-app-border text-app-text-subtle"
            }`}
          >
            {step < current ? <Check className="w-3 h-3" strokeWidth={3} /> : step}
          </div>
          {step < 3 && (
            <div className="relative w-10 h-px bg-app-border">
              <div
                className="absolute inset-y-0 left-0 bg-app-accent transition-all duration-500"
                style={{ width: current > step ? "100%" : "0%" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Topic card ───────────────────────────────────────────────────────────────

function TopicCard({
  topic,
  isSelected,
  onToggle,
  index,
}: {
  topic: Topic
  isSelected: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <motion.button
      onClick={onToggle}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left cursor-pointer overflow-hidden transition-all duration-200 shadow-sm ${
        isSelected
          ? "bg-app-accent-light border-app-accent/40 shadow-app-accent/10"
          : "bg-app-surface border-app-border hover:bg-app-surface-hover hover:border-app-border-strong hover:shadow-md"
      }`}
      style={
        isSelected
          ? { boxShadow: "0 0 0 1px rgba(194,104,10,0.25), 0 4px 16px rgba(194,104,10,0.10)" }
          : undefined
      }
    >
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-app-accent/5 via-transparent to-transparent pointer-events-none"
        />
      )}

      <div className="flex items-center justify-between w-full">
        <motion.span
          animate={{ scale: isSelected ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="text-2xl leading-none"
        >
          {topic.icon}
        </motion.span>

        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="w-5 h-5 rounded-full bg-app-accent flex items-center justify-center flex-shrink-0"
            >
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="min-w-0">
        <p
          className={`text-sm font-semibold leading-snug transition-colors duration-200 ${
            isSelected ? "text-app-accent" : "text-app-text"
          }`}
        >
          {topic.name}
        </p>
        {topic.description && (
          <p className="text-xs text-app-text-subtle mt-1 line-clamp-2 leading-relaxed">
            {topic.description}
          </p>
        )}
      </div>
    </motion.button>
  )
}

// ─── Selection shelf ──────────────────────────────────────────────────────────

function SelectionShelf({
  selected,
  topics,
  saving,
  onContinue,
}: {
  selected: Set<string>
  topics: Topic[]
  saving: boolean
  onContinue: () => void
}) {
  const selectedTopics = topics.filter((t) => selected.has(t.id))

  return (
    <AnimatePresence>
      {selected.size > 0 && (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-app-bg/80 to-transparent pointer-events-none" />

          <div className="bg-app-bg/95 backdrop-blur-xl border-t border-app-border px-4 py-4 shadow-lg shadow-black/5">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5 min-w-0">
                <AnimatePresence mode="popLayout">
                  {selectedTopics.slice(0, 4).map((t) => (
                    <motion.span
                      key={t.id}
                      layout
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="inline-flex items-center gap-1 text-xs bg-app-accent-light text-app-accent border border-app-accent/25 px-2.5 py-1 rounded-full whitespace-nowrap"
                    >
                      <span>{t.icon}</span>
                      {t.name}
                    </motion.span>
                  ))}
                  {selectedTopics.length > 4 && (
                    <motion.span
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-app-text-subtle py-1 px-1"
                    >
                      +{selectedTopics.length - 4} more
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onContinue}
                disabled={saving}
                className="flex-shrink-0 flex items-center gap-2 bg-app-accent hover:opacity-90 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-black/10 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving
                  ? "Saving…"
                  : `Continue with ${selected.size} topic${selected.size === 1 ? "" : "s"} →`}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [topics, setTopics] = useState<Topic[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then(({ data }: { data: Topic[] }) => {
        if (data) {
          setTopics(data)
          const slugParam = searchParams.get("topics")
          if (slugParam) {
            const slugs = new Set(slugParam.split(",").map((s) => s.trim()).filter(Boolean))
            const preSelected = new Set(data.filter((t) => slugs.has(t.slug)).map((t) => t.id))
            if (preSelected.size > 0) setSelected(preSelected)
          }
        }
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleContinue() {
    if (selected.size === 0) {
      setError("Pick at least one topic to continue.")
      return
    }
    setError("")
    setSaving(true)

    const res = await fetch("/api/user/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicIds: Array.from(selected) }),
    })
    const { error } = await res.json()

    if (error) {
      setError(error)
      setSaving(false)
      return
    }

    router.push("/onboarding/schedule")
  }

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <PageBackground />

      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="flex items-center gap-2.5 font-semibold text-app-text">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-app-accent text-white">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          Curio
        </div>
        <StepIndicator current={1} />
      </header>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-10 pb-8">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-semibold text-app-text leading-tight tracking-tight">
              What moves{" "}
              <span className="text-app-accent">you?</span>
            </h1>
            <p className="mt-3 text-app-text-muted text-base leading-relaxed">
              Choose the topics you care about. Your feed will be built around these.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-app-accent" />
              <p className="text-sm text-app-text-subtle">Loading topics…</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topics.map((topic, i) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isSelected={selected.has(topic.id)}
                  onToggle={() => toggle(topic.id)}
                  index={i}
                />
              ))}
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-sm text-red-600"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {!loading && selected.size === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center text-xs text-app-text-subtle"
            >
              Select at least one topic to continue
            </motion.p>
          )}
        </div>
      </main>

      <SelectionShelf
        selected={selected}
        topics={topics}
        saving={saving}
        onContinue={handleContinue}
      />
    </div>
  )
}
