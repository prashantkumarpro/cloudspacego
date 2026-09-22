'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'

export interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  itemType?: 'file' | 'folder'
  isPermanent?: boolean
  onConfirm: () => Promise<void> | void
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  itemName,
  itemType = 'file',
  isPermanent = true,
  onConfirm
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false)
      setError('')
    }
  }, [isOpen])

  const handleClose = () => {
    if (isDeleting) return
    setError('')
    onClose()
  }

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      setError('')
      await onConfirm()
      handleClose()
    } catch (err) {
      console.error('Failed to delete:', err)
      setError(`Failed to delete ${itemType}. Please try again.`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
    >
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
            {isPermanent ? (
              <AlertTriangle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            ) : (
              <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight leading-snug break-words">
              Delete &ldquo;{itemName}&rdquo;?
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
              {isPermanent
                ? `Are you sure you want to permanently delete this ${itemType}? This action cannot be undone.`
                : `This item will be moved to Trash.`}
            </p>
            {error && (
              <p className="text-xs text-rose-500 font-medium mt-1.5">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-card-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isDeleting}
            className="h-8.5 px-3.5 text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-input-bg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="h-8.5 px-3.5 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting
              ? 'Deleting...'
              : isPermanent
              ? 'Delete Forever'
              : 'Move to Trash'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

