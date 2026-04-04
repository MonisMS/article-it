import type { Metadata } from "next"
import { AnimatedDigest } from "@/components/landing/animated-digest"
import { BentoFeatures } from "@/components/landing/bento-features"
import { FinalCta } from "@/components/landing/final-cta"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { MotionProvider } from "@/components/landing/motion-provider"
import { SourceMarquee } from "@/components/landing/source-marquee"
import { StatsSection } from "@/components/landing/stats-section"
import { TopicsStrip } from "@/components/landing/topics-strip"
import { Footer } from "@/components/footer"
import { Nav } from "@/components/nav"

export const metadata: Metadata = {
  title: "ArticleIt — Personalized Article Digests",
  description:
    "Pick your topics, get the best articles from the web delivered to your inbox on your schedule. The Pocket alternative that sends curated digests to your email.",
  openGraph: {
    title: "ArticleIt — Personalized Article Digests",
    description: "Pick your topics, get the best articles from the web delivered to your inbox on your schedule.",
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
        "Personalized article digest service. Pick topics, get quality-ranked articles from curated RSS sources delivered to your inbox on your schedule.",
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
      <div className="bg-lp-bg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Nav />
        <Hero />
        <SourceMarquee />
        <StatsSection />
        <HowItWorks />
        <BentoFeatures />
        <AnimatedDigest />
        <TopicsStrip />
        <FinalCta />
        <Footer />
      </div>
    </MotionProvider>
  )
}
