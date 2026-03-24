import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { user } from "./auth"

// ---------------------------------------------------------------------------
// TOPICS
// A topic is a curated subject area (e.g. "React", "AI", "Startups").
// Admin-managed. Pro users can suggest new ones via topic_suggestions.
// ---------------------------------------------------------------------------

export const topics = pgTable("topics", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // used in URLs, e.g. "react"
  description: text("description"),
  icon: text("icon"), // emoji or icon identifier, e.g. "⚛️"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// TOPIC SUGGESTIONS
// Pro users can suggest new topics. Admin reviews and approves/rejects.
// ---------------------------------------------------------------------------

export const topicSuggestions = pgTable("topic_suggestions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // "pending" | "approved" | "rejected"
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// RSS SOURCES
// Each RSS source is a feed URL (e.g. css-tricks.com/feed).
// One source can feed into multiple topics via rss_source_topics.
// ---------------------------------------------------------------------------

export const rssSources = pgTable("rss_sources", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(), // e.g. "CSS Tricks"
  url: text("url").notNull().unique(), // the RSS feed URL
  isActive: boolean("is_active").notNull().default(true),
  lastFetchedAt: timestamp("last_fetched_at"), // null = never fetched
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// RSS SOURCE ↔ TOPICS  (many-to-many)
// dev.to feed → [JavaScript, React, DevOps]
// ---------------------------------------------------------------------------

export const rssSourceTopics = pgTable(
  "rss_source_topics",
  {
    sourceId: text("source_id")
      .notNull()
      .references(() => rssSources.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.sourceId, t.topicId] })]
)

// ---------------------------------------------------------------------------
// ARTICLES
// One article can belong to multiple topics via article_topics.
// url is the deduplication key — we never store the same article twice.
// ---------------------------------------------------------------------------

export const articles = pgTable(
  "articles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text("title").notNull(),
    url: text("url").notNull().unique(), // dedup key
    description: text("description"),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at"),
    sourceId: text("source_id")
      .notNull()
      .references(() => rssSources.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("articles_published_at_idx").on(t.publishedAt),
    index("articles_source_id_idx").on(t.sourceId),
  ]
)

// ---------------------------------------------------------------------------
// ARTICLE ↔ TOPICS  (many-to-many)
// One article can appear under React AND JavaScript
// ---------------------------------------------------------------------------

export const articleTopics = pgTable(
  "article_topics",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.topicId] }),
    index("article_topics_topic_id_idx").on(t.topicId),
  ]
)

// ---------------------------------------------------------------------------
// USER ↔ TOPICS  (many-to-many)
// The topics a user follows / wants in their feed
// ---------------------------------------------------------------------------

export const userTopics = pgTable(
  "user_topics",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.topicId] })]
)

// ---------------------------------------------------------------------------
// BOOKMARKS
// User saves an article to read later.
// A user can only bookmark the same article once.
// ---------------------------------------------------------------------------

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("bookmarks_user_article_unique").on(t.userId, t.articleId),
    index("bookmarks_user_id_idx").on(t.userId),
  ]
)

// ---------------------------------------------------------------------------
// READ ARTICLES
// Tracks which articles a user has marked as read.
// ---------------------------------------------------------------------------

export const readArticles = pgTable(
  "read_articles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.articleId] }),
    index("read_articles_user_id_idx").on(t.userId),
  ]
)

// ---------------------------------------------------------------------------
// DIGEST SCHEDULES
// One schedule per user per topic.
// e.g. User wants JavaScript digest every Sunday at 9am UTC.
// ---------------------------------------------------------------------------

export const digestSchedules = pgTable(
  "digest_schedules",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    frequency: text("frequency").notNull(), // "daily" | "weekly"
    dayOfWeek: integer("day_of_week"), // 0=Sun … 6=Sat, null when frequency=daily
    hour: integer("hour").notNull().default(9), // 0–23, UTC
    timezone: text("timezone").notNull().default("UTC"),
    isActive: boolean("is_active").notNull().default(true),
    lastSentAt: timestamp("last_sent_at"), // null = never sent
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    // One schedule per user per topic
    unique("digest_schedules_user_topic_unique").on(t.userId, t.topicId),
    index("digest_schedules_active_idx").on(t.isActive),
  ]
)

// ---------------------------------------------------------------------------
// DIGEST LOGS
// A record of every digest email that was sent (or failed).
// Links back to the schedule that triggered it.
// ---------------------------------------------------------------------------

