import type { Metadata } from "next"
import { Mail, Rss, Zap, BookOpen } from "lucide-react"
import { SeoLanding } from "@/components/seo-landing"

export const metadata: Metadata = {
  title: "Best Feedly Alternative — ArticleIt",
  description:
    "Looking for a simpler Feedly alternative? ArticleIt delivers quality-ranked articles from your favourite topics to your feed and inbox — no RSS management needed.",
  alternates: { canonical: "/feedly-alternative" },
  openGraph: {
    title: "Best Feedly Alternative — ArticleIt",
    description: "Simpler than Feedly. Quality-ranked articles from curated sources, delivered to your inbox.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a good Feedly alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ArticleIt is a great Feedly alternative for people who want a curated, email-first reading experience without managing individual RSS feeds.",
      },
    },
    {
      "@type": "Question",
      name: "Is ArticleIt free like Feedly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ArticleIt has a generous free tier. Unlike Feedly's free plan, ArticleIt's free tier includes email digests.",
      },
    },
  ],
}

export default function FeedlyAlternativePage() {
  return (
    <SeoLanding
      h1="A Feedly Alternative That Emails You the Best Articles"
      subheadline="Feedly makes you manage RSS feeds. ArticleIt curates them for you — pick topics, get quality-ranked articles in your feed and inbox."
      ctaText="Try free — no RSS setup needed"
      jsonLd={jsonLd}
      features={[
        {
          icon: <Rss className="w-5 h-5 text-amber-500" />,
          title: "No RSS management",
          description: "We maintain 200+ curated sources so you don't have to hunt for good feeds yourself.",
        },
        {
          icon: <Mail className="w-5 h-5 text-amber-500" />,
          title: "Inbox delivery included free",
          description: "Unlike Feedly, ArticleIt sends email digests on all plans — daily or weekly, your choice.",
        },
        {
          icon: <Zap className="w-5 h-5 text-amber-500" />,
          title: "Quality ranking, not just recency",
          description: "Articles are surfaced by source quality score. The best content wins, not the newest.",
        },
        {
          icon: <BookOpen className="w-5 h-5 text-amber-500" />,
          title: "12 curated topic areas",
          description: "AI, Startups, Design, React, Productivity and more — no feed URL hunting required.",
        },
      ]}
      comparisons={[
        { label: "Free email digest", them: false, us: true },
        { label: "No RSS setup needed", them: false, us: true },
        { label: "Quality-ranked feed", them: false, us: true },
        { label: "Curated sources", them: false, us: true },
        { label: "Topic-based discovery", them: true, us: true },
        { label: "Bookmarking", them: true, us: true },
      ]}
      competitorName="Feedly"
      faqs={[
        {
          q: "Do I need to add RSS feeds manually?",
          a: "No. ArticleIt maintains over 200 curated RSS sources across 12+ topics. You just pick the topics you care about.",
        },
        {
          q: "Does ArticleIt have a mobile app?",
          a: "ArticleIt is a web app that works great on mobile. A native app is on the roadmap.",
        },
        {
          q: "Can I still add my own RSS sources?",
          a: "Custom source import (OPML) is planned for a future update. For now, you can suggest new sources or topics.",
        },
        {
          q: "How is the quality score calculated?",
          a: "Each source gets a quality score based on reader engagement: bookmarks and reads over a 90-day rolling window. Updated weekly.",
        },
      ]}
    />
  )
}
