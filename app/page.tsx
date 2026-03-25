import { AnimatedDigest } from "@/components/landing/animated-digest"
import { BentoFeatures } from "@/components/landing/bento-features"
import { FinalCta } from "@/components/landing/final-cta"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { SourceMarquee } from "@/components/landing/source-marquee"
import { StatsSection } from "@/components/landing/stats-section"
import { TopicsStrip } from "@/components/landing/topics-strip"
import { Footer } from "@/components/footer"
import { Nav } from "@/components/nav"

export default function LandingPage() {
  return (
    <div className="bg-lp-bg">
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
  )
}
