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
    <section id="security" className="border-t border-[#ECEAF0] bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#6E60EE]">
            Security & Trust
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1E1B24] sm:text-4xl">
            Your files stay organized and under your control.
          </h2>

          <p className="mt-4 text-base leading-relaxed text-[#71717A]">
            CloudSpaceGo is designed from the ground up around clear file ownership, organized workspaces, and responsible data management.
          </p>
        </div>

        {/* Security Cards Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {securityPoints.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-[#ECEAF0] bg-[#FAF9F7]/70 p-6 sm:p-7 transition-all duration-200 hover:border-[#D6D1FF] hover:bg-white hover:shadow-2xs"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2EFFF] text-[#6E60EE]">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[#1E1B24]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#71717A]">
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
