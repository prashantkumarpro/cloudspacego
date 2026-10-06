import { LandingNavbar } from '@/components/landing/landing-navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HowItWorks } from '@/components/landing/how-it-works'
import { SecuritySection } from '@/components/landing/security-section'
import { CtaSection } from '@/components/landing/cta-section'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#6E60EE]/25 selection:text-foreground flex flex-col justify-between transition-colors duration-200">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <SecuritySection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}