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
    <section id="sharing" className="relative py-20 sm:py-24 lg:py-28 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.12]">
            Share what matters.
          </h2>

          <p className="mt-3.5 sm:mt-4 text-base sm:text-lg font-normal leading-relaxed text-[#A1A1AA]">
            Collaborate on individual assets or entire project folders. Manage who can view,
            edit, or comment, and enforce password protection and automatic link expiry.
          </p>
        </div>

        {/* CloudSpaceGo Share Modal Interface */}
        <div className="mt-10 sm:mt-12 lg:mt-14 w-full rounded-2xl border border-[#24242B] bg-[#101014] overflow-hidden">
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
                    className="w-full rounded-xl border border-[#24242B] bg-[#141419] py-2 pl-10 pr-3 text-xs font-mono text-[#A1A1AA] select-all focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#6E60EE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5F52DE] transition-colors cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2-Column Grid: Security Controls & Collaborator List */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Link Security Controls */}
            <div className="p-5 sm:p-6 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#24242B] bg-[#0A0A0C] flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A] block mb-4">
                  Access & Security
                </span>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-[#24242B] bg-[#141419] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-[#6E60EE]" />
                      <div>
                        <p className="text-xs font-semibold text-[#F5F5F7]">Password Required</p>
                        <p className="text-[10px] text-[#71717A]">Passcode: ••••••••</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequirePassword(!requirePassword)}
                      aria-label="Toggle password protection"
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                        requirePassword ? 'bg-[#6E60EE]' : 'bg-[#24242B]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          requirePassword ? 'left-4.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#24242B] bg-[#141419] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#6E60EE]" />
                      <div>
                        <p className="text-xs font-semibold text-[#F5F5F7]">Link Expiration</p>
                        <p className="text-[10px] text-[#71717A]">Auto-expires in {expiresInDays}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-[#6E60EE] bg-[#1D1935] border border-[#24242B] px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#24242B]">
                <p className="text-[11px] text-[#71717A] leading-relaxed">
                  Anyone with the link and passcode will be able to access the shared files until expiration.
                </p>
              </div>
            </div>

            {/* Right Column: Collaborator List */}
            <div className="p-5 sm:p-6 lg:col-span-7 bg-[#101014] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                  Collaborators ({collaborators.length})
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#6E60EE] hover:text-[#5F52DE] cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite by email</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#24242B] bg-[#141419] hover:bg-[#101014] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full ${c.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                      >
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#F5F5F7] truncate">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-[#71717A] truncate">
                          {c.email}
                        </p>
                      </div>
                    </div>

                    {/* Role Tag / Selector */}
                    <div>
                      {c.role === 'Owner' ? (
                        <span className="text-xs font-semibold text-[#A1A1AA] bg-[#101014] border border-[#24242B] px-2.5 py-1 rounded-lg">
                          Owner
                        </span>
                      ) : (
                        <select
                          value={c.role}
                          onChange={(e) => handleRoleChange(c.id, e.target.value as Collaborator['role'])}
                          aria-label={`Permission role for ${c.name}`}
                          className="text-xs font-medium text-[#6E60EE] bg-[#1D1935] border border-[#24242B] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#6E60EE] cursor-pointer"
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
      </LandingContainer>
    </section>
  )
}

