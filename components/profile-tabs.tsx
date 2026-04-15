"use client"

import { useState } from "react"
import { ReadingInsights } from "@/components/reading-insights"
import { SettingsAccount } from "@/components/settings-account"
import { SettingsOpmlImport } from "@/components/settings-opml-import"
import { SettingsSchedules } from "@/components/settings-schedules"
import { SettingsShareProfile } from "@/components/settings-share-profile"
import { SettingsTopics } from "@/components/settings-topics"
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
  { id: "topics", label: "Topics" },
  { id: "digests", label: "Digests" },
  { id: "account", label: "Account" },
] as const

type TabId = typeof TABS[number]["id"]

function isValidTab(t: string | undefined): t is TabId {
  return TABS.some((tab) => tab.id === t)
}

export function ProfileTabs({
  initialTab,
  insights,
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

  const digestTotal = schedules.length
  const digestActive = schedules.filter((schedule) => schedule.isActive).length

  function navigate(tab: TabId) {
    setActiveTab(tab)
    window.history.replaceState({}, "", `/profile?tab=${tab}`)
  }

  return (
    <div>
      <div className="px-4 pt-5 sm:px-6">
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex min-w-full gap-2 border-b border-stone-200/80 pb-3 dark:border-lp-border">
            {TABS.map((tab) => {
              const active = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active
                    ? "border-stone-300 bg-stone-900 text-white dark:border-amber-500/30 dark:bg-amber-500 dark:text-lp-bg"
                    : "border-transparent bg-transparent text-stone-500 hover:border-stone-200 hover:bg-stone-50 hover:text-stone-900 dark:text-lp-text-subtle dark:hover:border-lp-border dark:hover:bg-lp-surface dark:hover:text-lp-text"}`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {activeTab === "overview" && (
          <ReadingInsights
            insights={insights}
            digestTotal={digestTotal}
            digestActive={digestActive}
          />
        )}

        {activeTab === "topics" && (
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-stone-200/80 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
              <SettingsTopics allTopics={allTopics} followedIds={followedIds} />
            </div>
            <div className="rounded-[1.75rem] border border-stone-200/80 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
              <SettingsOpmlImport />
            </div>
          </div>
        )}

        {activeTab === "digests" && (
          <div className="rounded-[1.75rem] border border-stone-200/80 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              Digests are only available for topics you currently follow.
            </p>
            <SettingsSchedules topics={allTopics} followedIds={followedIds} schedules={schedules} />
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-stone-200/80 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
              <SettingsShareProfile initialUsername={username} initialPublic={publicProfile} />
            </div>
            <div className="rounded-[1.75rem] border border-stone-200/80 bg-white p-5 dark:border-lp-border dark:bg-lp-surface">
              <SettingsAccount name={name} email={email} plan={plan} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
