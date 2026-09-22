'use client'

import React from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useApp } from '@/providers/app-provider'
import { formatDate } from '@/lib/utils/format'
import { Activity, Upload, Share2, FolderPlus, Star, Trash2, RotateCcw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface ActivityLogModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ActivityLogModal({ isOpen, onClose }: ActivityLogModalProps) {
  const { activities } = useApp()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Upload className="w-3.5 h-3.5" />
          </div>
        )
      case 'share':
        return (
          <div className="w-7 h-7 rounded-full bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0">
            <Share2 className="w-3.5 h-3.5" />
          </div>
        )
      case 'create_folder':
        return (
          <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <FolderPlus className="w-3.5 h-3.5" />
          </div>
        )
      case 'star':
        return (
          <div className="w-7 h-7 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
            <Star className="w-3.5 h-3.5" />
          </div>
        )
      case 'delete':
        return (
          <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </div>
        )
      case 'restore':
        return (
          <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <RotateCcw className="w-3.5 h-3.5" />
          </div>
        )
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-input-bg text-text-secondary flex items-center justify-center shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
        )
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Log"
      description="Recent workspace actions and events"
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col divide-y divide-card-border/50 max-h-80 overflow-y-auto pr-1 border border-card-border rounded-xl p-1 bg-card-bg">
          {activities.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-secondary">
              No recent activity recorded.
            </div>
          ) : (
            activities.map(act => (
              <div key={act.id} className="flex items-center gap-3 p-3 hover:bg-input-bg/50 transition-colors rounded-lg">
                {getActivityIcon(act.type)}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {act.details || act.assetName}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
                    <span>{act.user}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-text-muted" />
                      {formatDate(act.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end pt-2 border-t border-card-border/60">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
