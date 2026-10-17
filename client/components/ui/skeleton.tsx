'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse bg-input-bg rounded-md', className)}
      {...props}
    />
  )
}

/**
 * FolderCardSkeleton
 * Closely matches FolderCard in size, padding, border radius, icon size, typography, and action menu.
 * Fully responsive across mobile (2-column grid), tablet, and desktop.
 */
export function FolderCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-2.5 xs:p-3 sm:p-3.5 bg-card-bg rounded-xl border border-card-border shadow-xs select-none min-w-0 animate-pulse',
        className
      )}
      aria-hidden='true'
    >
      <div className='flex items-center gap-2 xs:gap-2.5 sm:gap-3 min-w-0 flex-1 pr-1 xs:pr-2'>
        <div className='w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-input-bg border border-card-border/60 shrink-0' />
        <div className='flex flex-col min-w-0 flex-1 gap-1.5'>
          <div className='h-3.5 sm:h-4 bg-input-bg rounded w-3/4 max-w-[120px]' />
          <div className='h-2.5 sm:h-3 bg-input-bg/70 rounded w-1/2 max-w-[80px]' />
        </div>
      </div>
      <div className='flex items-center gap-1 shrink-0 -mr-0.5 xs:-mr-1'>
        <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-input-bg/50 border border-card-border/40 shrink-0' />
      </div>
    </div>
  )
}

/**
 * FileCardSkeleton
 * Closely matches FileCard and FileThumbnail (variant='card'):
 * Preserves 16:10 aspect ratio thumbnail, filename line, metadata line, and action menu button.
 */
export function FileCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-card-bg rounded-xl border border-card-border shadow-xs p-2.5 sm:p-3 flex flex-col gap-2.5 select-none min-w-0 animate-pulse',
        className
      )}
      aria-hidden='true'
    >
      {/* 16:10 Thumbnail aspect ratio matching FileThumbnail */}
      <div className='w-full aspect-[16/10] bg-input-bg/70 border border-card-border/60 rounded-lg shrink-0 flex items-center justify-center overflow-hidden'>
        <div className='w-10 h-10 rounded-xl bg-card-bg/40 border border-card-border/40 shrink-0' />
      </div>

      {/* File Info + Actions Row */}
      <div className='flex items-center justify-between gap-1.5 w-full min-w-0 pt-0.5'>
        <div className='flex flex-col min-w-0 flex-1 text-left gap-1'>
          <div className='h-3.5 sm:h-4 bg-input-bg rounded w-3/4 max-w-[140px]' />
          <div className='h-2.5 sm:h-3 bg-input-bg/70 rounded w-1/2 max-w-[90px] mt-0.5' />
        </div>

        <div className='flex items-center gap-1 shrink-0 -mr-1'>
          <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-input-bg/50 border border-card-border/40 shrink-0' />
        </div>
      </div>
    </div>
  )
}

/**
 * FileTableRowSkeleton
 * Closely matches a single row in FileTable:
 * 36x36px thumbnail icon, title + mobile subline, owner, date, size, and action button.
 */
export function FileTableRowSkeleton({
  showOwner = true,
  showDate = true,
  showSize = true,
  className
}: {
  showOwner?: boolean
  showDate?: boolean
  showSize?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 sm:px-4 h-[54px] min-h-[52px] max-h-[58px] min-w-0 select-none animate-pulse',
        className
      )}
      aria-hidden='true'
    >
      {/* Name Column: Thumbnail + Filename + mobile subline */}
      <div className='flex items-center gap-3.5 min-w-0 flex-1 pr-4 sm:pr-6'>
        <div className='w-9 h-9 rounded-lg bg-input-bg border border-card-border/60 shrink-0' />
        <div className='flex flex-col min-w-0 flex-1 justify-center gap-1'>
          <div className='h-3.5 bg-input-bg rounded w-3/5 max-w-[200px]' />
          {/* Mobile compact details subline */}
          <div className='flex items-center gap-1.5 sm:hidden'>
            <div className='h-2.5 bg-input-bg/70 rounded w-28' />
          </div>
        </div>
      </div>

      {/* Owner Column */}
      {showOwner && (
        <div className='hidden md:flex w-24 lg:w-32 pr-4 items-center shrink-0'>
          <div className='h-3 bg-input-bg/80 rounded w-12' />
        </div>
      )}

      {/* Date modified Column */}
      {showDate && (
        <div className='hidden sm:flex w-32 lg:w-44 pr-4 items-center shrink-0'>
          <div className='h-3 bg-input-bg/80 rounded w-20' />
        </div>
      )}

      {/* File size Column */}
      {showSize && (
        <div className='hidden sm:flex w-20 lg:w-28 pr-4 items-center justify-end shrink-0'>
          <div className='h-3 bg-input-bg/80 rounded w-14' />
        </div>
      )}

      {/* Actions Column */}
      <div className='w-20 pr-1 sm:pr-2 flex items-center justify-end gap-1 shrink-0'>
        <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-input-bg/50 border border-card-border/40 shrink-0' />
      </div>
    </div>
  )
}

