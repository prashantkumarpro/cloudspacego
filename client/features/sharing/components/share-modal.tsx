'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../providers/app-provider';
import { Dialog } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Share2, Link as LinkIcon, Check, User, Users, Globe } from 'lucide-react';

export function ShareModal() {
  const { activeModal, setActiveModal, selectedFileId, files, shareFile } = useApp();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Viewer' | 'Editor'>('Viewer');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const isOpen = activeModal === 'share';
  const selectedFile = files.find(f => f.id === selectedFileId);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setError('');
      setSuccessMessage('');
      setCopied(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccessMessage('');
    setCopied(false);
    setActiveModal(null);
  };

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email address is required');
      return;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    if (selectedFileId) {
      shareFile(selectedFileId, [trimmed]);
      setSuccessMessage(`Access granted to ${trimmed}`);
      setEmail('');
      setError('');
    }
  };

  const handleCopyLink = () => {
    const shareUrl = selectedFile
      ? `https://cloudspacego.app/s/${selectedFile.id}`
      : 'https://cloudspacego.app/s/unknown';

    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Share"
      description="Manage access and collaborate with others"
      size="md"
    >
      <div className="flex flex-col gap-3.5">
        {/* Selected Resource Card */}
        {selectedFile && (
          <div className="flex items-center gap-2.5 p-2.5 bg-input-bg/60 border border-card-border rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-foreground truncate" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-text-secondary">
                Owner: {selectedFile.owner || 'You'}
              </span>
            </div>
          </div>
        )}

        {/* Success Feedback Alert */}
        {successMessage && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleShare} className="flex flex-col gap-2.5">
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <Input
                label="Add people or groups"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                  if (successMessage) setSuccessMessage('');
                }}
                error={error}
                autoFocus
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'Viewer' | 'Editor')}
              className="h-9.5 bg-input-bg border border-card-border text-foreground text-xs font-medium rounded-lg px-2.5 focus:outline-none focus:border-[#6E60EE]/60 focus:ring-2 focus:ring-[#6E60EE]/20 transition-all cursor-pointer"
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
            </select>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!email.trim()}
              className="h-9.5 px-3.5 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs disabled:opacity-50"
            >
              Invite
            </Button>
          </div>
        </form>

        {/* Collaborators List / General Access */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-card-border/60">
          <span className="text-xs font-semibold text-text-secondary">
            People with access
          </span>

          <div className="flex flex-col divide-y divide-card-border/40 max-h-36 overflow-y-auto pr-1">
            {/* Owner Row */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-input-bg border border-card-border flex items-center justify-center text-text-secondary shrink-0 text-[10px] font-bold">
                  {selectedFile?.owner?.charAt(0) || 'P'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {selectedFile?.owner || 'Prashant'} (You)
                  </span>
                  <span className="text-[10px] text-text-secondary truncate">
                    prashant@cloudspacego.app
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-text-secondary font-medium px-2 py-0.5 rounded bg-input-bg">
                Owner
              </span>
            </div>

            {/* Shared Collaborators */}
            {selectedFile?.sharedWith?.map((sharedEmail, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {sharedEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {sharedEmail}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      Collaborator
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-text-secondary font-medium px-2 py-0.5 rounded bg-input-bg">
                  Can view
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Copy Link button and Done action */}
        <div className="flex items-center justify-between pt-2 border-t border-card-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-8.5 px-3 text-xs font-semibold text-text-secondary hover:text-[#6E60EE] hover:bg-[#6E60EE]/10 rounded-lg flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Link copied!</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Copy link</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleClose}
            className="h-8.5 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs"
          >
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
