import type { Metadata } from "next"
import { Mail, Rss, Zap, BookOpen } from "lucide-react"
import { SeoLanding } from "@/components/seo-landing"

export const metadata: Metadata = {
  title: "Readwise Alternative for Article Discovery — ArticleIt",
  description:
    "Looking for a Readwise alternative focused on article discovery? ArticleIt curates articles from 200+ sources by topic and delivers quality-ranked digests to your inbox.",
  alternates: { canonical: "/readwise-alternative" },
  openGraph: {
    title: "Readwise Alternative for Article Discovery — ArticleIt",
    description: "Article discovery and email digests from 200+ curated sources. Free to start.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a good Readwise alternative for article discovery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ArticleIt is a great alternative for the article discovery and digest side of Readwise Reader — it curates 200+ sources by topic and delivers quality articles to your inbox.",
      },
    },
    {
      "@type": "Question",
      name: "How does ArticleIt compare to Readwise Reader?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Readwise Reader is a read-later + highlighting tool. ArticleIt focuses on article discovery and email delivery — finding the best articles for you from curated sources.",
      },
    },
  ],
}

export default function ReadwiseAlternativePage() {
  return (
    <SeoLanding
      h1="A Readwise Alternative That Finds Articles for You"
      subheadline="Readwise is great for highlights. ArticleIt handles the harder part — finding quality articles from 200+ curated sources and delivering them to your inbox."
      ctaText="Discover articles — free"
      jsonLd={jsonLd}
      features={[
        {
          icon: <Rss className="w-5 h-5 text-amber-500" />,
          title: "Discovery built in",
          description: "200+ curated sources across 12 topic areas. New articles ingested daily.",
        },
        {
          icon: <Zap className="w-5 h-5 text-amber-500" />,
          title: "Quality-ranked feed",
          description: "Sources are scored weekly by reader engagement. Best content rises to the top.",
        },
        {
          icon: <Mail className="w-5 h-5 text-amber-500" />,
          title: "Email delivery",
          description: "Get a daily or weekly digest without opening an app. Reading comes to you.",
        },
        {
          icon: <BookOpen className="w-5 h-5 text-amber-500" />,
          title: "Reading streak + history",
          description: "Track your reading habit with streaks, reading stats, and full history.",
        },
      ]}
      comparisons={[
        { label: "Email digest delivery", them: false, us: true },
        { label: "Article discovery", them: true, us: true },
        { label: "Quality-ranked sources", them: false, us: true },
        { label: "Bookmarking", them: true, us: true },
        { label: "Reading history", them: true, us: true },
        { label: "Free tier with email", them: false, us: true },
      ]}
      competitorName="Readwise"
      faqs={[
        {
          q: "Does ArticleIt do highlights like Readwise?",
          a: "Not yet. ArticleIt focuses on article discovery and digest delivery. Highlights are on the long-term roadmap.",
        },
        {
          q: "Can I use both Readwise and ArticleIt?",
          a: "Yes. Many users use ArticleIt for discovery (finding articles) and Readwise for retention (highlighting and reviewing).",
        },
        {
          q: "What topics does ArticleIt cover?",
          a: "AI, Startups, React, Design, Productivity, Crypto, Science, and more — 12+ topics with new ones added regularly.",
        },
        {
          q: "Is there a free plan?",
          a: "Yes. Follow up to 5 topics and receive email digests — completely free, no credit card required.",
        },
      ]}
    />
  )
}
