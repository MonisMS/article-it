import type { Metadata } from "next"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { MotionProvider } from "@/components/landing/motion-provider"
import { SourceMarquee } from "@/components/landing/source-marquee"
import { FeedPreview } from "@/components/landing/feed-preview"
import { BentoFeatures } from "@/components/landing/bento-features"
import { CalmReading } from "@/components/landing/calm-reading"
import { FinalCta } from "@/components/landing/final-cta"
import { Footer } from "@/components/footer"
import { Nav } from "@/components/nav"

export const metadata: Metadata = {
  title: "ArticleIt — Calm, Curated Reading",
  description:
    "Read what matters. Skip everything else. A calm, curated feed of high-quality articles across your interests — no noise, no endless scrolling.",
  openGraph: {
    title: "ArticleIt — Calm, Curated Reading",
    description: "A calm, curated feed of high-quality articles across your interests — no noise, no endless scrolling.",
  },
  alternates: {
    canonical: "/",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://articleit.com/#webapp",
      name: "ArticleIt",
      description:
        "A calm, curated reading platform. Pick topics, get quality-ranked articles from curated sources in a clean feed — with optional email digests.",
      url: "https://articleit.com",
      applicationCategory: "NewsApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier available",
      },
      featureList: [
        "Personalized article feed",
        "Email digest on custom schedule",
        "Quality-ranked sources",
        "12+ curated topics",
        "200+ RSS sources",
        "Reading streak tracking",
        "Bookmark articles",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is ArticleIt?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ArticleIt is a personalized article aggregator that pulls from 200+ curated RSS sources, ranks articles by source quality, and delivers a daily or weekly digest to your inbox.",
          },
        },
        {
          "@type": "Question",
          name: "Is ArticleIt free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. ArticleIt has a free tier that lets you follow up to 5 topics and receive email digests. No credit card required.",
          },
        },
        {
          "@type": "Question",
          name: "Is ArticleIt a good Pocket alternative?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Since Pocket shut down in July 2025, ArticleIt is one of the best replacements — it combines a reading feed with email digests, quality-ranked sources, and bookmarking.",
          },
        },
        {
          "@type": "Question",
          name: "How often are articles updated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ArticleIt ingests articles daily at 06:00 UTC from 200+ RSS sources across 12+ topics.",
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
        <FinalCta />
        <Footer />
      </div>
    </MotionProvider>
  )
}
