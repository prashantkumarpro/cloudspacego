'use client'

import React, { useState } from 'react'
import {
  Link2,
  Check,
  Lock,
  Calendar,
  Folder,
  UserPlus,
  ShieldCheck,
  Globe,
  Download,
  X,
  ChevronDown
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
  initials: string
}

const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: '1',
    name: 'Prashant (You)',
    email: 'prashant@cloudspacego.com',
    role: 'Owner',
    avatarColor: 'bg-[#6E60EE]',
    initials: 'P'
  },
  {
    id: '2',
    name: 'Alex Rivera',
    email: 'alex@designstudio.io',
    role: 'Editor',
    avatarColor: 'bg-emerald-500',
    initials: 'AR'
  },
  {
    id: '3',
    name: 'Sarah Chen',
    email: 'sarah@acme.corp',
    role: 'Viewer',
    avatarColor: 'bg-pink-500',
    initials: 'SC'
  },
  {
    id: '4',
    name: 'Mike Ross',
    email: 'mike@partner.com',
    role: 'Viewer',
    avatarColor: 'bg-amber-500',
    initials: 'MR'
  }
]

export function ShareSection() {
  const [copied, setCopied] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'Viewer' | 'Editor'>('Viewer')
  const [requirePassword, setRequirePassword] = useState(true)
  const [allowDownload, setAllowDownload] = useState(true)
  const [expiryOption, setExpiryOption] = useState('7 days')
  const { ref: mockupRef, isInView } = useInView<HTMLDivElement>({ threshold: 0.15 })

  const handleCopy = () => {
    navigator.clipboard?.writeText('https://cloudspacego.app/s/prj7x9k2')
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      avatarColor: 'bg-[#6E60EE]',
      initials: inviteEmail.slice(0, 2).toUpperCase()
    }
    setCollaborators(prev => [...prev, newCollaborator])
    setInviteEmail('')
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
          <div className="relative mt-6 sm:mt-8 max-w-3xl mx-auto">
            {/* Ambient Purple Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6E60EE]/20 via-[#6E60EE]/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />

            <div
              ref={mockupRef}
              className="relative w-full rounded-2xl border border-[#24242B] bg-[#101014] shadow-2xl overflow-hidden select-none"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-[#24242B] bg-[#0D0D10] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#1D1935] border border-[#6E60EE]/20 flex items-center justify-center text-[#6E60EE] shrink-0">
                    <Folder className="w-4.5 h-4.5 text-[#6E60EE]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#F5F5F7] truncate">
                      Share &ldquo;Project Assets&rdquo;
                    </h3>
                    <p className="text-[11px] text-[#71717A] truncate">
                      Folder · 45 files · 1.2 GB total
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141419] border border-[#24242B] text-[11px] text-[#A1A1AA]">
                    <Globe className="w-3.5 h-3.5 text-[#6E60EE]" />
                    <span className="hidden xs:inline">Link sharing on</span>
                  </div>
                </div>
              </div>

              {/* Share Link & Quick Invite Section */}
              <div className="p-4 sm:p-5 border-b border-[#24242B] bg-[#101014] space-y-3">
                {/* Share Link Pill Bar */}
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-[#24242B] bg-[#141419]">
                  <div className="flex items-center gap-2 flex-1 min-w-0 px-2.5">
                    <Link2 className="w-4 h-4 text-[#71717A] shrink-0" />
                    <span className="text-xs font-mono text-[#A1A1AA] truncate select-all">
                      https://cloudspacego.app/s/prj7x9k2
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#6E60EE] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#5F52DE] shadow-xs active:scale-[0.98] transition-all cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Link2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy link'}</span>
                  </button>
                </div>

                {/* Invite People Input Row */}
                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Add people by email..."
                      className="w-full rounded-xl border border-[#24242B] bg-[#141419] px-3.5 py-2 text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#6E60EE] transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'Viewer' | 'Editor')}
                      className="h-8.5 bg-[#141419] border border-[#24242B] text-xs font-medium text-[#F5F5F7] rounded-xl px-2.5 focus:outline-none focus:border-[#6E60EE] cursor-pointer"
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Editor">Editor</option>
                    </select>

                    <button
                      type="submit"
                      disabled={!inviteEmail.trim()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#24242B] bg-[#141419] px-3.5 py-2 text-xs font-semibold text-[#F5F5F7] hover:bg-[#1A1A22] hover:border-[#383842] disabled:opacity-40 transition-all cursor-pointer shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#6E60EE]" />
                      <span>Invite</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 2-Column Responsive Split: Access List + Security Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Left Column: People with access */}
                <div className="p-4 sm:p-5 md:col-span-7 border-b md:border-b-0 md:border-r border-[#24242B] bg-[#0D0D10] flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A] block">
                      People with access ({collaborators.length})
                    </span>

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
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[#24242B]/80 bg-[#141419] hover:bg-[#181822] hover:border-[#32323D] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-full ${c.avatarColor} text-white font-bold text-[10.5px] flex items-center justify-center shrink-0 shadow-xs`}
                            >
                              {c.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#F5F5F7] truncate leading-tight">
                                {c.name}
                              </p>
                              <p className="text-[10px] text-[#71717A] truncate mt-0.5 leading-none">
                                {c.email}
                              </p>
                            </div>
                          </div>

                          {/* Role Tag / Selector */}
                          <div className="shrink-0">
                            {c.role === 'Owner' ? (
                              <span className="text-[11px] font-semibold text-[#A1A1AA] px-2 py-0.5 rounded bg-[#101014] border border-[#24242B]">
                                Owner
                              </span>
                            ) : (
                              <select
                                value={c.role}
                                onChange={(e) => handleRoleChange(c.id, e.target.value as Collaborator['role'])}
                                aria-label={`Permission role for ${c.name}`}
                                className="text-[11px] font-semibold text-[#6E60EE] bg-[#1D1935] border border-[#6E60EE]/20 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#6E60EE] cursor-pointer transition-colors"
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

                {/* Right Column: Access & Security Controls */}
                <div className="p-4 sm:p-5 md:col-span-5 bg-[#101014] flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A] block">
                      Link Settings & Security
                    </span>

                    <div className="space-y-2 text-xs">
                      {/* Password Protection */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#24242B] bg-[#141419]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#1D1935] flex items-center justify-center text-[#6E60EE] shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#F5F5F7] text-xs leading-tight">Password Required</p>
                            <p className="text-[10px] text-[#71717A] mt-0.5">Protected with passcode</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRequirePassword(!requirePassword)}
                          aria-label="Toggle password protection"
                          className={`w-8 h-4.5 rounded-full transition-colors duration-200 relative cursor-pointer shrink-0 ${
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

                      {/* Expiration Date */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#24242B] bg-[#141419]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#1D1935] flex items-center justify-center text-[#6E60EE] shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#F5F5F7] text-xs leading-tight">Link Expiry</p>
                            <p className="text-[10px] text-[#71717A] mt-0.5">{expiryOption}</p>
                          </div>
                        </div>
                        <select
                          value={expiryOption}
                          onChange={(e) => setExpiryOption(e.target.value)}
                          className="text-[11px] font-semibold text-[#6E60EE] bg-[#1D1935] border border-[#6E60EE]/20 rounded-lg px-2 py-0.5 cursor-pointer focus:outline-none"
                        >
                          <option value="7 days">7 days</option>
                          <option value="30 days">30 days</option>
                          <option value="Never">Never</option>
                        </select>
                      </div>

                      {/* Allow Downloads */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#24242B] bg-[#141419]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#1D1935] flex items-center justify-center text-[#6E60EE] shrink-0">
                            <Download className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#F5F5F7] text-xs leading-tight">Allow Downloads</p>
                            <p className="text-[10px] text-[#71717A] mt-0.5">Viewers can download</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAllowDownload(!allowDownload)}
                          aria-label="Toggle download permission"
                          className={`w-8 h-4.5 rounded-full transition-colors duration-200 relative cursor-pointer shrink-0 ${
                            allowDownload ? 'bg-[#6E60EE]' : 'bg-[#24242B]'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ${
                              allowDownload ? 'left-4' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Encryption Badge */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[#141419] border border-[#24242B] text-[10.5px] text-[#A1A1AA]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6E60EE] shrink-0" />
                    <span>End-to-end encrypted link</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#24242B] bg-[#0D0D10] text-xs">
                <p className="text-[11px] text-[#71717A] hidden sm:inline">
                  Anyone with the link and passcode can view
                </p>
                <button
                  type="button"
                  className="ml-auto inline-flex items-center justify-center rounded-full bg-[#6E60EE] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#5F52DE] shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </LandingContainer>
    </section>
  )
}

