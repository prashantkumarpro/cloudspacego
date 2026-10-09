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
  { label: 'GitHub Repository', href: 'https://github.com/prashantkumarpro/cloudspacego', isExternal: true },
  { label: 'Contact Support', href: 'mailto:support@cloudspacego.com', isExternal: true }
]

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', href: '#privacy' },
  { label: 'Terms of Service', href: '#terms' },
  { label: 'Security Overview', href: '#sharing' }
]

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[#0B0B0D] text-[#F5F5F7] border-t border-[#24242B]/80 overflow-hidden select-none">
      
      {/* ======================================================== */}
      {/* OVERSIZED BACKGROUND WORDMARK (Extremely low contrast)  */}
      {/* ======================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-full text-center overflow-hidden z-0 select-none opacity-[0.03] dark:opacity-[0.035]"
      >
        <span className="font-sans font-black tracking-tighter uppercase whitespace-nowrap text-[18vw] sm:text-[16vw] lg:text-[190px] leading-none text-white block">
          CLOUDSPACEGO
        </span>
      </div>

      <LandingContainer className="relative z-10 pt-14 pb-8 sm:pt-16 sm:pb-10 lg:pt-20 lg:pb-10">
        <ScrollReveal duration={450} distance={12}>
          {/* Main Footer Grid: Brand (Left) + 3 Nav Columns (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 sm:pb-16">
            
            {/* Left Brand Column (md:col-span-5 lg:col-span-5) */}
            <div className="md:col-span-5 lg:col-span-5 flex flex-col justify-between space-y-5 max-w-sm">
              <div className="space-y-3.5">
                {/* Logo & Brand Wordmark */}
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

                {/* Tagline */}
                <p className="text-sm font-semibold text-[#F5F5F7] tracking-tight">
                  Your files, organized in one simple space.
                </p>

                {/* Description */}
                <p className="text-xs sm:text-[13px] text-[#A1A1AA] leading-relaxed">
                  Store, organize, search, preview, and share your files with end-to-end security and effortless collaboration.
                </p>

                {/* Subtle Editorial Accent Note (using Instrument Serif) */}
                <div className="pt-1.5 border-l-2 border-[#6E60EE]/40 pl-3">
                  <p className="font-serif italic text-xs sm:text-[13px] text-[#71717A] leading-normal">
                    &ldquo;Engineered for speed, privacy, and effortless cloud storage.&rdquo;
                  </p>
                </div>
              </div>

              {/* GitHub repo icon pill */}
              <div className="pt-1 flex items-center gap-2.5">
                <a
                  href="https://github.com/prashantkumarpro/cloudspacego"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141419] border border-[#24242B] text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F7] hover:border-[#383842] hover:bg-[#181820] transition-all duration-150 active:scale-95"
                  aria-label="CloudSpaceGo GitHub repository"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Open Source</span>
                </a>
              </div>
            </div>

            {/* Navigation Columns (md:col-span-7 lg:col-span-7) */}
            <div className="md:col-span-7 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
              
              {/* Column 1: Product */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase">
                  Product
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-[13px]">
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

              {/* Column 2: Resources */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase">
                  Resources
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-[13px]">
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

              {/* Column 3: Company / Legal */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase">
                  Legal
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-[13px]">
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

          {/* ======================================================== */}
          {/* BOTTOM ROW: Subtle 1px Divider + Brand Statement + Year  */}
          {/* ======================================================== */}
          <div className="pt-6 border-t border-[#24242B]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
            
            {/* Concise Brand Statement */}
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#71717A] text-center sm:text-left">
              BUILT FOR FAST, EFFORTLESS CLOUD STORAGE.
            </p>

            {/* Copyright with dynamic year */}
            <p className="text-[11px] sm:text-xs font-medium tracking-normal text-[#71717A] text-center sm:text-right">
              &copy; {currentYear} CloudSpaceGo. All rights reserved.
            </p>
          </div>
        </ScrollReveal>
      </LandingContainer>
    </footer>
  )
}

