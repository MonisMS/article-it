import type { Metadata } from "next"
import { Mail, Rss, Zap, BookOpen } from "lucide-react"
import { SeoLanding } from "@/components/seo-landing"

export const metadata: Metadata = {
  title: "Personalized Email Digest — Curio",
  description:
    "Get a personalized email digest of the best articles on your topics. Curio curates 200+ RSS sources and delivers quality-ranked articles to your inbox daily or weekly.",
  alternates: { canonical: "/personalized-email-digest" },
  openGraph: {
    title: "Personalized Email Digest — Curio",
    description: "Quality-ranked articles on your topics, delivered to your inbox on your schedule.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Curio",
      description: "Personalized article email digest service. Choose topics, get quality-ranked articles in your inbox.",
      url: "https://articleit.com",
      applicationCategory: "NewsApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I get a personalized email digest?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sign up at Curio, pick your topics during onboarding, and set your preferred digest time and frequency. That's it.",
          },
        },
        {
          "@type": "Question",
          name: "How often is the digest sent?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You choose — daily or weekly, at any hour you prefer. Curio sends digests from 06:00 to 22:00 UTC.",
          },
        },
      ],
    },
  ],
}

export default function PersonalizedEmailDigestPage() {
  return (
    <SeoLanding
      h1="Your Personalized Email Digest, Built Around Your Interests"
      subheadline="Pick topics you care about. Curio pulls from 200+ curated RSS sources, ranks by quality, and sends you the best articles on your schedule."
      ctaText="Get my free digest"
      jsonLd={jsonLd}
      features={[
        {
          icon: <Mail className="w-5 h-5 text-amber-500" />,
          title: "Truly personalized",
          description: "Your digest is built from your chosen topics — AI, Startups, Design, React and more.",
        },
        {
          icon: <Zap className="w-5 h-5 text-amber-500" />,
          title: "Quality over quantity",
          description: "Every source has a quality score. You get fewer, better articles — not a firehose.",
        },
        {
          icon: <Rss className="w-5 h-5 text-amber-500" />,
          title: "200+ sources, zero maintenance",
          description: "We maintain the source list. You just pick topics and we handle the curation.",
        },
        {
          icon: <BookOpen className="w-5 h-5 text-amber-500" />,
          title: "Read online too",
          description: "Access your full feed on the web. Bookmark articles, track reading streaks.",
        },
      ]}
      faqs={[
        {
          q: "What topics can I get a digest for?",
          a: "Curio covers 12+ topics including AI & ML, Startups, React, Productivity, Design, Crypto, and more.",
        },
        {
          q: "Can I set different digest times for different topics?",
          a: "Yes. You configure a schedule per topic during onboarding or in settings.",
        },
        {
          q: "How many articles are in each digest?",
          a: "Up to 10 articles per digest, selected from your topic feeds using the quality ranking algorithm.",
        },
        {
          q: "Can I unsubscribe from specific topics?",
          a: "Yes. Every digest email has an unsubscribe link for that specific topic. You can also manage topics in settings.",
        },
      ]}
    />
  )
}
