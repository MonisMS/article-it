import type { Metadata } from "next"
import { Bookmark, Mail, Rss, Zap } from "lucide-react"
import { SeoLanding } from "@/components/seo-landing"

export const metadata: Metadata = {
  title: "Best Pocket Alternative in 2025 — Curio",
  description:
    "Pocket shut down in July 2025. Curio is the best Pocket alternative — save articles, get a personalized email digest, and discover great content from 200+ curated sources.",
  alternates: { canonical: "/pocket-alternative" },
  openGraph: {
    title: "Best Pocket Alternative in 2025 — Curio",
    description: "Pocket shut down in July 2025. Curio is the best free replacement.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What happened to Pocket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mozilla shut down Pocket in July 2025, leaving millions of users without a read-later and article discovery service.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best Pocket alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Curio is one of the best Pocket alternatives. It offers a personalized article feed, bookmarking, and email digests from 200+ curated sources — all free to start.",
      },
    },
    {
      "@type": "Question",
      name: "Is Curio free like Pocket was?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Curio's free tier lets you follow up to 5 topics, bookmark articles, and receive email digests. No credit card required.",
      },
    },
  ],
}

export default function PocketAlternativePage() {
  return (
    <SeoLanding
      h1="The Best Pocket Alternative That Actually Delivers"
      subheadline="Pocket shut down in July 2025. Curio replaces it with a curated article feed, bookmarking, and scheduled email digests — free to start."
      ctaText="Switch from Pocket — free"
      jsonLd={jsonLd}
      features={[
        {
          icon: <Bookmark className="w-5 h-5 text-amber-500" />,
          title: "Bookmark anything",
          description: "Save articles to read later. Organized by topic, searchable, and always accessible.",
        },
        {
          icon: <Rss className="w-5 h-5 text-amber-500" />,
          title: "200+ curated sources",
          description: "We pull from the web's best RSS sources — no low-quality content, no algorithmic noise.",
        },
        {
          icon: <Mail className="w-5 h-5 text-amber-500" />,
          title: "Email digest on your schedule",
          description: "Get a daily or weekly digest of the best articles delivered straight to your inbox.",
        },
        {
          icon: <Zap className="w-5 h-5 text-amber-500" />,
          title: "Quality-ranked feed",
          description: "Articles are ranked by source engagement quality — not recency alone. Best stuff first.",
        },
      ]}
      comparisons={[
        { label: "Free tier", them: true, us: true },
        { label: "Email digest", them: false, us: true },
        { label: "Bookmarking", them: true, us: true },
        { label: "Curated sources", them: false, us: true },
        { label: "Quality ranking", them: false, us: true },
        { label: "Still active", them: false, us: true },
      ]}
      competitorName="Pocket"
      faqs={[
        {
          q: "Why did Pocket shut down?",
          a: "Mozilla shut down Pocket in July 2025 as part of a strategic restructuring. They gave users 30 days to export their data.",
        },
        {
          q: "Can I import my Pocket bookmarks?",
          a: "Curio is working on OPML and bookmark import. For now, you can re-discover great content through the curated topic feeds.",
        },
        {
          q: "Is Curio better than Pocket?",
          a: "Curio adds what Pocket was missing: curated source quality ranking and email digests. Your feed isn't just recency — it's the best content first.",
        },
        {
          q: "How is Curio different from Instapaper?",
          a: "Instapaper is a read-later tool. Curio is a content discovery + delivery service — it finds the articles for you and sends them to your inbox.",
        },
      ]}
    />
  )
}
