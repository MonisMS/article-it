import { db } from "@/lib/db"
import { readArticles } from "@/lib/db/schema"
import { eq, gte, sql } from "drizzle-orm"

export type StreakData = {
  currentStreak: number
  weeklyCount: number
  weekDays: boolean[] // [mon, tue, wed, thu, fri, sat, sun] — true = read that day
}

export async function getReadingStreak(userId: string): Promise<StreakData> {
  const since = new Date()
  since.setDate(since.getDate() - 60)

  // Distinct UTC dates where user read at least one article
  const rows = await db
    .select({ day: sql<string>`DATE(${readArticles.readAt})` })
    .from(readArticles)
    .where(eq(readArticles.userId, userId))
    .groupBy(sql`DATE(${readArticles.readAt})`)
    .orderBy(sql`DATE(${readArticles.readAt}) DESC`)

  const readDays = new Set(rows.map((r) => r.day)) // "YYYY-MM-DD" strings

  function toDateStr(d: Date): string {
    return d.toISOString().slice(0, 10)
  }

  // ── Current streak ────────────────────────────────────────────────────────
  // Walk backwards from today; if today has no read yet, yesterday can still
  // hold the streak (streak breaks when two consecutive days both have no read)
  const today = toDateStr(new Date())
  let streak = 0
  const cursor = new Date()

  // If today has a read, start counting from today; otherwise start from yesterday
  if (!readDays.has(today)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (true) {
    const dateStr = toDateStr(cursor)
    if (!readDays.has(dateStr)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // ── Last 7 days (Mon–Sun aligned to today's week) ─────────────────────────
  // We show the last 7 calendar days ending today (rolling window)
  const weekDays: boolean[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    weekDays.push(readDays.has(toDateStr(d)))
  }

  const weeklyCount = weekDays.filter(Boolean).length

  return { currentStreak: streak, weeklyCount, weekDays }
}
