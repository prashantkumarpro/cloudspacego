'use client'

import React, { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Bell, HardDrive, FileText, Share2, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type NotificationType = 'share' | 'storage' | 'upload' | 'system'

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  time: string
  createdAt?: string
  unread: boolean
}

export interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
  initialNotifications?: NotificationItem[]
}

const DEFAULT_MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'share',
    title: 'New shared file',
    message: 'Prashant shared "Q3 Financial Review.pdf" with you',
    time: '10 minutes ago',
    createdAt: '2026-09-08T07:00:00Z',
    unread: true,
  },
  {
    id: 'notif-2',
    type: 'storage',
    title: 'Storage alert',
    message: "You're using 72% of your cloud storage",
    time: '2 hours ago',
    createdAt: '2026-09-08T05:10:00Z',
    unread: true,
  },
  {
    id: 'notif-3',
    type: 'upload',
    title: 'Upload completed',
    message: 'Brand Guidelines 2026.zip was uploaded successfully',
    time: '1 day ago',
    createdAt: '2026-09-07T12:00:00Z',
    unread: false,
  },
]

function renderNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'share':
      return (
        <div className="w-8 h-8 rounded-full bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0">
          <Share2 className="w-4 h-4" />
        </div>
      )
    case 'storage':
      return (
        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <HardDrive className="w-4 h-4" />
        </div>
      )
    case 'upload':
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </div>
      )
    case 'system':
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-input-bg text-text-secondary border border-card-border/60 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4" />
        </div>
      )
  }
}

export function NotificationsModal({
  isOpen,
  onClose,
  isLoading = false,
  initialNotifications = DEFAULT_MOCK_NOTIFICATIONS,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)

  const unreadCount = notifications.filter(n => n.unread).length

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, unread: false })))
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      size="md"
    >
      <div className="flex flex-col gap-3">
        {/* Notification List Container with subtle warm off-white background */}
        <div className="flex flex-col gap-1.5 p-1.5 bg-[#FAF9F7] dark:bg-background border border-card-border rounded-xl max-h-80 overflow-y-auto">
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="flex flex-col gap-1.5">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 sm:p-3.5 bg-card-bg border border-card-border/50 rounded-lg animate-pulse"
                >
                  <div className="w-8 h-8 rounded-full bg-input-bg shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3 bg-input-bg rounded w-1/3" />
                    <div className="h-3 bg-input-bg rounded w-4/5" />
                    <div className="h-2 bg-input-bg rounded w-1/4 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            /* Empty State */
            <div className="py-10 px-4 flex flex-col items-center justify-center text-center bg-card-bg border border-card-border/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-input-bg border border-card-border/60 flex items-center justify-center text-text-muted mb-2.5">
                <Bell className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-foreground">No notifications</p>
              <p className="text-[11px] text-text-secondary mt-0.5 max-w-[220px] leading-normal">
                You&apos;re all caught up! New workspace alerts will appear here.
              </p>
            </div>
          ) : (
            /* Data-driven notification rows on clean white cards */
            notifications.map(item => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-3 p-3 sm:p-3.5 rounded-lg border transition-all duration-150 cursor-default select-none',
                  item.unread
                    ? 'bg-card-bg border-card-border/80 shadow-xs hover:border-[#6E60EE]/30'
                    : 'bg-card-bg/95 border-card-border/50 hover:bg-card-bg hover:border-card-border'
                )}
              >
                {renderNotificationIcon(item.type)}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {item.title}
                    </span>
                    {item.unread && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#6E60EE] shrink-0"
                        aria-label="Unread"
                      />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[11px] text-text-muted mt-1 font-normal">
                    {item.time}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Action: Subtle Mark All as Read */}
        <div className="flex items-center justify-between pt-2 border-t border-card-border/60">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isLoading}
            className={cn(
              'text-xs font-medium transition-colors flex items-center gap-1.5 py-1 px-2 -ml-2 rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-[#6E60EE]/50',
              unreadCount > 0 && !isLoading
                ? 'text-text-secondary hover:text-[#6E60EE] hover:bg-[#6E60EE]/10 cursor-pointer'
                : 'text-text-muted opacity-50 cursor-default'
            )}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        </div>
      </div>
    </Dialog>
  )
}
