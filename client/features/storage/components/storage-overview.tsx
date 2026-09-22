'use client';

import React from 'react';
import { useApp } from '../../../providers/app-provider';
import { formatBytes } from '../../../lib/utils/format';
import { cn } from '../../../lib/utils/cn';

export function StorageOverview() {
  const { storageStats } = useApp();

  const percentageUsed = Math.round((storageStats.totalUsed / storageStats.totalCapacity) * 100);

  const categories = [
    {
      name: 'Documents',
      size: storageStats.documents,
      color: 'bg-[#0056f7] dark:bg-blue-600',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Images',
      size: storageStats.images,
      color: 'bg-emerald-500 dark:bg-emerald-600',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a1 1 0 011.414 0L16 17m0 0l1-1m-1 1k-3-3m-3 3h12m7-9a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Videos',
      size: storageStats.videos,
      color: 'bg-purple-500 dark:bg-purple-600',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Other',
      size: storageStats.other,
      color: 'bg-gray-400 dark:bg-gray-500',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-6 text-foreground flex flex-col justify-between shadow-sm transition-colors duration-200">
      <div className="flex flex-col gap-4">
        {/* Title & Stats */}
        <div className="flex flex-col gap-2.5 select-none">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <span>Storage Overview</span>
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              {formatBytes(storageStats.totalUsed, 0)}
            </span>
            <span className="text-sm font-light text-text-secondary">
              of {formatBytes(storageStats.totalCapacity, 0)} used
            </span>
            <span className="ml-auto text-sm font-extrabold tracking-wide text-[#0056f7]">
              {percentageUsed}%
            </span>
          </div>
        </div>

        {/* Large Progress Bar */}
        <div className="w-full bg-divider h-2.5 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[#0056f7] to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        {/* Free space metadata */}
        <span className="text-xs font-light text-text-secondary select-none">
          {formatBytes(storageStats.totalCapacity - storageStats.totalUsed, 0)} free
        </span>
      </div>

      {/* Categories Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-divider">
        {categories.map(cat => (
          <div
            key={cat.name}
            className="bg-background border border-card-border rounded-xl p-4 flex items-center gap-3.5 transition-all hover:shadow-sm"
          >
            {/* Category Icon */}
            <div className={cn("w-9 h-9 flex items-center justify-center shrink-0 rounded-lg shadow-sm", cat.color)}>
              {cat.icon}
            </div>
            <div className="flex flex-col select-none min-w-0">
              <span className="text-[10px] font-bold text-text-muted truncate">
                {cat.name}
              </span>
              <span className="text-xs font-extrabold text-foreground mt-0.5">
                {formatBytes(cat.size, 0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
