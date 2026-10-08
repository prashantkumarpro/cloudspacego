'use client'

import React from 'react'
import { LandingContainer } from '@/components/landing/landing-container'

export function StorageSection() {
  const categories = [
    { name: 'Documents & PDFs', size: '5.4 MB', count: '14 files', color: 'bg-red-400', pct: 23 },
    { name: 'Images & Photos', size: '11.8 MB', count: '124 files', color: 'bg-blue-400', pct: 50 },
    { name: 'Archives & ZIPs', size: '4.2 MB', count: '6 files', color: 'bg-amber-400', pct: 18 },
    { name: 'Code & Data', size: '2.0 MB', count: '32 files', color: 'bg-emerald-400', pct: 9 }
  ]

  return (
    <section id="storage" className="relative py-20 sm:py-24 lg:py-28 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.12]">
            A workspace that grows with you.
          </h2>

          <p className="mt-3.5 sm:mt-4 text-base sm:text-lg font-normal leading-relaxed text-[#A1A1AA]">
            15 GB of fast cloud storage with clear visibility into how your space is allocated across documents, images, code, and archives.
          </p>
        </div>

        {/* Large Storage Showcase Card */}
        <div className="mt-10 sm:mt-12 lg:mt-14 w-full rounded-2xl border border-[#24242B] bg-[#101014] overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#24242B] pb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                  Your Cloud Storage
                </span>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-[#F5F5F7]">
                    23.4 MB
                  </span>
                  <span className="text-sm font-medium text-[#A1A1AA]">
                    used of <strong className="text-[#F5F5F7]">15.0 GB</strong> free tier
                  </span>
                </div>
              </div>
            </div>

            {/* Segmented Progress Meter */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-[#71717A] mb-2.5">
                <span>Space Allocation</span>
                <span>0.15% utilized</span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-[#141419] overflow-hidden flex gap-1 p-0.5 border border-[#24242B]">
                <div className="h-full bg-red-400 rounded-full" style={{ width: '23%' }} title="Documents: 23%" />
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '50%' }} title="Images: 50%" />
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '18%' }} title="Archives: 18%" />
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '9%' }} title="Code: 9%" />
              </div>
            </div>

            {/* Category Breakdown Grid */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="p-3.5 rounded-xl border border-[#24242B] bg-[#141419]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="text-xs font-semibold text-[#F5F5F7] truncate">
                      {cat.name}
                    </span>
                  </div>
                  <p className="text-base font-bold text-[#F5F5F7]">{cat.size}</p>
                  <p className="text-[11px] text-[#71717A] mt-0.5">{cat.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </LandingContainer>
    </section>
  )
}

