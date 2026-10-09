'use client'

import React, { useState } from 'react'
import {
  Link2,
  Check,
  Lock,
  Calendar,
  Folder,
  UserPlus
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { useInView } from '@/hooks/use-in-view'

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Editor' | 'Viewer'
  avatarColor: string
}

const COLLABORATORS: Collaborator[] = [
  {
    id: '1',
    name: 'You',
    email: 'prashant@cloudspacego.com',
    role: 'Owner',
    avatarColor: 'bg-[#6E60EE]'
  },
  {
    id: '2',
    name: 'Alex Rivera',
    email: 'alex@designstudio.io',
    role: 'Editor',
    avatarColor: 'bg-emerald-500'
  },
  {
    id: '3',
    name: 'Sarah Chen',
    email: 'sarah@acme.corp',
    role: 'Viewer',
    avatarColor: 'bg-pink-500'
  },
  {
    id: '4',
    name: 'Mike Ross',
    email: 'mike@partner.com',
    role: 'Viewer',
    avatarColor: 'bg-amber-500'
  }
]

export function ShareSection() {
  const [copied, setCopied] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>(COLLABORATORS)
  const [requirePassword, setRequirePassword] = useState(true)
  const [expiresInDays, setExpiresInDays] = useState('7 days')
  const { ref: mockupRef, isInView } = useInView<HTMLDivElement>({ threshold: 0.15 })

  const handleCopy = () => {
    navigator.clipboard?.writeText('https://cloudspacego.com/share/s7x9k2v8')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRoleChange = (id: string, newRole: Collaborator['role']) => {
    setCollaborators(prev =>
      prev.map(c => (c.id === id ? { ...c, role: newRole } : c))
    )
  }

  return (
    <section id="sharing" className="relative py-10 sm:py-14 lg:py-16 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10">
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal className="max-w-2xl text-left" duration={500} distance={16}>
          <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.15]">
            Share what matters.
          </h2>

          <p className="mt-2 sm:mt-2.5 max-w-xl text-sm sm:text-base font-normal leading-relaxed text-[#A1A1AA]">
            Collaborate on individual assets or entire project folders. Manage who can view,
            edit, or comment, and enforce password protection and automatic link expiry.
          </p>
        </ScrollReveal>

        {/* CloudSpaceGo Share Modal Interface */}
        <ScrollReveal delay={120} duration={550} distance={18}>
          <div ref={mockupRef} className="mt-5 sm:mt-6 w-full rounded-2xl border border-[#24242B] bg-[#101014] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#24242B] bg-[#0D0D10]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#141419] border border-[#24242B] flex items-center justify-center text-[#6E60EE] shrink-0">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F5F5F7]">
                      Share &ldquo;Project Assets&rdquo;
                    </h3>
                    <p className="text-xs text-[#71717A]">
                      Folder · 45 files · 1.2 GB total
                    </p>
                  </div>
                </div>

                {/* Share Link Row */}
                <div className="flex items-center gap-2 w-full sm:max-w-md">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                    <input
                      type="text"
                      readOnly
                      value="https://cloudspacego.com/share/s7x9k2v8"
                      className="w-full rounded-xl border border-[#24242B] bg-[#141419] py-2 pl-10 pr-3 text-xs font-mono text-[#A1A1AA] select-all focus:outline-none transition-colors duration-150"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#6E60EE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5F52DE] active:scale-[0.98] transition-all duration-150 cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Link2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2-Column Grid: Security Controls & Collaborator List */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Link Security Controls */}
              <div className="p-4 sm:p-5 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#24242B] bg-[#0A0A0C] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A] block mb-3">
                    Access & Security
                  </span>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-[#24242B] bg-[#141419]">
                      <div className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-[#6E60EE]" />
                        <div>
                          <p className="font-semibold text-[#F5F5F7]">Password Required</p>
                          <p className="text-[10px] text-[#71717A]">Protected link</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRequirePassword(!requirePassword)}
                        aria-label="Toggle password protection"
                        className={`w-8 h-4.5 rounded-full transition-colors duration-200 relative cursor-pointer ${
                          requirePassword ? 'bg-[#6E60EE]' : 'bg-[#24242B]'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ${
                            requirePassword ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-[#24242B] bg-[#141419]">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-[#6E60EE]" />
                        <div>
                          <p className="font-semibold text-[#F5F5F7]">Link Expiration</p>
                          <p className="text-[10px] text-[#71717A]">Expires in {expiresInDays}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-[#6E60EE]">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#24242B]">
                  <p className="text-[10px] text-[#71717A] leading-relaxed">
                    Only users with the link and passcode can view these files.
                  </p>
                </div>
              </div>

              {/* Right Column: Collaborator List with Staggered Reveal */}
              <div className="p-4 sm:p-5 lg:col-span-7 bg-[#101014] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                    Collaborators ({collaborators.length})
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#6E60EE] hover:text-[#5F52DE] cursor-pointer transition-colors duration-150"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {collaborators.map((c, idx) => (
                    <div
                      key={c.id}
                      style={{
                        opacity: isInView ? 1 : 0,
                        transform: isInView ? 'translateY(0px)' : 'translateY(4px)',
                        transitionProperty: 'opacity, transform, background-color',
                        transitionDuration: '250ms, 250ms, 150ms',
                        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        transitionDelay: `${idx * 35}ms, ${idx * 35}ms, 0ms`
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-[#24242B] bg-[#141419] hover:bg-[#181822] hover:border-[#32323D] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full ${c.avatarColor} text-white font-bold text-[11px] flex items-center justify-center shrink-0`}
                        >
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#F5F5F7] truncate">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-[#71717A] truncate">
                            {c.email}
                          </p>
                        </div>
                      </div>

                      {/* Role Tag / Selector */}
                      <div>
                        {c.role === 'Owner' ? (
                          <span className="text-[11px] font-semibold text-[#A1A1AA] px-2 py-0.5">
                            Owner
                          </span>
                        ) : (
                          <select
                            value={c.role}
                            onChange={(e) => handleRoleChange(c.id, e.target.value as Collaborator['role'])}
                            aria-label={`Permission role for ${c.name}`}
                            className="text-[11px] font-medium text-[#6E60EE] bg-[#1D1935] border border-[#24242B] rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#6E60EE] cursor-pointer transition-colors duration-150"
                          >
                            <option value="Editor">Editor</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </LandingContainer>
    </section>
  )
}

