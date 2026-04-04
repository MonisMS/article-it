import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function timeAgo(date: Date | null): string {
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

export function readingTime(text: string | null): string {
  if (!text) return ""
  const words = text.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function formatDate(date: Date | null): string {
  if (!date) return "Never"
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function monthLabel(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}
