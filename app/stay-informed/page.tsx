import type { Metadata } from "next"
import { Mail, Rss, Zap, BookOpen } from "lucide-react"
import { SeoLanding } from "@/components/seo-landing"

export const metadata: Metadata = {
  title: "Stay Informed Without Doom-Scrolling — ArticleIt",
  description:
    "Stay up to date on what matters without social media noise. ArticleIt delivers quality-ranked articles from your chosen topics straight to your inbox.",
  alternates: { canonical: "/stay-informed" },
  openGraph: {
    title: "Stay Informed Without Doom-Scrolling — ArticleIt",
    description: "Quality articles on your topics, delivered to your inbox. No algorithm, no noise.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can I stay informed without social media?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ArticleIt delivers quality-ranked articles on your chosen topics to your inbox — no algorithm, no doom-scrolling, no noise.",
      },
    },
    {
      "@type": "Question",
      name: "How do I stay up to date on industry news?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ArticleIt curates 200+ sources across topics like AI, Startups, Design, and more. Get a daily or weekly digest sent to your email.",
      },
    },
  ],
}

export default function StayInformedPage() {
  return (
    <SeoLanding
      h1="Stay Informed on What Matters — Without the Noise"
      subheadline="No algorithm. No doom-scrolling. Just quality-ranked articles on your chosen topics, delivered to your inbox when you want them."
      ctaText="Start staying informed — free"
      jsonLd={jsonLd}
      features={[
        {
          icon: <Zap className="w-5 h-5 text-amber-500" />,
          title: "No algorithm, no noise",
          description: "Articles ranked by source quality — not engagement bait, not sponsored content.",
        },
        {
          icon: <Mail className="w-5 h-5 text-amber-500" />,
          title: "Inbox delivery",
          description: "Your daily briefing arrives in email. Read on your schedule, not the platform's.",
        },
        {
          icon: <Rss className="w-5 h-5 text-amber-500" />,
          title: "200+ trusted sources",
          description: "Curated from the web's best publishers across AI, tech, design, business, and more.",
        },
        {
          icon: <BookOpen className="w-5 h-5 text-amber-500" />,
          title: "12+ topic areas",
          description: "Pick exactly what you care about. Nothing else gets through.",
        },
      ]}
      faqs={[
        {
          q: "What topics can I stay informed about?",
          a: "AI & ML, Startups, React, Design, Productivity, Crypto, Science, and more — 12+ curated topic areas.",
        },
        {
          q: "Is there a daily digest option?",
          a: "Yes. Get a daily digest at any hour you choose, or weekly if you prefer a lighter touch.",
        },
        {
          q: "How is this different from Google News?",
          a: "ArticleIt pulls from RSS sources with no ad targeting or engagement optimization. Quality is determined by reader behavior, not ad revenue.",
        },
        {
          q: "Can I try it for free?",
          a: "Yes. Sign up free, pick your topics, set your digest schedule. No credit card needed.",
        },
      ]}
    />
  )
}
