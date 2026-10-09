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
  { label: 'Features', href: '#organize' },
  { label: 'Pricing', href: '#storage' }
]

const RESOURCE_LINKS: FooterLink[] = [
  { label: 'Contact', href: 'mailto:support@cloudspacego.com', isExternal: true },
  { label: 'GitHub', href: 'https://github.com/prashantkumarpro/cloudspacego', isExternal: true }
]

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', href: '#privacy' },
  { label: 'Terms of Service', href: '#terms' }
]

export function LandingFooter() {
  return (
    <footer className="relative bg-[#0B0B0D] pt-12 pb-8 sm:pt-14 sm:pb-8 text-[#F5F5F7] transition-colors duration-200 border-t border-[#24242B]/70 select-none">
      <LandingContainer>
        <ScrollReveal duration={450} distance={12}>
          {/* Main Footer Row: Brand (Left) + 3 Compact Nav Columns (Right) */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 lg:gap-16">
            
            {/* Brand Section */}
            <div className="flex flex-col max-w-sm shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-85 select-none"
                aria-label="CloudSpaceGo Home"
              >
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <Image
                    src="/images/cloudeLogo.png"
                    width={32}
                    height={28}
                    alt="cloudspacego logo"
                    className="w-8 h-auto object-contain shrink-0"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight font-sans text-[#F5F5F7] flex items-center whitespace-nowrap">
                  cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
                </span>
              </Link>

              <p className="mt-3.5 text-sm font-semibold text-[#F5F5F7] tracking-tight">
                Your files. One simple space.
              </p>

              <p className="mt-1.5 text-xs text-[#71717A] leading-relaxed max-w-xs">
                Simple, secure cloud storage for your files, photos, and documents.
              </p>

              {/* GitHub Link */}
              <div className="mt-4 flex items-center gap-2">
                <a
                  href="https://github.com/prashantkumarpro/cloudspacego"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#141419] border border-[#24242B] flex items-center justify-center text-[#A1A1AA] hover:text-[#F5F5F7] hover:border-[#383842] hover:bg-[#181820] transition-all duration-150 active:scale-95"
                  aria-label="GitHub Repository"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Navigation — 3 Compact Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
              
              {/* Product */}
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase mb-3 sm:mb-3.5">
                  Product
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-[13px]">
                  {PRODUCT_LINKS.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors duration-150"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase mb-3 sm:mb-3.5">
                  Resources
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-[13px]">
                  {RESOURCE_LINKS.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors duration-150"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase mb-3 sm:mb-3.5">
                  Legal
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-[13px]">
                  {LEGAL_LINKS.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors duration-150"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Compact Copyright & Quick Legal */}
          <div className="mt-10 pt-6 border-t border-[#24242B]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
            <p>© 2026 CloudSpaceGo. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[#71717A]">
              <a href="#privacy" className="hover:text-[#A1A1AA] transition-colors duration-150">
                Privacy Policy
              </a>
              <span className="text-[#24242B]">•</span>
              <a href="#terms" className="hover:text-[#A1A1AA] transition-colors duration-150">
                Terms of Service
              </a>
            </div>
          </div>
        </ScrollReveal>
      </LandingContainer>
    </footer>
  )
}
