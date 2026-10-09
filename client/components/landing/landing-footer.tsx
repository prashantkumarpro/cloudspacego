'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LandingContainer } from '@/components/landing/landing-container'
import { ScrollReveal } from '@/components/landing/scroll-reveal'

interface FooterLink {
  label: string
  href: string
  isExternal?: boolean
}

const PRODUCT_LINKS: FooterLink[] = [
  { label: 'File Management', href: '#organize' },
  { label: 'Folders', href: '#organize' },
  { label: 'Search', href: '#search' },
  { label: 'File Previews', href: '#preview' },
  { label: 'Sharing', href: '#sharing' },
  { label: 'Storage Plans', href: '#storage' }
]

const RESOURCE_LINKS: FooterLink[] = [
  { label: 'How It Works', href: '#search' },
  { label: 'Contact Support', href: 'mailto:support@cloudspacego.com', isExternal: true }
]

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', href: '#privacy' },
  { label: 'Terms of Service', href: '#terms' }
]

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden select-none">
      {/* Top Border Divider Aligned with Container */}
      <LandingContainer>
        <div className="w-full h-px bg-[#24242B]" />
      </LandingContainer>

      {/* Upper Main Footer Section with Background Wordmark */}
      <div className="relative pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20 overflow-hidden">
        
        {/* Subtle Low-Contrast Background Wordmark - contained strictly in the upper area above bottom border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-center overflow-hidden select-none z-0 opacity-[0.03] dark:opacity-[0.035]"
        >
          <span className="font-sans font-black tracking-tighter uppercase whitespace-nowrap text-[15vw] lg:text-[140px] leading-none text-white block select-none">
            CLOUDSPACEGO
          </span>
        </div>

        <LandingContainer className="relative z-10">
          <ScrollReveal duration={450} distance={12}>
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Brand Column */}
              <div className="md:col-span-5 lg:col-span-5 flex flex-col space-y-3 max-w-sm">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-85"
                  aria-label="CloudSpaceGo Home"
                >
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <Image
                      src="/images/cloudeLogo.png"
                      width={32}
                      height={28}
                      alt="CloudSpaceGo logo"
                      className="w-8 h-auto object-contain shrink-0"
                    />
                  </div>
                  <span className="text-xl font-bold tracking-tight font-sans text-[#F5F5F7] flex items-center whitespace-nowrap">
                    cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
                  </span>
                </Link>

                <p className="text-sm font-semibold text-[#F5F5F7] tracking-tight">
                  Your files, organized in one simple space.
                </p>

                <p className="text-xs sm:text-[13px] text-[#A1A1AA] leading-relaxed">
                  Store, organize, search, preview, and share your files in one secure, unified workspace.
                </p>
              </div>

              {/* Navigation Link Columns */}
              <div className="md:col-span-7 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                
                {/* Product */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase">
                    Product
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-[13px]">
                    {PRODUCT_LINKS.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-[#71717A] hover:text-[#F5F5F7] transition-colors duration-150 inline-block py-0.5"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase">
                    Resources
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-[13px]">
                    {RESOURCE_LINKS.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          {...(link.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className="text-[#71717A] hover:text-[#F5F5F7] transition-colors duration-150 inline-block py-0.5"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase">
                    Legal
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-[13px]">
                    {LEGAL_LINKS.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-[#71717A] hover:text-[#F5F5F7] transition-colors duration-150 inline-block py-0.5"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </ScrollReveal>
        </LandingContainer>
      </div>

      {/* Dedicated Bottom Bar with Border Aligned to Container */}
      <div className="relative z-10 bg-[#0B0B0D]">
        <LandingContainer>
          <div className="border-t border-[#24242B] py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
            <p className="text-[11px] sm:text-xs text-center sm:text-left">
              &copy; {currentYear} CloudSpaceGo. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[11px] sm:text-xs">
              <a href="#privacy" className="hover:text-[#A1A1AA] transition-colors duration-150">
                Privacy Policy
              </a>
              <span className="text-[#24242B]">•</span>
              <a href="#terms" className="hover:text-[#A1A1AA] transition-colors duration-150">
                Terms of Service
              </a>
            </div>
          </div>
        </LandingContainer>
      </div>

    </footer>
  )
}



