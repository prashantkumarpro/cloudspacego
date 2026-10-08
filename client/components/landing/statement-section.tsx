'use client'

import React from 'react'

export function StatementSection() {
  return (
    <section className="relative px-5 py-20 sm:py-24 lg:py-28 border-t border-[#24242B] bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <div className="mx-auto max-w-4xl text-center relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#24242B] bg-[#101014] px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#A1A1AA] select-none mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
          <span>Unified Workspace</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.12]">
          Your files shouldn&apos;t feel scattered.
        </h2>

        <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg font-normal leading-relaxed text-[#A1A1AA]">
          CloudSpaceGo brings storage, organization, search, preview, and sharing
          into one clean, cohesive experience designed to keep you focused.
        </p>
      </div>
    </section>
  )
}

