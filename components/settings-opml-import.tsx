"use client"

import { useRef, useState } from "react"
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

type ImportResult = {
  total: number
  imported: number
  matched: number
  unmatched: number
  fallbackTopic: string
}

export function SettingsOpmlImport() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/user/sources/import", {
        method: "POST",
        body: formData,
      })

      const { data, error: err } = await res.json()
      if (err || !data) {
        setError(err ?? "Import failed")
      } else {
        setResult(data)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
      // Reset input so the same file can be re-uploaded if needed
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-[#F0EDE6]">Import feeds (OPML)</h3>
        <p className="text-xs text-stone-500 dark:text-[#6B7585] mt-0.5">
          Import your RSS subscriptions from Feedly, Inoreader, or any RSS reader. Feeds are matched to your followed topics automatically.
        </p>
      </div>

      <label
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors
          ${loading
            ? "border-stone-200 dark:border-[#1E2A3A] opacity-50 cursor-not-allowed"
            : "border-stone-200 dark:border-[#1E2A3A] hover:border-amber-400 dark:hover:border-[#E8A838] hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".opml,.xml"
          className="sr-only"
          disabled={loading}
          onChange={handleImport}
        />
        {loading ? (
          <Loader2 className="w-4 h-4 text-stone-400 animate-spin flex-shrink-0" />
        ) : (
          <Upload className="w-4 h-4 text-stone-400 dark:text-[#6B7585] flex-shrink-0" />
        )}
        <span className="text-sm text-stone-500 dark:text-[#6B7585]">
          {loading ? "Importing feeds…" : "Choose .opml or .xml file"}
        </span>
      </label>

      {result && (
        <div className="flex items-start gap-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 px-4 py-3">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800 dark:text-green-300 space-y-0.5">
            <p className="font-medium">
              {result.total} feed{result.total !== 1 ? "s" : ""} processed
            </p>
            <p className="text-xs text-green-700 dark:text-green-400">
              {result.imported} new source{result.imported !== 1 ? "s" : ""} added
              {result.matched > 0 && ` · ${result.matched} matched to your topics`}
              {result.unmatched > 0 && ` · ${result.unmatched} added to "${result.fallbackTopic}"`}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              New feeds will appear in your digest after the next daily refresh.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
