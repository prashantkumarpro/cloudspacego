'use client'

import React from 'react'
import Link from 'next/link'
import { Check, ArrowRight, Database } from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'
import { ScrollReveal } from '@/components/landing/scroll-reveal'

interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  annualPrice?: string
  storage: string
  storageLabel: string
  tagline: string
  badge?: string
  isPopular?: boolean
  cta: {
    text: string
    href?: string
    isLive: boolean
  }
  features: string[]
}

const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    annualPrice: 'No credit card required',
    tagline: 'A simple way to get started.',
    storage: '1 GB',
    storageLabel: 'Free tier',
    cta: {
      text: 'Get started free',
      href: '/register',
      isLive: true
    },
    features: [
      '1 GB cloud storage',
      'Basic file and folder management',
      'File previews and basic search',
      'Secure, private file access'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$2.99',
    period: '/ month',
    annualPrice: 'or $29.99 / year billed annually',
    tagline: 'More space for your personal files.',
    storage: '10 GB',
    storageLabel: 'Pro tier',
    badge: 'RECOMMENDED',
    isPopular: true,
    cta: {
      text: 'Coming soon',
      isLive: false
    },
    features: [
      'Everything included in Free',
      '10 GB high-speed cloud storage',
      'Advanced search and fast previews',
      'Priority upload speed'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: '$19.99',
    period: '/ month',
    annualPrice: 'or $199.99 / year billed annually',
    tagline: 'For teams and growing projects.',
    storage: '1 TB',
    storageLabel: 'Business tier',
    cta: {
      text: 'Coming soon',
      isLive: false
    },
    features: [
      '1 TB business-focused storage',
      'Team sharing and folder permissions',
      'Access controls and protected links',
      'Priority support'
    ]
  }
]

export function StorageSection() {
  return (
    <section id="storage" className="relative py-12 sm:py-16 lg:py-20 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10 flex flex-col items-center">
        
        {/* Section Eyebrow with Scroll Reveal */}
        <ScrollReveal className="mb-3 sm:mb-4 flex justify-center" duration={450} distance={12}>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#24242B] bg-[#101014] px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#A1A1AA] uppercase select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
            <span>PRICING</span>
          </div>
        </ScrollReveal>

        {/* Section Headline with Scroll Reveal */}
        <ScrollReveal className="max-w-2xl text-center" delay={60} duration={500} distance={16}>
          <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.08]">
            <span className="text-[#F5F5F7] block">Simple storage.</span>
            <span className="text-[#6E60EE] block">Clear plans.</span>
          </h2>

          <p className="mt-3 sm:mt-4 max-w-lg mx-auto text-sm sm:text-base font-normal leading-relaxed text-[#A1A1AA]">
            Choose the plan that fits your needs. Upgrade anytime as you grow.
          </p>
        </ScrollReveal>

        {/* 3-Tier Pricing Grid with Staggered Scroll Reveal */}
        <div className="mt-8 sm:mt-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-6xl">
          {PLANS.map((plan, index) => (
            <ScrollReveal
              key={plan.id}
              delay={120 + index * 90}
              duration={500}
              distance={18}
              className="flex"
            >
              <div
                className={`w-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200 ${
                  plan.isPopular
                    ? 'border border-[#6E60EE] bg-[#141226]'
                    : 'border border-[#24242B] bg-[#101014] hover:border-[#383842]'
                }`}
              >
                {/* Top Block: Reserved badge area, Title, Tagline, Price, Storage, and CTA */}
                <div>
                  {/* 1. Reserved Badge Row */}
                  <div className="h-6 mb-3 flex items-center">
                    {plan.badge ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1D1935] text-[#6E60EE] text-[10.5px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6E60EE]" />
                        <span>{plan.badge}</span>
                      </div>
                    ) : (
                      <div className="h-6" aria-hidden="true" />
                    )}
                  </div>

                  {/* 2. Plan Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F7] tracking-tight">
                    {plan.name}
                  </h3>

                  {/* 3. Description */}
                  <p className="text-xs sm:text-sm text-[#71717A] mt-1 h-5 flex items-center">
                    {plan.tagline}
                  </p>

                  {/* 4. Price & Billing Note */}
                  <div className="mt-5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-[#F5F5F7] tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs text-[#71717A] font-medium">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-1 h-4 truncate">
                      {plan.annualPrice}
                    </p>
                  </div>

                  {/* 5. Storage Highlight Callout */}
                  <div className="mt-4 p-3 rounded-xl bg-[#0D0D10] border border-[#24242B]/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#6E60EE]" />
                      <span className="text-xs font-semibold text-[#F5F5F7]">
                        {plan.storage} Storage
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[#71717A] font-medium">
                      {plan.storageLabel}
                    </span>
                  </div>

                  {/* 6. CTA Button */}
                  {plan.cta.isLive && plan.cta.href ? (
                    <Link
                      href={plan.cta.href}
                      className="w-full h-11 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 mt-5 transition-all duration-150 bg-[#101014] border border-[#24242B] hover:border-[#383842] hover:bg-[#141419] text-[#F5F5F7] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]"
                    >
                      <span>{plan.cta.text}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div
                      className={`w-full h-11 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 mt-5 select-none ${
                        plan.isPopular
                          ? 'bg-[#6E60EE]/90 text-white/90 shadow-xs'
                          : 'bg-[#141419] border border-[#24242B]/60 text-[#71717A]'
                      }`}
                    >
                      <span>{plan.cta.text}</span>
                    </div>
                  )}
                </div>

                {/* 7. Divider & 8. Feature List */}
                <div className="mt-6 pt-6 border-t border-[#24242B]/70">
                  <div className="space-y-3.5 text-xs sm:text-sm text-[#A1A1AA]">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#6E60EE] shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom Guarantee Note with Scroll Reveal */}
        <ScrollReveal delay={420} duration={450} distance={10}>
          <p className="mt-8 sm:mt-10 text-xs sm:text-sm text-[#71717A] text-center font-normal">
            You can upgrade or downgrade at any time. All plans include end-to-end encryption.
          </p>
        </ScrollReveal>
      </LandingContainer>
    </section>
  )
}
