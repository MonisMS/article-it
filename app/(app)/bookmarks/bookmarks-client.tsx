"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bookmark, Clock, Compass, ExternalLink, Filter } from "lucide-react"
import { TopicIcon } from "@/components/topic-icon"
import { AnimatePresence, motion } from "framer-motion"
import { BookmarkButton } from "@/components/bookmark-button"
import { ReadButton } from "@/components/read-button"

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

function LibraryRow({
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

  const primaryTopic = article.articleTopics[0]
  const showImage = article.imageUrl && !imgError
  const mins = readingMins(article.description)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.02, duration: 0.28 }}
      className={`group flex gap-4 rounded-[1.4rem] border border-transparent px-4 py-4 transition-colors ${read ? "opacity-60" : "hover:border-stone-200/80 hover:bg-white/75 dark:hover:border-[#1E2A3A] dark:hover:bg-[#121925]/70"}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">
          {primaryTopic && (
            <>
              <span className="inline-flex items-center gap-1 font-semibold text-stone-500">
                <TopicIcon slug={primaryTopic.slug} size={11} className="opacity-70" />
                {primaryTopic.name}
              </span>
              <span className="text-stone-200 dark:text-[#2A3547]">&bull;</span>
            </>
          )}
          <span>{article.source.name}</span>
          <span className="text-stone-200 dark:text-[#2A3547]">&bull;</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {mins} min
          </span>
          <span className="text-stone-200 dark:text-[#2A3547]">&bull;</span>
          <span>saved {timeAgo(article.savedAt)}</span>
        </div>

        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`line-clamp-2 text-lg font-semibold leading-[1.35] transition-colors hover:text-amber-700 dark:hover:text-[#E8A838] ${read ? "text-stone-400 dark:text-[#4A5568]" : "text-stone-900 dark:text-[#F0EDE6]"}`}
        >
          {article.title}
        </Link>

        {article.description && (
          <p className="line-clamp-2 text-[15px] leading-7 text-stone-600 dark:text-[#B8C0CC]">
            {article.description}
          </p>
        )}

        <div className="mt-1 flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
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
            className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-[#6B7585] dark:hover:bg-[#1E2533] dark:hover:text-[#C8C4BC]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {showImage && (
        <div className="relative mt-1 hidden h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl bg-stone-100 sm:block dark:bg-[#1E2533]">
          <Image
            src={article.imageUrl!}
            alt=""
            fill
            sizes="88px"
            onError={() => setImgError(true)}
            className="object-cover"
          />
        </div>
      )}
    </motion.div>
  )
}

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
    <section>
      <div className="mb-3 flex items-end justify-between gap-4 border-b border-stone-200/70 pb-3 dark:border-[#1E2A3A]">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center text-stone-500"><TopicIcon slug={topic.slug} size={16} /></span>
          <h3 className="text-base font-semibold text-stone-800 dark:text-[#F0EDE6]">{topic.name}</h3>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">
          {articles.length} saved
        </span>
      </div>

      <div className="space-y-1">
        {articles.map((article, index) => (
          <LibraryRow
            key={article.id}
            article={article}
            index={baseIndex + index}
            onReadChange={onReadChange}
            onBookmarkRemove={onBookmarkRemove}
          />
        ))}
      </div>
    </section>
  )
}