export const digestLogs = pgTable(
  "digest_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    scheduleId: text("schedule_id")
      .notNull()
      .references(() => digestSchedules.id, { onDelete: "cascade" }),
    userId: text("user_id") // denormalised for fast user history queries
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topicId: text("topic_id") // denormalised for display
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    sentAt: timestamp("sent_at").notNull().defaultNow(),
    articleCount: integer("article_count").notNull().default(0),
    status: text("status").notNull().default("sent"), // "sent" | "failed"
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("digest_logs_user_id_idx").on(t.userId)]
)

// ---------------------------------------------------------------------------
// DIGEST LOG ↔ ARTICLES  (many-to-many)
// Stores exactly which articles were in each digest — powers the history page.
// ---------------------------------------------------------------------------

export const digestLogArticles = pgTable(
  "digest_log_articles",
  {
    digestLogId: text("digest_log_id")
      .notNull()
      .references(() => digestLogs.id, { onDelete: "cascade" }),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.digestLogId, t.articleId] })]
)

// ---------------------------------------------------------------------------
// RELATIONS
// ---------------------------------------------------------------------------

export const topicsRelations = relations(topics, ({ many }) => ({
  rssSourceTopics: many(rssSourceTopics),
  articleTopics: many(articleTopics),
  userTopics: many(userTopics),
  digestSchedules: many(digestSchedules),
  digestLogs: many(digestLogs),
}))

export const topicSuggestionsRelations = relations(topicSuggestions, ({ one }) => ({
  user: one(user, { fields: [topicSuggestions.userId], references: [user.id] }),
}))

export const rssSourcesRelations = relations(rssSources, ({ many }) => ({
  rssSourceTopics: many(rssSourceTopics),
  articles: many(articles),
}))

export const rssSourceTopicsRelations = relations(rssSourceTopics, ({ one }) => ({
  source: one(rssSources, { fields: [rssSourceTopics.sourceId], references: [rssSources.id] }),
  topic: one(topics, { fields: [rssSourceTopics.topicId], references: [topics.id] }),
}))

export const articlesRelations = relations(articles, ({ one, many }) => ({
  source: one(rssSources, { fields: [articles.sourceId], references: [rssSources.id] }),
  articleTopics: many(articleTopics),
  bookmarks: many(bookmarks),
  readArticles: many(readArticles),
  digestLogArticles: many(digestLogArticles),
}))

export const readArticlesRelations = relations(readArticles, ({ one }) => ({
  user: one(user, { fields: [readArticles.userId], references: [user.id] }),
  article: one(articles, { fields: [readArticles.articleId], references: [articles.id] }),
}))

export const articleTopicsRelations = relations(articleTopics, ({ one }) => ({
  article: one(articles, { fields: [articleTopics.articleId], references: [articles.id] }),
  topic: one(topics, { fields: [articleTopics.topicId], references: [topics.id] }),
}))

export const userTopicsRelations = relations(userTopics, ({ one }) => ({
  user: one(user, { fields: [userTopics.userId], references: [user.id] }),
  topic: one(topics, { fields: [userTopics.topicId], references: [topics.id] }),
}))

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(user, { fields: [bookmarks.userId], references: [user.id] }),
  article: one(articles, { fields: [bookmarks.articleId], references: [articles.id] }),
}))

export const digestSchedulesRelations = relations(digestSchedules, ({ one, many }) => ({
  user: one(user, { fields: [digestSchedules.userId], references: [user.id] }),
  topic: one(topics, { fields: [digestSchedules.topicId], references: [topics.id] }),
  digestLogs: many(digestLogs),
}))

export const digestLogsRelations = relations(digestLogs, ({ one, many }) => ({
  schedule: one(digestSchedules, { fields: [digestLogs.scheduleId], references: [digestSchedules.id] }),
  user: one(user, { fields: [digestLogs.userId], references: [user.id] }),
  topic: one(topics, { fields: [digestLogs.topicId], references: [topics.id] }),
  digestLogArticles: many(digestLogArticles),
}))

export const digestLogArticlesRelations = relations(digestLogArticles, ({ one }) => ({
  digestLog: one(digestLogs, { fields: [digestLogArticles.digestLogId], references: [digestLogs.id] }),
  article: one(articles, { fields: [digestLogArticles.articleId], references: [articles.id] }),
}))
