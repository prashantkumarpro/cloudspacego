'use client'

import React from 'react'
import { HardDrive, Search, Share2, Globe, ArrowUpRight } from 'lucide-react'

const features = [
  {
    icon: HardDrive,
    title: 'Store your files',
    description:
      'Keep your documents, images, videos, and other files organized in one clean, reliable space.',
    tag: 'Cloud Storage'
  },
  {
    icon: Search,
    title: 'Find files faster',
    description:
      'Search, organize, and access your files instantly without digging through complex folder trees.',
    tag: 'Instant Search'
  },
  {
    icon: Share2,
    title: 'Share with others',
    description:
      'Share files and directories seamlessly with the people who need access to collaborate.',
    tag: 'Collaboration'
  },
  {
    icon: Globe,
    title: 'Access anywhere',
    description:
      'Your files are available whenever you need them, smoothly accessible across all your devices.',
    tag: 'Multi-Device'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-[#ECEAF0] bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#6E60EE]">
            Everything in one place
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1E1B24] sm:text-4xl">
            Built around your files.
          </h2>

          <p className="mt-4 text-base leading-relaxed text-[#71717A]">
            CloudSpaceGo gives you the essential tools to manage your files
            without unnecessary complexity, slow uploads, or bloated features.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#ECEAF0] bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#D6D1FF] hover:shadow-[0_12px_32px_rgba(110,96,238,0.08)]"
              >
                <div>
                  {/* Icon Header */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EFFF] text-[#6E60EE] transition-colors group-hover:bg-[#6E60EE] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-[11px] font-medium text-[#8A8594] bg-[#FAF9F7] px-2.5 py-1 rounded-full border border-[#ECEAF0]">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-semibold text-[#1E1B24] group-hover:text-[#6E60EE] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#71717A]">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#6E60EE] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