/**
 * FileTableSkeleton
 * Closely matches FileTable layout:
 * Preserves header column labels, widths, row height (54px), and responsive column visibility.
 */
export function FileTableSkeleton({
  showHeader = true,
  count = 6,
  dateLabel,
  showOwner = true,
  showDate = true,
  showSize = true,
  className
}: {
  showHeader?: boolean
  count?: number
  dateLabel?: string
  showOwner?: boolean
  showDate?: boolean
  showSize?: boolean
  className?: string
}) {
  return (
    <div
      className={cn('w-full flex flex-col select-none border-b border-card-border/50', className)}
      aria-hidden='true'
    >
      {/* Table Header skeleton matching real FileTable header */}
      {showHeader && (
        <div className='flex items-center justify-between px-3 sm:px-4 py-2.5 text-xs font-semibold text-text-secondary border-b border-card-border select-none bg-background/50'>
          <div className='flex-1 min-w-0 pr-4 sm:pr-6 flex items-center gap-1.5'>
            <div className='h-3.5 bg-input-bg rounded w-16' />
          </div>
          {showOwner && (
            <div className='hidden md:flex w-24 lg:w-32 pr-4 items-center shrink-0'>
              <div className='h-3 bg-input-bg rounded w-14' />
            </div>
          )}
          {showDate && (
            <div className='hidden sm:flex w-32 lg:w-44 pr-4 items-center shrink-0'>
              <div className='h-3 bg-input-bg rounded w-20' />
            </div>
          )}
          {showSize && (
            <div className='hidden sm:flex w-20 lg:w-28 pr-4 items-center justify-end shrink-0'>
              <div className='h-3 bg-input-bg rounded w-14' />
            </div>
          )}
          <div className='w-20 pr-1 sm:pr-2 flex items-center justify-end shrink-0'>
            <div className='h-3 bg-input-bg rounded w-12 hidden sm:block' />
          </div>
        </div>
      )}

      {/* Table Rows skeleton */}
      <div className='flex flex-col divide-y divide-card-border/40'>
        {Array.from({ length: count }).map((_, i) => (
          <FileTableRowSkeleton
            key={`table-skeleton-row-${i}`}
            showOwner={showOwner}
            showDate={showDate}
            showSize={showSize}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * ContinueCardSkeleton
 * Closely matches the Dashboard "Continue where you left off" row banner.
 */
export function ContinueCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full md:w-[560px] md:max-w-[600px] mt-3.5 bg-card-bg/60 border border-card-border rounded-xl px-3.5 sm:px-4 py-2.5 flex items-center justify-between select-none text-xs shadow-xs animate-pulse',
        className
      )}
      aria-hidden='true'
    >
      <div className='flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-2'>
        <div className='w-7 h-7 rounded-lg bg-input-bg border border-card-border/60 shrink-0' />
        <div className='h-3 bg-input-bg rounded w-16 shrink-0 hidden xs:block' />
        <div className='h-3.5 bg-input-bg rounded w-32 sm:w-44' />
      </div>
      <div className='flex items-center gap-1.5 shrink-0 ml-2'>
        <div className='h-3 bg-input-bg rounded w-20 hidden xs:block' />
        <div className='w-3.5 h-3.5 rounded bg-input-bg shrink-0' />
      </div>
    </div>
  )
}
