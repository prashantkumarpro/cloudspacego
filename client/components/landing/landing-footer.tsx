'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function LandingFooter() {
  return (
    <footer className="border-t border-card-border bg-background px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Brand & Tagline */}
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-85 select-none"
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
              <span className="text-lg font-bold tracking-tight font-sans text-foreground flex items-center whitespace-nowrap">
                cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
              </span>
            </Link>
            <p className="text-xs text-text-muted max-w-sm">
              Simple, modern, and reliable cloud storage designed to keep your files organized and always accessible.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-text-secondary">
            <a href="#features" className="transition-colors hover:text-[#6E60EE] dark:hover:text-[#8E82F8]">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-[#6E60EE] dark:hover:text-[#8E82F8]">
              How it works
            </a>
            <a href="#security" className="transition-colors hover:text-[#6E60EE] dark:hover:text-[#8E82F8]">
              Security
            </a>
            <Link href="/login" className="transition-colors hover:text-[#6E60EE] dark:hover:text-[#8E82F8]">
              Log in
            </Link>
            <Link href="/register" className="transition-colors hover:text-[#6E60EE] dark:hover:text-[#8E82F8]">
              Sign up
            </Link>
          </div>
        </div>

        {/* Bottom Divider & Legal */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-card-border pt-6 text-xs text-text-muted sm:flex-row">
          <span>
            © {new Date().getFullYear()} cloud<span className="font-bold text-[#6E60EE]">spacego</span>. All rights reserved.
          </span>

          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-[#6E60EE] dark:hover:text-[#8E82F8]">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-[#6E60EE] dark:hover:text-[#8E82F8]">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-[#6E60EE] dark:hover:text-[#8E82F8]">
              System Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
