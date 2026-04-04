import type { Metadata } from "next"
import { Mail, Rss, Zap, BookOpen } from "lucide-react"
import { SeoLanding } from "@/components/seo-landing"

export const metadata: Metadata = {
  title: "RSS Reader That Sends Email — ArticleIt",
  description:
    "An RSS reader that sends you email digests. ArticleIt aggregates 200+ RSS feeds by topic and delivers quality-ranked articles to your inbox daily or weekly.",
  alternates: { canonical: "/rss-reader-email" },
  openGraph: {
    title: "RSS Reader That Sends Email — ArticleIt",
    description: "200+ RSS feeds → quality-ranked digest → your inbox. Free to start.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is there an RSS reader that sends emails?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ArticleIt aggregates 200+ RSS feeds by topic and delivers a quality-ranked digest to your email on your schedule.",
      },
    },
    {
      "@type": "Question",
      name: "Can I get RSS feeds delivered by email for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ArticleIt's free tier includes email digest delivery for up to 5 topics. No credit card required.",
      },
    },
  ],
}

export default function RssReaderEmailPage() {
  return (
    <SeoLanding
      h1="An RSS Reader That Sends Articles to Your Email"
      subheadline="Stop checking RSS readers. ArticleIt aggregates 200+ curated feeds by topic, ranks by quality, and delivers the best articles to your inbox on your schedule."
      ctaText="Get RSS to email — free"
      jsonLd={jsonLd}
      features={[
        {
          icon: <Rss className="w-5 h-5 text-amber-500" />,
          title: "200+ RSS feeds covered",
          description: "We aggregate the web's best RSS sources across 12+ topic areas. No feed hunting required.",
        },
        {
          icon: <Mail className="w-5 h-5 text-amber-500" />,
          title: "Email delivery on your schedule",
          description: "Daily or weekly digest to your inbox. Set the time that works for you.",
        },
        {
          icon: <Zap className="w-5 h-5 text-amber-500" />,
          title: "Quality score ranking",
          description: "Not just the newest articles — the best ones. Each source is scored weekly.",
        },
        {
          icon: <BookOpen className="w-5 h-5 text-amber-500" />,
          title: "Web reader included",
          description: "Browse your full feed on the web, bookmark articles, and track reading progress.",
        },
      ]}
      faqs={[
        {
          q: "Do I need to set up RSS feeds?",
          a: "No. ArticleIt maintains 200+ curated feeds. Just pick your topics and we handle the rest.",
        },
        {
          q: "What format are the digest emails?",
          a: "Clean HTML emails with article title, source, reading time estimate, and description. Mobile-friendly.",
        },
        {
          q: "Can I add my own RSS feed?",
          a: "Custom RSS import (OPML) is on the roadmap. You can currently suggest new sources for the curated library.",
        },
        {
          q: "How is this different from services like Kill the Newsletter?",
          a: "ArticleIt focuses on web articles and RSS aggregation, not newsletter delivery. It also adds quality ranking and topic filtering.",
        },
      ]}
    />
  )
}
