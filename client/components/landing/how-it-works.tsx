'use client'

import React from 'react'
import { UserPlus, UploadCloud, Share2, ArrowRight } from 'lucide-react'

const steps = [
  {
    step: '01',
    title: 'Create your account',
    description: 'Set up your CloudSpaceGo workspace in seconds with simple and secure registration.',
    icon: UserPlus,
  },
  {
    step: '02',
    title: 'Upload your files',
    description: 'Drag and drop documents, photos, and project folders directly into your cloud space.',
    icon: UploadCloud,
  },
  {
    step: '03',
    title: 'Access and share',
    description: 'Quickly locate any item with instant search, organize directories, and share with your team.',
    icon: Share2,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-card-border bg-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#6E60EE] dark:text-[#8E82F8]">
            Simple by design
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Get started in three steps.
          </h2>

          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            No complicated setup or onboarding delays. Start organizing and accessing your files right away.
          </p>
        </div>

        {/* Steps Flow Grid */}
        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* Subtle connecting line across desktop steps */}
          <div
            className="hidden md:block absolute top-1/2 left-[18%] right-[18%] -translate-y-8 h-[2px] bg-gradient-to-r from-card-border via-[#6E60EE]/40 to-card-border -z-0"
            aria-hidden="true"
          />

          {steps.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="relative z-10 flex flex-col items-center text-center rounded-2xl border border-card-border bg-card-bg p-7 shadow-2xs transition-all duration-200 hover:border-[#6E60EE]/40 hover:shadow-[0_12px_32px_rgba(110,96,238,0.08)]"
              >
                {/* Step Pill Header */}
                <div className="relative mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-input-bg text-[#6E60EE] dark:text-[#8E82F8] border border-card-border/60 shadow-2xs">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#6E60EE] text-[11px] font-bold text-white shadow-xs">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-text-secondary max-w-xs">
                  {item.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="mt-6 flex items-center gap-1 text-xs font-medium text-text-muted md:hidden">
                    <span>Next step</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
