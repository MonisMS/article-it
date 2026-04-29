import type { Metadata } from "next"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { MotionProvider } from "@/components/landing/motion-provider"
import { SourceMarquee } from "@/components/landing/source-marquee"
import { FeedPreview } from "@/components/landing/feed-preview"
import { BentoFeatures } from "@/components/landing/bento-features"
import { CalmReading } from "@/components/landing/calm-reading"
import { ShareFeature } from "@/components/landing/share-feature"
import { FinalCta } from "@/components/landing/final-cta"
import { Nav } from "@/components/nav"

export const metadata: Metadata = {
  title: "Curio — One place for every topic you follow",
  description:
    "Pick a topic. Curio pulls from blogs, Reddit, YouTube, Hacker News, and newsletters so you never have to hunt across the web again. 275+ sources, 26 topics, updated daily.",
  openGraph: {
    title: "Curio — One place for every topic you follow",
    description: "Pick a topic once. Curio pulls from blogs, Reddit, YouTube, HN, and newsletters — so you never need to hunt across the web again.",
  },
  alternates: {
    canonical: "/",
  },
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://curio-sity.vercel.app"

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${APP_URL}/#webapp`,
      name: "Curio",
      description:
        "One place for every topic you follow. Pick topics, get quality-ranked articles from 275+ sources — blogs, Reddit, YouTube, Hacker News, and newsletters — in a clean feed with optional email digests.",
      url: APP_URL,
      applicationCategory: "NewsApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free to start, no credit card required",
      },
      featureList: [
        "Personalized article feed",
        "Email digest on custom schedule",
        "Quality-ranked sources",
        "26 curated topics",
        "275+ RSS sources",
        "Reading streak tracking",
        "Bookmark articles",
        "Shareable public reading list",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Curio?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Curio is a personalized article aggregator that pulls from 275+ sources across blogs, Reddit, YouTube, Hacker News, and newsletters. It ranks articles by source quality and delivers a daily or weekly digest to your inbox.",
          },
        },
        {
          "@type": "Question",
          name: "Is Curio free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Curio is free to start — no credit card required. Pick topics and get email digests at no cost.",
          },
        },
        {
          "@type": "Question",
          name: "Is Curio a good Pocket alternative?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Since Pocket shut down in July 2025, Curio is one of the best replacements — it combines a reading feed with email digests, quality-ranked sources, and bookmarking.",
          },
        },
        {
          "@type": "Question",
          name: "How often are articles updated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Curio ingests articles daily at 06:00 UTC from 275+ RSS sources across 26 topics including technology, AI, startups, science, design, and more.",
          },
        },
      ],
    },
  ],
}

export default function LandingPage() {
  return (
    <MotionProvider>
      <div className="bg-app-bg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Nav />
        <Hero />
        <SourceMarquee />
        <HowItWorks />
        <FeedPreview />
        <BentoFeatures />
        <CalmReading />
        <ShareFeature />
        <FinalCta />
      </div>
    </MotionProvider>
  )
}
