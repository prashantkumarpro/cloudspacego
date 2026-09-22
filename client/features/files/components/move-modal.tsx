'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useApp } from '@/providers/app-provider'
import { UnifiedFileItem } from './file-list'
import { Folder, FolderInput, Check, HardDrive, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface MoveModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  itemId?: string
  itemType?: 'file' | 'folder'
  currentFolderId?: string | null
  onMove?: (targetFolderId: string | null) => Promise<void> | void
}

export function MoveModal({
  isOpen,
  onClose,
  itemName,
  itemId,
  itemType = 'file',
  currentFolderId = null,
  onMove
}: MoveModalProps) {
  const { files } = useApp()
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [error, setError] = useState('')

  // Filter available destination folders (exclude the item itself if it's a folder)
  const availableFolders = React.useMemo(() => {
    return (files as UnifiedFileItem[]).filter(
      f =>
        !f.deleted &&
        f.type === 'folder' &&
        (f.id || f._id) !== itemId
    )
  }, [files, itemId])

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(null)
      setIsMoving(false)
      setError('')
    }
  }, [isOpen])

  const handleClose = () => {
    if (isMoving) return
    setError('')
    onClose()
  }

  const handleConfirmMove = async () => {
    try {
      setIsMoving(true)
      setError('')
      if (onMove) {
        await onMove(selectedFolderId)
      }
      handleClose()
    } catch (err) {
      console.error('Failed to move item:', err)
      setError('Failed to move item. Please try again.')
    } finally {
      setIsMoving(false)
    }
  }

  const isCurrentLocation = selectedFolderId === currentFolderId

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Move to"
      description={`Select a destination for "${itemName}"`}
      size="md"
    >
      <div className="flex flex-col gap-3.5">
        {/* Selected Item Summary */}
        <div className="flex items-center gap-2.5 p-2 bg-input-bg/60 border border-card-border rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0">
            <FolderInput className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-foreground truncate" title={itemName}>
              {itemName}
            </span>
            <span className="text-[10px] text-text-secondary">
              Moving {itemType}
            </span>
          </div>
        </div>

        {/* Destination Folders List */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-text-secondary select-none">
            Choose Destination
          </span>

          <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1 border border-card-border rounded-xl p-1 bg-card-bg">
            {/* Root: My Files */}
            <div
              onClick={() => setSelectedFolderId(null)}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-150 select-none",
                selectedFolderId === null
                  ? "bg-[#6E60EE]/10 text-[#6E60EE] font-semibold border border-[#6E60EE]/30"
                  : "hover:bg-input-bg text-foreground border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <HardDrive className={cn("w-4 h-4 shrink-0", selectedFolderId === null ? "text-[#6E60EE]" : "text-text-secondary")} />
                <span className="text-xs truncate">
                  My Files (Root)
                </span>
              </div>
              {selectedFolderId === null && (
                <Check className="w-3.5 h-3.5 text-[#6E60EE] shrink-0" />
              )}
            </div>

            {/* Folder Items */}
            {availableFolders.map(folder => {
              const fId = folder.id || folder._id || ''
              const isSelected = selectedFolderId === fId

              return (
                <div
                  key={fId}
                  onClick={() => setSelectedFolderId(fId)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-150 select-none",
                    isSelected
                      ? "bg-[#6E60EE]/10 text-[#6E60EE] font-semibold border border-[#6E60EE]/30"
                      : "hover:bg-input-bg text-foreground border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder className={cn("w-4 h-4 shrink-0", isSelected ? "text-[#6E60EE]" : "text-[#6E60EE]/70")} />
                    <span className="text-xs truncate">
                      {folder.name}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#6E60EE] shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-medium">
            {error}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-card-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isMoving}
            className="h-8.5 px-3.5 text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-input-bg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirmMove}
            disabled={isMoving || isCurrentLocation}
            className="h-8.5 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs disabled:opacity-50"
          >
            {isMoving ? 'Moving...' : 'Move here'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
