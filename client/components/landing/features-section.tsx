'use client'

import React from 'react'
import { HardDrive, Search, Share2, Sparkles, ArrowUpRight, Eye, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: HardDrive,
    title: 'Store & Organize',
    description:
      'Keep documents, images, video, and design assets cleanly structured with nested folders and color-coded tags.',
    tag: 'Cloud Storage',
    metric: '50 GB Free Tier'
  },
  {
    icon: Search,
    title: 'Instant ⌘K Search',
    description:
      'Search across file names, tags, and document metadata with sub-15ms response times. No folder digging required.',
    tag: 'Global Index',
    metric: '< 15ms Query'
  },
  {
    icon: Eye,
    title: 'High-Fidelity Previews',
    description:
      'Inspect PDFs, high-res images, spreadsheets, and source code directly in your browser without downloading.',
    tag: 'Rich Previews',
    metric: 'Multi-Format'
  },
  {
    icon: Share2,
    title: 'Collaborative Sharing',
    description:
      'Generate secure, expiring links with viewer or editor permissions to collaborate with your team effortlessly.',
    tag: 'Granular Access',
    metric: '1-Click Links'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-card-border bg-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6E60EE]/20 bg-[#6E60EE]/10 px-3.5 py-1 text-xs font-semibold text-[#6E60EE] dark:text-[#8E82F8]">
            <Sparkles className="h-3.5 w-3.5 text-[#6E60EE] dark:text-[#8E82F8]" />
            <span>Built for Modern Workflows</span>
          </div>

          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-foreground leading-[1.15]">
            Everything designed around your files.
          </h2>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-text-secondary">
            CloudSpaceGo combines high-performance object storage with an intuitive, distraction-free interface built to keep your workflow fast.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(feature => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-card-border bg-card-bg p-6 sm:p-7 shadow-2xs transition-all duration-250 hover:-translate-y-1 hover:border-[#6E60EE]/40 hover:shadow-[0_16px_36px_rgba(110,96,238,0.12)]"
              >
                <div>
                  {/* Icon Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-input-bg text-[#6E60EE] dark:text-[#8E82F8] border border-card-border/60 transition-all duration-250 group-hover:bg-[#6E60EE] group-hover:text-white group-hover:scale-105 shadow-2xs">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-[11px] font-semibold text-[#6E60EE] dark:text-[#8E82F8] bg-input-bg px-2.5 py-1 rounded-full border border-card-border">
                      {feature.metric}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-[#6E60EE] dark:group-hover:text-[#8E82F8] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-text-secondary">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-card-border/60 flex items-center justify-between text-xs font-semibold text-text-muted group-hover:text-[#6E60EE] dark:group-hover:text-[#8E82F8] transition-colors">
                  <span>{feature.tag}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
