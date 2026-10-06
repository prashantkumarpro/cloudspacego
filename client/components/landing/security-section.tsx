'use client'

import React from 'react'
import { ShieldCheck, Lock, UserCheck, Server } from 'lucide-react'

const securityPoints = [
  {
    icon: UserCheck,
    title: 'Organized file ownership',
    description:
      'Every file and directory is bound to authenticated user accounts, ensuring clear ownership boundaries and isolated data partitions.',
  },
  {
    icon: Lock,
    title: 'Controlled access & sharing',
    description:
      'Manage who can view or download specific assets with explicit sharing permissions that you can revoke at any time.',
  },
  {
    icon: Server,
    title: 'High-availability storage',
    description:
      'Built on top of robust Cloudflare R2 object storage for durability, rapid uploads, and reliable global asset streaming.',
  },
  {
    icon: ShieldCheck,
    title: 'Session & cookie security',
    description:
      'Protected with signed, HttpOnly authentication tokens with strict cross-site protection to prevent unauthorized session hijacking.',
  },
]

export function SecuritySection() {
  return (
    <section id="security" className="border-t border-card-border bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-input-bg px-3.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
            <span>Security & Trust</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-[36px] font-extrabold tracking-tight text-foreground">
            Your files stay organized and under your control.
          </h2>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-text-secondary">
            CloudSpaceGo is designed from the ground up around clear file ownership, organized workspaces, and responsible data management.
          </p>
        </div>

        {/* Security Cards Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {securityPoints.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-card-border bg-card-bg p-5 sm:p-6 transition-all duration-200 hover:border-[#6E60EE]/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-input-bg text-[#6E60EE] border border-card-border/60 shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
