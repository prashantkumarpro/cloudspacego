import { LandingNavbar } from '@/components/landing/landing-navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HowItWorks } from '@/components/landing/how-it-works'
import { SecuritySection } from '@/components/landing/security-section'
import { CtaSection } from '@/components/landing/cta-section'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E1B24] selection:bg-[#F2EFFF] selection:text-[#6E60EE] flex flex-col justify-between">
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