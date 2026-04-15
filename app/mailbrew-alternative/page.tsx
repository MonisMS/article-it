import type { Metadata } from "next"
import { Mail, Rss, Zap, BookOpen } from "lucide-react"
import { SeoLanding } from "@/components/seo-landing"

export const metadata: Metadata = {
  title: "Best Mailbrew Alternative — Curio",
  description:
    "Mailbrew shut down. Curio is the best Mailbrew alternative — personalized article digests from curated sources, delivered to your inbox on your schedule.",
  alternates: { canonical: "/mailbrew-alternative" },
  openGraph: {
    title: "Best Mailbrew Alternative — Curio",
    description: "Mailbrew shut down. Curioivers personalized article digests to your inbox.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What happened to Mailbrew?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mailbrew shut down its service. Users looking for a Mailbrew alternative need a new tool that curates content and delivers it by email.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best Mailbrew alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Curioone of the best Mailbrew alternatives. It curates articles from 200+ sources by topic and delivers them on your chosen schedule.",
      },
    },
  ],
}

export default function MailbrewAlternativePage() {
  return (
    <SeoLanding
      h1="The Mailbrew Alternative You've Been Looking For"
      subheadline="Mailbrew is gone. Curioivers curated article digests from 200+ sources to your inbox — daily, weekly, or on your own schedule."
      ctaText="Replace Mailbrew — free"
      jsonLd={jsonLd}
      features={[
        {
          icon: <Mail className="w-5 h-5 text-amber-500" />,
          title: "Scheduled email digests",
          description: "Choose your time and frequency. Your digest arrives in your inbox exactly when you want it.",
        },
        {
          icon: <Rss className="w-5 h-5 text-amber-500" />,
          title: "200+ curated RSS sources",
          description: "No need to find and add sources. We maintain quality feeds across 12+ topic areas.",
        },
        {
          icon: <Zap className="w-5 h-5 text-amber-500" />,
          title: "Quality-first ranking",
          description: "Your digest contains the highest-quality articles, ranked by source engagement score.",
        },
        {
          icon: <BookOpen className="w-5 h-5 text-amber-500" />,
          title: "Web reader included",
          description: "Read online between digests. Bookmark articles and track your reading history.",
        },
      ]}
      faqs={[
        {
          q: "Is Curio an exact Mailbrew replacement?",
          a: "Curio focuses on article digests from RSS sources. If you used Mailbrew mainly for newsletter and article curation, Curio is an excellent replacement.",
        },
        {
          q: "Can I choose when my digest arrives?",
          a: "Yes. You pick the hour and frequency (daily or weekly) per topic during onboarding.",
        },
        {
          q: "Does it support multiple digest topics?",
          a: "Yes. You can follow multiple topics and configure separate digest schedules for each.",
        },
        {
          q: "Is there a free plan?",
          a: "Yes. Curio's free tier includes up to 5 topics and email digests. No credit card required.",
        },
      ]}
    />
  )
}
