import type { Metadata } from "next"
import { Mail, Rss, Zap, BookOpen } from "lucide-react"
import { SeoLanding } from "@/components/seo-landing"

export const metadata: Metadata = {
  title: "Simple Inoreader Alternative — Curio",
  description:
    "Tired of managing RSS feeds in Inoreader? Curio curates 200+ sources by topic and delivers quality-ranked articles to your inbox — zero setup.",
  alternates: { canonical: "/inoreader-alternative" },
  openGraph: {
    title: "Simple Inoreader Alternative — Curio",
    description: "Curated sources, quality ranking, email digests. No RSS management needed.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a good simple Inoreader alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Curio is a simpler Inoreader alternative — no RSS feed management, just pick topics and get quality articles in your feed and inbox.",
      },
    },
    {
      "@type": "Question",
      name: "Does Curio require managing RSS feeds like Inoreader?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Curio maintains 200+ curated RSS sources for you. You pick topics, not individual feeds.",
      },
    },
  ],
}

export default function InoreaderAlternativePage() {
  return (
    <SeoLanding
      h1="A Simpler Inoreader Alternative — No RSS Management"
      subheadline="Inoreader requires you to manage hundreds of RSS feeds. Curio curates them for you — pick topics, get quality articles in your feed and inbox."
      ctaText="Switch to Curio — free"
      jsonLd={jsonLd}
      features={[
        {
          icon: <Rss className="w-5 h-5 text-amber-500" />,
          title: "Zero RSS management",
          description: "We maintain 200+ curated sources. No feed URLs, no subscriptions to manage.",
        },
        {
          icon: <Mail className="w-5 h-5 text-amber-500" />,
          title: "Email digests on all plans",
          description: "Unlike Inoreader, email delivery is included free — daily or weekly.",
        },
        {
          icon: <Zap className="w-5 h-5 text-amber-500" />,
          title: "Quality ranking",
          description: "Sources are scored by reader engagement. Best articles float to the top.",
        },
        {
          icon: <BookOpen className="w-5 h-5 text-amber-500" />,
          title: "Clean, focused interface",
          description: "No clutter, no settings overload. Just your topics and your articles.",
        },
      ]}
      comparisons={[
        { label: "No RSS setup needed", them: false, us: true },
        { label: "Email digest free", them: false, us: true },
        { label: "Quality-ranked feed", them: false, us: true },
        { label: "Curated source library", them: false, us: true },
        { label: "Clean minimal UI", them: false, us: true },
        { label: "Free tier available", them: true, us: true },
      ]}
      competitorName="Inoreader"
      faqs={[
        {
          q: "Can I add my own RSS feeds?",
          a: "Custom OPML import is on the roadmap. Currently, you can suggest new sources or topics and the team adds them to the curated library.",
        },
        {
          q: "Is the free plan worth it?",
          a: "Yes. The free plan includes 5 topics, full feed access, bookmarking, and email digests — no restrictions on core features.",
        },
        {
          q: "What makes Curio's quality ranking different?",
          a: "Each source gets a score based on bookmark and read rates over 90 days. Articles from higher-quality sources rank higher, regardless of publish time.",
        },
        {
          q: "How many topics can I follow?",
          a: "Up to 5 topics on the free plan. The Pro plan removes this limit.",
        },
      ]}
    />
  )
}
