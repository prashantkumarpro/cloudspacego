'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  initialName: string
  itemType?: 'file' | 'folder'
  onRename: (newName: string) => Promise<void> | void
}

export function RenameModal({
  isOpen,
  onClose,
  initialName,
  itemType = 'file',
  onRename
}: RenameModalProps) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setError('')
      setIsSubmitting(false)

      // Auto-focus and select all text in the input
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen, initialName])

  const handleClose = () => {
    if (isSubmitting) return
    setError('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()

    if (!trimmed) {
      setError(`Please enter a ${itemType} name`)
      inputRef.current?.focus()
      return
    }

    if (trimmed === initialName.trim()) {
      handleClose()
      return
    }

    try {
      setIsSubmitting(true)
      await onRename(trimmed)
      handleClose()
    } catch (err) {
      console.error('Failed to rename:', err)
      setError(`Failed to rename ${itemType}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSaveDisabled = !name.trim() || isSubmitting

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Rename"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          ref={inputRef}
          label={`New ${itemType} name`}
          placeholder={`Enter ${itemType} name`}
          value={name}
          onChange={e => {
            setName(e.target.value)
            if (error) setError('')
          }}
          error={error}
          autoComplete="off"
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-card-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-8.5 px-3.5 text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-input-bg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSaveDisabled}
            className="h-8.5 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Renaming...' : 'Rename'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
