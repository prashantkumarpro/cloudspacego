'use client'

import React from 'react'
import { Dialog, DialogProps, DialogSize } from './dialog'

export interface ModalProps {
  open?: boolean
  isOpen?: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  size?: DialogSize
  maxWidth?: string
  headerDivider?: boolean
  icon?: React.ReactNode
}

export function Modal({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
  size = 'md',
  maxWidth,
  headerDivider = false,
  icon
}: ModalProps) {
  const active = Boolean(open ?? isOpen)

  return (
    <Dialog
      isOpen={active}
      onClose={onClose}
      title={title}
      description={description}
      className={className}
      showCloseButton={showCloseButton}
      size={size}
      maxWidth={maxWidth}
      headerDivider={headerDivider}
      icon={icon}
    >
      {children}
    </Dialog>
  )
}
