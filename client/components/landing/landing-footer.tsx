'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LandingContainer } from '@/components/landing/landing-container'
import { ScrollReveal } from '@/components/landing/scroll-reveal'

export function LandingFooter() {
  return (
    <footer className="bg-[#0B0B0D] py-12 sm:py-14 text-[#F5F5F7] transition-colors duration-200 border-t border-[#24242B]/60">
      <LandingContainer>
        <ScrollReveal duration={500} distance={14}>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            {/* Brand & Tagline */}
            <div className="flex flex-col gap-2.5">
              <Link
                href="/"
                className="flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-85 select-none"
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <Image
                    src="/images/cloudeLogo.png"
                    width={28}
                    height={24}
                    alt="CloudSpaceGo"
                    className="w-7 h-auto object-contain shrink-0"
                  />
                </div>
                <span className="text-lg font-bold tracking-tight font-sans text-[#F5F5F7] flex items-center whitespace-nowrap">
                  cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
                </span>
              </Link>
              <p className="text-xs text-[#71717A] max-w-sm leading-relaxed">
                Simple, fast, private cloud storage.
              </p>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-[#A1A1AA]">
              <a href="#organize" className="transition-colors duration-150 hover:text-[#F5F5F7]">
                Organize
              </a>
              <a href="#search" className="transition-colors duration-150 hover:text-[#F5F5F7]">
                Search
              </a>
              <a href="#preview" className="transition-colors duration-150 hover:text-[#F5F5F7]">
                Preview
              </a>
              <a href="#uploads" className="transition-colors duration-150 hover:text-[#F5F5F7]">
                Uploads
              </a>
              <a href="#sharing" className="transition-colors duration-150 hover:text-[#F5F5F7]">
                Sharing
              </a>
              <a href="#storage" className="transition-colors duration-150 hover:text-[#F5F5F7]">
                Storage
              </a>
              <Link href="/login" className="transition-colors duration-150 hover:text-[#7C6CFF]">
                Log in
              </Link>
              <Link href="/register" className="transition-colors duration-150 hover:text-[#7C6CFF]">
                Sign up
              </Link>
            </div>
          </div>

          {/* Bottom Divider & Legal */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#24242B] pt-6 text-xs text-[#71717A] sm:flex-row">
            <div>
              <span>
                © {new Date().getFullYear()} cloud<span className="font-bold text-[#6E60EE]">spacego</span>. All rights reserved.
              </span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="transition-colors duration-150 hover:text-[#F5F5F7]">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors duration-150 hover:text-[#F5F5F7]">
                Terms of Service
              </a>
              <a href="#" className="transition-colors duration-150 hover:text-[#F5F5F7]">
                Security
              </a>
            </div>
          </div>
        </ScrollReveal>
      </LandingContainer>
    </footer>
  )
}

