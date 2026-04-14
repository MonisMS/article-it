"use client"

import { useState } from "react"
import { ReadingInsights } from "@/components/reading-insights"
import { SettingsAccount } from "@/components/settings-account"
import { SettingsTopics } from "@/components/settings-topics"
import { SettingsSchedules } from "@/components/settings-schedules"
import { SettingsOpmlImport } from "@/components/settings-opml-import"
import { SettingsShareProfile } from "@/components/settings-share-profile"
import type { ReadingInsightsData } from "@/lib/db/queries/insights"

type Topic = { id: string; name: string; slug: string; icon: string | null }
type ScheduleRow = {
  topicId: string
  frequency: string
  dayOfWeek: number | null
  hour: number
  timezone: string
  isActive: boolean
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "topics",   label: "Topics"   },
  { id: "digests",  label: "Digests"  },
  { id: "account",  label: "Account"  },
] as const

type TabId = typeof TABS[number]["id"]

function isValidTab(t: string | undefined): t is TabId {
  return TABS.some((tab) => tab.id === t)
}

export function ProfileTabs({
  initialTab,
  insights,
  bookmarkCount,
  name,
  email,
  plan,
  username,
  publicProfile,
  allTopics,
  followedIds,
  schedules,
}: {
  initialTab: string
  insights: ReadingInsightsData
  bookmarkCount: number
  name: string
  email: string
  plan: string
  username: string | null
  publicProfile: boolean
  allTopics: Topic[]
  followedIds: string[]
  schedules: ScheduleRow[]
}) {
  const [activeTab, setActiveTab] = useState<TabId>(
    isValidTab(initialTab) ? initialTab : "overview"
  )

  function navigate(tab: TabId) {
    setActiveTab(tab)
    window.history.replaceState({}, "", `/profile?tab=${tab}`)
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-stone-200 dark:border-[#1E2A3A] px-4 sm:px-6">
        <div className="flex">
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={`relative px-4 py-3.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-stone-900 dark:text-[#F0EDE6]"
                    : "text-stone-400 dark:text-[#6B7585] hover:text-stone-600 dark:hover:text-[#B8C0CC]"
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-stone-900 dark:bg-amber-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 sm:px-6 py-7">
        {activeTab === "overview" && (
          <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] overflow-hidden">
            <ReadingInsights insights={insights} bookmarkCount={bookmarkCount} />
          </div>
        )}

        {activeTab === "topics" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-6">
              <SettingsTopics allTopics={allTopics} followedIds={followedIds} />
            </div>
            <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-6">
              <SettingsOpmlImport />
            </div>
          </div>
        )}

        {activeTab === "digests" && (
          <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-6">
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              You can set a digest for any active topic, even if you do not follow it yet. A warning will appear before saving.
            </p>
            <SettingsSchedules topics={allTopics} followedIds={followedIds} schedules={schedules} />
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-6">
              <SettingsShareProfile initialUsername={username} initialPublic={publicProfile} />
            </div>
            <div className="rounded-2xl border border-stone-200 dark:border-[#1E2A3A] bg-white dark:bg-[#161C26] p-6">
              <SettingsAccount name={name} email={email} plan={plan} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
