'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../providers/app-provider';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Dialog } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import {
  Share2,
  Link as LinkIcon,
  Check,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  getFileShares,
  shareFile as shareFileApi,
  revokeFileShare
} from '@/features/files/api';
import { notifyFilesChanged } from '@/features/files/hooks/use-files';
import type { FileShareItem } from '@/features/files/types';

export function ShareModal() {
  const {
    activeModal,
    setActiveModal,
    selectedFileId,
    selectedFileItem,
    files
  } = useApp();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Viewer' | 'Editor'>('Viewer');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Active shares state
  const [shares, setShares] = useState<FileShareItem[]>([]);
  const [isLoadingShares, setIsLoadingShares] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const isOpen = activeModal === 'share';
  const targetFile =
    selectedFileItem ||
    files.find((f) => f.id === selectedFileId);

  const loadShares = useCallback(async (fileId: string) => {
    try {
      setIsLoadingShares(true);
      const res = await getFileShares(fileId);
      setShares(res.shares || []);
    } catch {
      setShares([]);
    } finally {
      setIsLoadingShares(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (isOpen && selectedFileId) {
      getFileShares(selectedFileId)
        .then((res) => {
          if (!ignore) {
            setShares(res.shares || []);
          }
        })
        .catch(() => {
          if (!ignore) {
            setShares([]);
          }
        })
        .finally(() => {
          if (!ignore) {
            setIsLoadingShares(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, selectedFileId]);

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccessMessage('');
    setCopied(false);
    setShares([]);
    setActiveModal(null);
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    if (user?.email && trimmed === user.email.toLowerCase()) {
      setError('You cannot share a file with yourself');
      return;
    }

    if (!selectedFileId) {
      setError('No file selected');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');

      const res = await shareFileApi(selectedFileId, {
        recipientEmail: trimmed,
        role: role.toLowerCase() as 'viewer' | 'editor'
      });

      setSuccessMessage(res.message || `Access granted to ${trimmed} as ${role}`);
      setEmail('');

      // Refresh shares and notify global listeners
      await loadShares(selectedFileId);
      notifyFilesChanged();
    } catch (err: unknown) {
      console.error('Failed to share file:', err);
      const backendError =
        (err as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to share file. Please try again.';
      setError(backendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (recipientId: string, recipientEmail: string) => {
    if (!selectedFileId) return;

    try {
      setRevokingId(recipientId);
      setError('');
      setSuccessMessage('');

      await revokeFileShare(selectedFileId, recipientId);

      setSuccessMessage(`Access revoked for ${recipientEmail}`);
      setShares((prev) => prev.filter((s) => s.recipient.id !== recipientId));
      notifyFilesChanged();
    } catch (err: unknown) {
      console.error('Failed to revoke share:', err);
      const backendError =
        (err as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to revoke access. Please try again.';
      setError(backendError);
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyLink = () => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://cloudspacego.app';
    const shareUrl = selectedFileId
      ? `${origin}/file/${selectedFileId}`
      : `${origin}/dashboard`;

    navigator.clipboard
      .writeText(shareUrl)
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
      title="Share File"
      description="Manage access and collaborate with others"
      size="md"
    >
      <div className="flex flex-col gap-3.5">
        {/* Selected Resource Card */}
        {targetFile && (
          <div className="flex items-center gap-2.5 p-2.5 bg-input-bg/60 border border-card-border rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span
                className="text-xs font-semibold text-foreground truncate"
                title={targetFile.name}
              >
                {targetFile.name}
              </span>
              <span className="text-[10px] text-text-secondary">
                Owner: {user?.name || 'You'} ({user?.email || 'Owner'})
              </span>
            </div>
          </div>
        )}

        {/* Error Feedback Alert */}
        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Feedback Alert */}
        {successMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleShare} className="flex flex-col gap-2.5">
          <div className="flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-end gap-2">
            <div className="flex-1 min-w-0">
              <Input
                label="Add people by email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                  if (successMessage) setSuccessMessage('');
                }}
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'Viewer' | 'Editor')}
                disabled={isSubmitting}
                className="h-9.5 flex-1 min-[380px]:flex-initial bg-input-bg border border-card-border text-foreground text-xs font-medium rounded-lg px-2.5 focus:outline-none focus:border-[#6E60EE]/60 focus:ring-2 focus:ring-[#6E60EE]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
              </select>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!email.trim() || isSubmitting}
                className="h-9.5 px-3.5 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sharing...</span>
                  </>
                ) : (
                  <span>Invite</span>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Collaborators List / People with access */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-card-border/60">
          <span className="text-xs font-semibold text-text-secondary">
            People with access
          </span>

          <div className="flex flex-col divide-y divide-card-border/40 max-h-48 overflow-y-auto pr-1">
            {/* Owner Row */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6.5 h-6.5 rounded-full bg-input-bg border border-card-border flex items-center justify-center text-text-secondary shrink-0 text-[10px] font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'Y'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {user?.name || 'You'} (Owner)
                  </span>
                  <span className="text-[10px] text-text-secondary truncate">
                    {user?.email || 'Owner account'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-text-secondary font-medium px-2 py-0.5 rounded bg-input-bg shrink-0">
                Owner
              </span>
            </div>

            {/* Loading state for existing shares */}
            {isLoadingShares && (
              <div className="py-3 flex items-center justify-center gap-2 text-xs text-text-secondary">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6E60EE]" />
                <span>Loading collaborators...</span>
              </div>
            )}

            {/* Shared Collaborators */}
            {!isLoadingShares &&
              shares.map((share) => {
                const isRevokingThis = revokingId === share.recipient.id;
                return (
                  <div
                    key={share.id}
                    className="flex items-center justify-between py-2 gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-6.5 h-6.5 rounded-full bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0 text-[10px] font-bold">
                        {(share.recipient.name || share.recipient.email)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {share.recipient.name}
                        </span>
                        <span className="text-[10px] text-text-secondary truncate">
                          {share.recipient.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-[#6E60EE] font-medium px-2 py-0.5 rounded bg-[#6E60EE]/10 capitalize">
                        {share.role === 'editor' ? 'Editor' : 'Viewer'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleRevoke(share.recipient.id, share.recipient.email)
                        }
                        disabled={isRevokingThis}
                        className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        title={`Revoke access for ${share.recipient.email}`}
                      >
                        {isRevokingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* Empty Collaborators Notice */}
            {!isLoadingShares && shares.length === 0 && (
              <div className="py-2.5 text-center text-[11px] text-text-secondary">
                No active collaborators yet. Invite someone above.
              </div>
            )}
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
