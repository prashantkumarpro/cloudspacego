'use client'

import React, { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useApp } from '@/providers/app-provider'
import { formatBytes } from '@/lib/utils/format'
import { HardDrive, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface StorageUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StorageUpgradeModal({ isOpen, onClose }: StorageUpgradeModalProps) {
  const { storageStats } = useApp()
  const [selectedTier, setSelectedTier] = useState<'pro' | 'business'>('pro')
  const [isUpgraded, setIsUpgraded] = useState(false)

  const percentageUsed = storageStats.totalCapacity > 0
    ? Math.min(100, Math.round((storageStats.totalUsed / storageStats.totalCapacity) * 100))
    : 0
  const freeSpaceFormatted = formatBytes(Math.max(0, storageStats.totalCapacity - storageStats.totalUsed))
  const usedSpaceFormatted = formatBytes(storageStats.totalUsed)
  const totalCapacityFormatted = formatBytes(storageStats.totalCapacity)

  const handleUpgrade = () => {
    setIsUpgraded(true)
    setTimeout(() => {
      setIsUpgraded(false)
      onClose()
    }, 1800)
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Storage & Plans"
      description="Upgrade your cloud storage for more space and premium features"
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Current Storage Meter */}
        <div className="p-3.5 bg-input-bg/60 border border-card-border rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#6E60EE]" />
              <span className="text-xs font-semibold text-foreground">Current Usage</span>
            </div>
            <span className="text-xs font-bold text-[#6E60EE]">{percentageUsed}% used</span>
          </div>
          <div className="w-full h-2 bg-input-bg rounded-full overflow-hidden border border-card-border/60">
            <div className="h-full bg-[#6E60EE] rounded-full" style={{ width: `${Math.max(percentageUsed, percentageUsed > 0 ? 3 : 0)}%` }} />
          </div>
          <span className="text-[11px] text-text-secondary">
            {usedSpaceFormatted} of {totalCapacityFormatted} total storage used &bull; {freeSpaceFormatted} remaining
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Pro Tier */}
          <div
            onClick={() => setSelectedTier('pro')}
            className={cn(
              "p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between relative",
              selectedTier === 'pro'
                ? "bg-[#6E60EE]/5 border-[#6E60EE] shadow-xs"
                : "bg-card-bg border-card-border hover:border-card-border/80"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">Pro 200 GB</span>
              <span className="text-[10px] font-bold text-white bg-[#6E60EE] px-1.5 py-0.5 rounded-full">
                Popular
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-lg font-bold text-foreground">$2.99</span>
              <span className="text-[10px] text-text-secondary">/month</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-snug mt-1">
              200 GB cloud space, 30-day trash recovery, file versioning.
            </p>
          </div>

          {/* Business Tier */}
          <div
            onClick={() => setSelectedTier('business')}
            className={cn(
              "p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between relative",
              selectedTier === 'business'
                ? "bg-[#6E60EE]/5 border-[#6E60EE] shadow-xs"
                : "bg-card-bg border-card-border hover:border-card-border/80"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">Ultra 2 TB</span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-lg font-bold text-foreground">$9.99</span>
              <span className="text-[10px] text-text-secondary">/month</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-snug mt-1">
              2 TB storage, priority sync, team collaboration & sharing.
            </p>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-input-bg/40 border border-card-border/60">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Check className="w-3.5 h-3.5 text-[#6E60EE] shrink-0" />
            <span>End-to-end client-side encryption</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Check className="w-3.5 h-3.5 text-[#6E60EE] shrink-0" />
            <span>High speed ultra-bandwidth uploads</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Check className="w-3.5 h-3.5 text-[#6E60EE] shrink-0" />
            <span>Dedicated priority customer support</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-card-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-input-bg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleUpgrade}
            disabled={isUpgraded}
            className="h-9 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs"
          >
            {isUpgraded ? 'Upgrade Activated!' : `Upgrade to ${selectedTier === 'pro' ? 'Pro 200GB' : 'Ultra 2TB'}`}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
