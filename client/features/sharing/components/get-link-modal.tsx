'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../providers/app-provider';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Link as LinkIcon, Check, Copy, Globe, ShieldCheck } from 'lucide-react';

export function GetLinkModal() {
  const { activeModal, setActiveModal, selectedFileId, files } = useApp();
  const [copied, setCopied] = useState(false);

  const isOpen = activeModal === 'get-link';
  const selectedFile = files.find(f => f.id === selectedFileId);
  const shareUrl = selectedFile
    ? `https://cloudspacego.app/s/${selectedFile.id}`
    : 'https://cloudspacego.app/s/workspace';

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setCopied(false);
    setActiveModal(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Get Link"
      description="Share this link with anyone you want to give view access to"
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Selected Resource Summary */}
        {selectedFile && (
          <div className="flex items-center gap-3 p-3 bg-input-bg/60 border border-card-border rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-foreground truncate" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="text-[11px] text-text-secondary">
                Anyone with link &bull; Viewer
              </span>
            </div>
          </div>
        )}

        {/* Link Input Row */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary select-none">
            Shareable link
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full h-10 bg-input-bg text-foreground rounded-lg px-3.5 py-2 text-xs font-mono select-all border border-card-border focus:outline-none focus:border-[#6E60EE]/60 focus:ring-2 focus:ring-[#6E60EE]/20"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCopy}
              className="h-10 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs shrink-0 flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Access Permission Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card-bg border border-card-border">
          <Globe className="w-4 h-4 text-[#6E60EE] shrink-0 mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-foreground">
              General Access: Anyone with link
            </span>
            <span className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
              Anyone on the internet with this link will be able to view and download this file.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end pt-2 border-t border-card-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-9 px-4 text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-input-bg rounded-lg"
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