export function BookmarksClient({ initialArticles }: { initialArticles: BookmarkedArticle[] }) {
  const [articles, setArticles] = useState(initialArticles)
  const [readStates, setReadStates] = useState<Record<string, boolean>>(
    Object.fromEntries(initialArticles.map((article) => [article.id, article.isRead]))
  )
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [sort, setSort] = useState<"newest" | "oldest">("newest")
  const [viewMode, setViewMode] = useState<"grouped" | "list">("grouped")

  function handleReadChange(id: string, isRead: boolean) {
    setReadStates((prev) => ({ ...prev, [id]: isRead }))
  }

  function handleBookmarkRemove(id: string) {
    setArticles((prev) => prev.filter((article) => article.id !== id))
  }

  const readCount = useMemo(() => Object.values(readStates).filter(Boolean).length, [readStates])
  const unreadMins = useMemo(
    () => articles.filter((article) => !readStates[article.id]).reduce((sum, article) => sum + readingMins(article.description), 0),
    [articles, readStates]
  )

  const allTopics = useMemo(() => {
    const seen = new Map<string, Topic>()
    for (const article of articles) {
      const topic = article.articleTopics[0]
      if (topic && !seen.has(topic.id)) seen.set(topic.id, topic)
    }
    return Array.from(seen.values())
  }, [articles])

  const filtered = useMemo(() => {
    const base = activeTopicId
      ? articles.filter((article) => article.articleTopics[0]?.id === activeTopicId)
      : articles

    return [...base].sort((a, b) => {
      const da = new Date(a.savedAt).getTime()
      const db = new Date(b.savedAt).getTime()
      return sort === "newest" ? db - da : da - db
    })
  }, [articles, activeTopicId, sort])

  const grouped = useMemo(() => {
    if (viewMode === "list") return null
    const map = new Map<string, { topic: Topic; articles: BookmarkedArticle[] }>()
    for (const article of filtered) {
      const topic = article.articleTopics[0]
      const key = topic?.id ?? "__none__"
      if (!map.has(key)) {
        map.set(key, {
          topic: topic ?? { id: "__none__", name: "Other", icon: "*", slug: "" },
          articles: [],
        })
      }
      map.get(key)!.articles.push(article)
    }
    return Array.from(map.values())
  }, [filtered, viewMode])

  if (articles.length === 0) {
    return (
      <div className="px-4 py-24 text-center sm:px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-100 dark:bg-[#1E2533]">
            <Bookmark className="h-9 w-9 text-stone-500 dark:text-[#8A95A7]" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 dark:text-[#E8E3DA]">Your library is empty</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-stone-400 dark:text-[#6B7585]">
            Save articles while reading to build a personal shelf you can return to later.
          </p>
          <Link
            href="/discover"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-[#F0EDE6] dark:text-[#0D1117]"
          >
            <Compass className="h-4 w-4" />
            Browse topics
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200/80 pb-4 dark:border-[#1E2A3A]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-[#6B7585]">
            Saved reading
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 dark:text-[#F0EDE6]">
            Library overview
          </h2>
        </div>
        <div className="flex flex-wrap gap-5">
          <div>
            <div className="text-lg font-semibold text-stone-900 dark:text-[#F0EDE6]">{articles.length}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">Saved</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-stone-900 dark:text-[#F0EDE6]">{readCount}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">Read</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-stone-900 dark:text-[#F0EDE6]">{unreadMins}m</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-[#6B7585]">Unread time</div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveTopicId(null)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${!activeTopicId ? "border-stone-300 bg-stone-900 text-white dark:border-[#E8A838] dark:bg-[#F0EDE6] dark:text-[#0D1117]" : "border-stone-200/80 bg-white/80 text-stone-500 hover:border-stone-300 hover:text-stone-800 dark:border-[#1E2A3A] dark:bg-[#121925] dark:text-[#8A95A7] dark:hover:border-[#2A3547] dark:hover:text-[#F0EDE6]"}`}
          >
            All
          </button>
          {allTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActiveTopicId(topic.id === activeTopicId ? null : topic.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${activeTopicId === topic.id ? "border-stone-300 bg-stone-900 text-white dark:border-[#E8A838] dark:bg-[#F0EDE6] dark:text-[#0D1117]" : "border-stone-200/80 bg-white/80 text-stone-500 hover:border-stone-300 hover:text-stone-800 dark:border-[#1E2A3A] dark:bg-[#121925] dark:text-[#8A95A7] dark:hover:border-[#2A3547] dark:hover:text-[#F0EDE6]"}`}
            >
              <span className="flex items-center gap-1.5"><TopicIcon slug={topic.slug} size={12} className="shrink-0 opacity-70" />{topic.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grouped")}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${viewMode === "grouped" ? "border-stone-300 bg-stone-900 text-white dark:border-[#E8A838] dark:bg-[#F0EDE6] dark:text-[#0D1117]" : "border-stone-200/80 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-800 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#8A95A7] dark:hover:border-[#2D3B4F] dark:hover:text-[#F0EDE6]"}`}
          >
            Grouped
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${viewMode === "list" ? "border-stone-300 bg-stone-900 text-white dark:border-[#E8A838] dark:bg-[#F0EDE6] dark:text-[#0D1117]" : "border-stone-200/80 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-800 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#8A95A7] dark:hover:border-[#2D3B4F] dark:hover:text-[#F0EDE6]"}`}
          >
            List
          </button>
          <button
            onClick={() => setSort((current) => (current === "newest" ? "oldest" : "newest"))}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white px-3 py-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-800 dark:border-[#1E2A3A] dark:bg-[#161C26] dark:text-[#8A95A7] dark:hover:border-[#2D3B4F] dark:hover:text-[#F0EDE6]"
          >
            <Filter className="h-3.5 w-3.5" />
            {sort === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <AnimatePresence mode="popLayout">
          {!grouped ? (
            <motion.div key="flat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
              {filtered.map((article, index) => (
                <LibraryRow
                  key={article.id}
                  article={article}
                  index={index}
                  onReadChange={handleReadChange}
                  onBookmarkRemove={handleBookmarkRemove}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div key="grouped" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {grouped.map((group, groupIndex) => {
                const baseIndex = grouped.slice(0, groupIndex).reduce((sum, current) => sum + current.articles.length, 0)
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
