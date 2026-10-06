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
    <section id="how-it-works" className="border-t border-card-border bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-input-bg px-3.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
            <span>Simple by design</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] font-extrabold tracking-tight text-foreground">
            Get started in three steps.
          </h2>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-text-secondary">
            No complicated setup or onboarding delays. Start organizing and accessing your files right away.
          </p>
        </div>

        {/* Steps Flow Grid */}
        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          {/* Subtle connecting line across desktop steps */}
          <div
            className="hidden md:block absolute top-1/2 left-[18%] right-[18%] -translate-y-8 h-[1px] bg-card-border -z-0"
            aria-hidden="true"
          />

          {steps.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="relative z-10 flex flex-col items-center text-center rounded-xl border border-card-border bg-card-bg p-6 shadow-xs transition-all duration-200 hover:border-[#6E60EE]/40"
              >
                {/* Step Pill Header */}
                <div className="relative mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-input-bg text-[#6E60EE] border border-card-border/60 shadow-xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#6E60EE] text-[10px] font-bold text-white shadow-xs">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-text-secondary max-w-xs">
                  {item.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="mt-5 flex items-center gap-1 text-xs font-medium text-text-muted md:hidden">
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
