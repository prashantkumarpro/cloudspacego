'use client'

import React from 'react'

export default function WelcomeBanner() {
  return (
    <div className='flex flex-col gap-4 w-full shrink-0 select-none'>
      {/* Welcome Greeting Banner Card */}
      <div className='relative bg-gradient-to-r from-blue-50/40 to-indigo-50/20 dark:from-blue-950/10 dark:to-indigo-950/5 border border-blue-100/40 dark:border-blue-950/10 p-4 rounded-lg flex flex-row items-center justify-between overflow-hidden shadow-none min-h-[64px]'>

        {/* Subtle cloud/file background illustration on the right */}
        <div className='absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-15 dark:opacity-25 pointer-events-none z-0'>
          {/* Cloud SVG */}
          <svg className='w-8 h-8 text-[#0056f7] dark:text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z' />
          </svg>
          {/* File SVG */}
          <svg className='w-7 h-7 text-[#0056f7] dark:text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' />
          </svg>
        </div>

        {/* Content text block */}
        <div className='flex flex-col gap-0.5 relative z-10'>
          <h2 className='text-sm md:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1'>
            <span>Welcome back, Prashant!</span>
            <span className='shrink-0' role="img" aria-label="wave">👋</span>
          </h2>
          <p className='text-xs text-slate-500 dark:text-zinc-400 font-normal mt-0.5'>
            <span className='font-semibold text-[#0056f7] dark:text-blue-400'>3</span> new files today &middot; Last active: <span className='font-semibold text-slate-700 dark:text-zinc-350'>Design Assets</span>
          </p>
        </div>
      </div>
      {/* Spacing Divider */}
      <div className='h-[1px] bg-slate-200/50 dark:bg-zinc-800/40' />
    </div>
  )
}
