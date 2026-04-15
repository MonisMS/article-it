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

function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#080C12]">
      <div
        className="absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, #d97706 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "aurora-pulse 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "aurora-pulse 12s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)",
          filter: "blur(70px)",
          animation: "aurora-pulse 10s ease-in-out infinite 2s",
        }}
      />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300 ${
              step < current
                ? "bg-amber-500 text-black"
                : step === current
                ? "bg-amber-500/20 border border-amber-500 text-amber-400"
                : "bg-white/10 border border-white/10 text-white/30"
            }`}
          >
            {step < current ? <Check className="w-3 h-3" strokeWidth={3} /> : step}
          </div>
          {step < 2 && (
            <div className="relative w-12 h-px bg-white/10">
              <div
                className="absolute inset-y-0 left-0 bg-amber-500 transition-all duration-500"
                style={{ width: current > 1 ? "100%" : "0%" }}
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
      className={`relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left cursor-pointer overflow-hidden transition-colors duration-300 ${
        isSelected
          ? "bg-amber-500/10 border-amber-500/50"
          : "bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20"
      }`}
      style={
        isSelected
          ? { boxShadow: "0 0 24px rgba(245,158,11,0.18), inset 0 0 0 1px rgba(245,158,11,0.3)" }
          : undefined
      }
    >
      {/* Ambient glow on selected */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none"
        />
      )}

      {/* Header row */}
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
              className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0"
            >
              <Check className="w-3 h-3 text-black" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p
          className={`text-sm font-semibold leading-snug transition-colors duration-200 ${
            isSelected ? "text-amber-300" : "text-white/90"
          }`}
        >
          {topic.name}
        </p>
        {topic.description && (
          <p className="text-xs text-white/35 mt-1 line-clamp-2 leading-relaxed">
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
          {/* Backdrop fade */}
          <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-[#080C12]/80 to-transparent pointer-events-none" />

          <div className="bg-[#0d1117]/90 backdrop-blur-xl border-t border-white/10 px-4 py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              {/* Selected pills */}
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
                      className="inline-flex items-center gap-1 text-xs bg-amber-500/15 text-amber-300 border border-amber-500/25 px-2.5 py-1 rounded-full whitespace-nowrap"
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
                      className="text-xs text-white/40 py-1 px-1"
                    >
                      +{selectedTopics.length - 4} more
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Continue button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onContinue}
                disabled={saving}
                className="flex-shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
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
          // Pre-select topics from ?topics= param (comma-separated slugs)
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
      <AuroraBackground />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="flex items-center gap-2.5 font-semibold text-white">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-black">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          <span className="text-white/90">ArticleIt</span>
        </div>
        <StepIndicator current={1} />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-10 pb-8">
        <div className="w-full max-w-2xl">
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
              What moves{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                you?
              </span>
            </h1>
            <p className="mt-3 text-white/50 text-base leading-relaxed">
              Choose the topics you care about. Your feed will be built around these.
            </p>
          </motion.div>

          {/* Topics grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-sm text-white/30">Loading topics…</p>
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

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Empty state hint */}
          {!loading && selected.size === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center text-xs text-white/25"
            >
              Select at least one topic to continue
            </motion.p>
          )}
        </div>
      </main>

      {/* Floating selection shelf */}
      <SelectionShelf
        selected={selected}
        topics={topics}
        saving={saving}
        onContinue={handleContinue}
      />
    </div>
  )
}
