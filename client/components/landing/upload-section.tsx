'use client'

import React, { useState, useEffect } from 'react'
import {
  UploadCloud,
  CheckCircle2,
  X,
  Pause,
  Play,
  FileArchive,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'

export function UploadSection() {
  const [projectProgress, setProjectProgress] = useState(86)
  const [imagesProgress, setImagesProgress] = useState(34)
  const [isPaused, setIsPaused] = useState(false)

  // Smooth live progress animation
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProjectProgress(prev => {
        if (prev >= 100) return 86 // loop subtly
        return prev + 1
      })

      setImagesProgress(prev => {
        if (prev >= 100) return 34 // loop subtly
        return prev + 2
      })
    }, 400)

    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <section id="uploads" className="relative py-10 sm:py-14 lg:py-16 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.15]">
            Your uploads, always within reach.
          </h2>

          <p className="mt-2 sm:mt-2.5 max-w-xl text-sm sm:text-base font-normal leading-relaxed text-[#A1A1AA]">
            Upload files and folders smoothly. CloudSpaceGo keeps you informed with real-time progress, pause and resume controls, and reliable background transfers.
          </p>
        </div>

        {/* CloudSpaceGo Upload Manager UI */}
        <div className="mt-5 sm:mt-6 w-full rounded-2xl border border-[#24242B] bg-[#101014] overflow-hidden">
          {/* Manager Header Bar */}
          <div className="flex items-center justify-between border-b border-[#24242B] px-5 sm:px-6 py-4 bg-[#0D0D10]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#141419] border border-[#24242B] flex items-center justify-center">
                <UploadCloud className="w-4 h-4 text-[#6E60EE]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F5F5F7]">
                  Upload Manager
                </h3>
                <p className="text-[11px] text-[#71717A]">
                  2 uploading · 1 completed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#24242B] bg-[#141419] px-2.5 py-1 text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-[#101014] transition-colors cursor-pointer"
              >
                {isPaused ? <Play className="w-3 h-3 text-[#6E60EE]" /> : <Pause className="w-3 h-3 text-[#71717A]" />}
                <span>{isPaused ? 'Resume All' : 'Pause All'}</span>
              </button>
            </div>
          </div>

          {/* Upload Items List */}
          <div className="p-4 sm:p-5 space-y-2.5 bg-[#101014]">
            {/* Item 1: project.zip */}
            <div className="p-3 rounded-xl border border-[#24242B] bg-[#141419]">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#101014] border border-[#24242B] flex items-center justify-center shrink-0">
                    <FileArchive className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#F5F5F7] truncate">
                      project_source_master.zip
                    </p>
                    <p className="text-[10px] text-[#71717A]">
                      1.2 GB of 1.4 GB
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-[#6E60EE]">
                  {projectProgress}%
                </span>
              </div>

              <div className="w-full bg-[#101014] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#6E60EE] h-full rounded-full transition-all duration-300"
                  style={{ width: `${projectProgress}%` }}
                />
              </div>
            </div>

            {/* Item 2: presentation.pdf */}
            <div className="p-3 rounded-xl border border-[#24242B] bg-[#141419]">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#101014] border border-[#24242B] flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#F5F5F7] truncate">
                      presentation_deck_final.pdf
                    </p>
                    <p className="text-[10px] text-emerald-400/80">
                      18.4 MB · Upload complete
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Done</span>
                </div>
              </div>

              <div className="w-full bg-[#101014] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-full" />
              </div>
            </div>

            {/* Item 3: images.zip */}
            <div className="p-3 rounded-xl border border-[#24242B] bg-[#141419]">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#101014] border border-[#24242B] flex items-center justify-center shrink-0">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#F5F5F7] truncate">
                      brand_photography_raw.zip
                    </p>
                    <p className="text-[10px] text-[#71717A]">
                      420 MB of 1.2 GB
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-[#6E60EE]">
                  {imagesProgress}%
                </span>
              </div>

              <div className="w-full bg-[#101014] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#6E60EE] h-full rounded-full transition-all duration-300"
                  style={{ width: `${imagesProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </LandingContainer>
    </section>
  )
}

