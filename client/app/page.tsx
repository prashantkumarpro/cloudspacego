import { LandingNavbar } from '@/components/landing/landing-navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { OrganizeSection } from '@/components/landing/organize-section'
import { SearchSection } from '@/components/landing/search-section'
import { PreviewSection } from '@/components/landing/preview-section'
import { UploadSection } from '@/components/landing/upload-section'
import { ShareSection } from '@/components/landing/share-section'
import { StorageSection } from '@/components/landing/storage-section'
import { CtaSection } from '@/components/landing/cta-section'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F5F7] selection:bg-[#6E60EE]/30 selection:text-white flex flex-col justify-between transition-colors duration-200">
      <LandingNavbar />
      <main className="flex-1">
        {/* 1. Hero with CloudSpaceGo product showcase */}
        <HeroSection />

        {/* 2. Organize */}
        <OrganizeSection />

        {/* 3. Search */}
        <SearchSection />

        {/* 4. Preview */}
        <PreviewSection />

        {/* 5. Upload */}
        <UploadSection />

        {/* 6. Share */}
        <ShareSection />

        {/* 7. Storage */}
        <StorageSection />

        {/* 8. Final CTA */}
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}