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
    <section id="features" className="border-t border-card-border bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-input-bg px-3.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
            <span>Built for Modern Workflows</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] font-extrabold tracking-tight text-foreground leading-[1.18]">
            Everything designed around your files.
          </h2>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-text-secondary">
            CloudSpaceGo combines high-performance object storage with an intuitive, distraction-free interface built to keep your workflow fast.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(feature => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-between rounded-xl border border-card-border bg-card-bg p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#6E60EE]/40"
              >
                <div>
                  {/* Icon Header */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-input-bg text-[#6E60EE] border border-card-border/60 transition-colors group-hover:bg-[#6E60EE] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-[10px] font-semibold text-text-muted bg-input-bg px-2 py-0.5 rounded-md border border-card-border">
                      {feature.metric}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-[#6E60EE] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-text-secondary">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-card-border/60 flex items-center justify-between text-xs font-semibold text-text-muted group-hover:text-[#6E60EE] transition-colors">
                  <span>{feature.tag}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
