'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../providers/app-provider';
import { useToast } from '../../../providers/toast-provider';
import { useDirectory, isFolderCreating } from '../hooks/use-directory';
import { Dialog } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export function CreateFolderModal() {
  const { activeModal, setActiveModal, activeFolderId } = useApp();
  const { create } = useDirectory(activeFolderId ?? undefined);
  const toast = useToast();
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = activeModal === 'create-folder';

  // Auto-focus the input field whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setFolderName('');
        setError('');
        setIsSubmitting(false);
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setFolderName('');
    setError('');
    setIsSubmitting(false);
    setActiveModal(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = folderName.trim();
    if (!trimmed) {
      setError('Please enter a folder name');
      inputRef.current?.focus();
      return;
    }

    // Check if folder creation is already in-flight for this name and directory
    if (isFolderCreating(activeFolderId ?? undefined, trimmed)) {
      setError('A folder with this name is currently being created');
      return;
    }

    // Prevent duplicate submissions
    setIsSubmitting(true);

    // Optimistically close modal immediately so UI does not wait
    handleClose();

    // Send create-folder API request in the background
    create({ dirname: trimmed }, activeFolderId ?? undefined)
      .then(() => {
        toast.success('Folder created', `Folder "${trimmed}" was created.`);
      })
      .catch((err) => {
        console.error('Failed to create folder:', err);
        toast.error(
          'Failed to create folder',
          `Could not create folder "${trimmed}". Please try again.`
        );
      });
  };

  const isSubmitDisabled = !folderName.trim() || isSubmitting;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="New Folder"
      size="sm"
    >
      <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
        <Input
          ref={inputRef}
          label="Folder Name"
          placeholder="Enter folder name"
          value={folderName}
          onChange={(e) => {
            setFolderName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoComplete="off"
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-card-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8.5 px-3.5 text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-input-bg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitDisabled}
            className="h-8.5 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
