"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Bookmark, Clock, Compass, ExternalLink, Filter } from "lucide-react"
import { BookmarkButton } from "@/components/bookmark-button"
import { ReadButton } from "@/components/read-button"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ────────────────────────────────────────────────────────────────────

type Topic = { id: string; name: string; icon: string | null; slug: string }

export type BookmarkedArticle = {
  id: string
  title: string
  url: string
  description: string | null
  imageUrl?: string | null
  publishedAt: Date | null
  savedAt: Date
  source: { name: string }
  articleTopics: Topic[]
  isRead: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date | string | null): string {
  if (!date) return ""
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function readingMins(text: string | null): number {
  if (!text) return 1
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

// ─── Library card ─────────────────────────────────────────────────────────────

function LibraryCard({
  article,
  index,
  onReadChange,
  onBookmarkRemove,
}: {
  article: BookmarkedArticle
  index: number
  onReadChange: (id: string, isRead: boolean) => void
  onBookmarkRemove: (id: string) => void
}) {
  const [read, setRead] = useState(article.isRead)
  const [imgError, setImgError] = useState(false)

  const showImage = article.imageUrl && !imgError
  const primaryTopic = article.articleTopics[0]
  const mins = readingMins(article.description)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.03, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group flex gap-4 rounded-2xl border p-4 transition-all duration-200
        ${read
          ? "bg-stone-50 dark:bg-[#0D1117] border-stone-200 dark:border-[#1E2A3A] border-l-4 border-l-stone-300 dark:border-l-[#2D3B4F]"
          : "bg-white dark:bg-[#161C26] border-stone-200 dark:border-[#1E2A3A] hover:border-stone-300 dark:hover:border-[#2D3B4F] hover:shadow-md hover:shadow-stone-200/50 dark:hover:shadow-black/30 hover:-translate-y-0.5"
        }`}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0">
        {showImage ? (
          <img
            src={article.imageUrl!}
            alt=""
            onError={() => setImgError(true)}
            className="w-20 h-20 rounded-xl object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-[#2A3547] dark:to-[#2A3547] flex items-center justify-center text-2xl">
            {primaryTopic?.icon ?? "📄"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {primaryTopic && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-xs font-medium text-stone-400 dark:text-[#6B7585]">{primaryTopic.name}</span>
          </div>
        )}

        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm font-semibold leading-snug hover:text-amber-700 transition-colors line-clamp-2
            ${read ? "text-stone-400 dark:text-[#6B7585]" : "text-stone-900 dark:text-[#F0EDE6]"}`}
        >
          {article.title}
        </Link>

        {article.description && (
          <p className="text-xs text-stone-400 dark:text-[#6B7585] leading-relaxed line-clamp-2 hidden sm:block">
            {article.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-[#6B7585]">
            <span className="font-medium text-stone-500 dark:text-[#B8C0CC]">{article.source.name}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {mins} min
            </span>
            <span>·</span>
            <span>saved {timeAgo(article.savedAt)}</span>
          </div>

          <div className="flex items-center gap-0.5">
            <ReadButton
              articleId={article.id}
              initialRead={read}
              onToggle={(isRead) => {
                setRead(isRead)
                onReadChange(article.id, isRead)
              }}
            />
            <BookmarkButton
              articleId={article.id}
              initialBookmarked={true}
              onToggle={(isBookmarked) => {
                if (!isBookmarked) onBookmarkRemove(article.id)
              }}
            />
            <Link
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-7 h-7 rounded-md text-stone-400 dark:text-[#6B7585] hover:text-stone-700 dark:hover:text-[#C8C4BC] hover:bg-stone-100 dark:hover:bg-[#1E2533] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Topic section ────────────────────────────────────────────────────────────

function TopicSection({
  topic,
  articles,
  baseIndex,
  onReadChange,
  onBookmarkRemove,
}: {
  topic: Topic
  articles: BookmarkedArticle[]
  baseIndex: number
  onReadChange: (id: string, isRead: boolean) => void
  onBookmarkRemove: (id: string) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-base leading-none">{topic.icon ?? "📄"}</span>
        <span className="text-sm font-semibold text-stone-700 dark:text-[#C8C4BC]">{topic.name}</span>
        <span className="text-xs text-stone-400 dark:text-[#6B7585] bg-stone-100 dark:bg-[#1E2533] px-2 py-0.5 rounded-full">
          {articles.length}
        </span>
        <div className="flex-1 h-px bg-stone-100 dark:bg-[#1E2A3A]/60" />
      </div>
      <div className="flex flex-col gap-3">
        {articles.map((a, i) => (
          <LibraryCard
            key={a.id}
            article={a}
            index={baseIndex + i}
            onReadChange={onReadChange}
            onBookmarkRemove={onBookmarkRemove}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function BookmarksClient({ initialArticles }: { initialArticles: BookmarkedArticle[] }) {
  const [articles, setArticles] = useState(initialArticles)
  const [readStates, setReadStates] = useState<Record<string, boolean>>(
    Object.fromEntries(initialArticles.map((a) => [a.id, a.isRead]))
  )
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [sort, setSort] = useState<"newest" | "oldest">("newest")

  function handleReadChange(id: string, isRead: boolean) {
    setReadStates((prev) => ({ ...prev, [id]: isRead }))
  }

  function handleBookmarkRemove(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }

  const readCount = useMemo(
    () => Object.values(readStates).filter(Boolean).length,
    [readStates]
  )
  const unreadMins = useMemo(
    () => articles.filter((a) => !readStates[a.id]).reduce((sum, a) => sum + readingMins(a.description), 0),
    [articles, readStates]
  )

  const allTopics = useMemo(() => {
    const seen = new Map<string, Topic>()
    for (const a of articles) {
      const t = a.articleTopics[0]
      if (t && !seen.has(t.id)) seen.set(t.id, t)
    }
    return Array.from(seen.values())
  }, [articles])

  const filtered = useMemo(() => {
    const base = activeTopicId
      ? articles.filter((a) => a.articleTopics[0]?.id === activeTopicId)
      : articles
    return [...base].sort((a, b) => {
      const da = new Date(a.savedAt).getTime()
      const db_ = new Date(b.savedAt).getTime()
      return sort === "newest" ? db_ - da : da - db_
    })
  }, [articles, activeTopicId, sort])

  const grouped = useMemo(() => {
    if (activeTopicId) return null
    const map = new Map<string, { topic: Topic; articles: BookmarkedArticle[] }>()
    for (const a of filtered) {
      const t = a.articleTopics[0]
      const key = t?.id ?? "__none__"
      if (!map.has(key)) {
        map.set(key, {
          topic: t ?? { id: "__none__", name: "Other", icon: "📄", slug: "" },
          articles: [],
        })
      }
      map.get(key)!.articles.push(a)
    }
    return Array.from(map.values())
  }, [filtered, activeTopicId])

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="py-24 text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-[#2A3547] dark:to-[#2A3547] flex items-center justify-center mb-6">
            <Bookmark className="w-9 h-9 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 dark:text-[#E8E3DA]">Your library is empty</h2>
          <p className="text-stone-400 dark:text-[#6B7585] text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            Save articles while reading to build your personal reading list.
          </p>
          <Link
            href="/discover"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <Compass className="w-4 h-4" />
            Browse topics
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div>
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-4 sm:mx-6 mb-6 grid grid-cols-3 gap-3"
      >
        {[
          { value: articles.length, label: "saved" },
          { value: readCount, label: "read" },
          { value: `${unreadMins}m`, label: "left to read" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-0.5 rounded-2xl bg-white dark:bg-[#161C26] border border-stone-200 dark:border-[#1E2A3A] px-4 py-3">
            <span className="text-2xl font-bold text-stone-900 dark:text-[#F0EDE6]">{value}</span>
            <span className="text-xs text-stone-400 dark:text-[#6B7585]">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Controls */}
      <div className="px-4 sm:px-6 mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 flex-1 min-w-0">
          <button
            onClick={() => setActiveTopicId(null)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-150
              ${!activeTopicId
                ? "bg-stone-900 dark:bg-[#F0EDE6] text-white dark:text-[#0D1117]"
                : "bg-stone-100 dark:bg-[#1E2533] text-stone-500 dark:text-[#B8C0CC] hover:bg-stone-200 dark:hover:bg-[#252F3F]"}`}
          >
            All
          </button>
          {allTopics.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTopicId(t.id === activeTopicId ? null : t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-150
                ${activeTopicId === t.id
                  ? "bg-amber-500 text-white"
                  : "bg-stone-100 dark:bg-[#1E2533] text-stone-500 dark:text-[#B8C0CC] hover:bg-stone-200 dark:hover:bg-[#252F3F]"}`}
            >
              <span>{t.icon}</span>
              {t.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-[#B8C0CC] hover:text-stone-800 dark:hover:text-[#E8E3DA] bg-stone-100 dark:bg-[#1E2533] hover:bg-stone-200 dark:hover:bg-[#252F3F] px-3 py-1.5 rounded-full transition-all"
        >
          <Filter className="w-3 h-3" />
          {sort === "newest" ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* Articles */}
      <div className="px-4 sm:px-6 pb-10">
        <AnimatePresence mode="popLayout">
          {activeTopicId || !grouped ? (
            <motion.div key="flat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
              {filtered.map((a, i) => (
                <LibraryCard
                  key={a.id}
                  article={a}
                  index={i}
                  onReadChange={handleReadChange}
                  onBookmarkRemove={handleBookmarkRemove}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div key="grouped" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              {grouped.map((group, gi) => {
                const baseIndex = grouped.slice(0, gi).reduce((sum, g) => sum + g.articles.length, 0)
                return (
                  <TopicSection
                    key={group.topic.id}
                    topic={group.topic}
                    articles={group.articles}
                    baseIndex={baseIndex}
                    onReadChange={handleReadChange}
                    onBookmarkRemove={handleBookmarkRemove}
                  />
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
