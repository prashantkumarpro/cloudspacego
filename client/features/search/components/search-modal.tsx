'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/providers/app-provider';
import { useSearch } from '../hooks/use-search';
import type { UnifiedSearchResult } from '../types';
import { FilePreview } from '@/features/files/components/file-preview';
import { FilePreviewModal } from '@/features/files/components/file-preview-modal';
import type { UnifiedFileItem } from '@/features/files/components/file-list';
import { formatBytes, formatDate } from '@/lib/utils/format';
import { Search, X, Folder, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Helper to cleanly highlight matching text in query
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-[#6E60EE] font-bold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

export function SearchModal() {
  const {
    activeModal,
    setActiveModal,
    setActiveFolderId,
    setCurrentSection,
  } = useApp();

  const [localQuery, setLocalQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewFile, setPreviewFile] = useState<UnifiedFileItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isOpen = activeModal === 'search';
  const hasQuery = localQuery.trim().length > 0;

  // Real backend search hook connected to database API
  const { results: searchResults, isLoading, error, refresh } = useSearch(localQuery);

  // Reset query and focus input on open
  useEffect(() => {
    if (isOpen) {
      setLocalQuery('');
      setSelectedIndex(0);
      setPreviewFile(null);
      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset selected index when search query or results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [localQuery, searchResults.length]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && searchResults.length > 0) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, searchResults.length]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (searchResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = searchResults[selectedIndex];
        if (selected) {
          handleResultClick(selected);
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, searchResults, selectedIndex]);

  const handleResultClick = (item: UnifiedSearchResult) => {
    if (item.type === 'folder') {
      setActiveFolderId(item.id);
      setCurrentSection('My Files');
      setActiveModal(null);
    } else {
      // Open in-app preview for instant access to real backend file
      setPreviewFile({
        id: item.id,
        _id: item._id || item.id,
        name: item.name,
        extension: item.extension,
        size: item.size,
        parentDirId: item.parentDirId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }
  };

  const handleGoToLocation = (item: UnifiedSearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'folder') {
      setActiveFolderId(item.id);
    } else {
      setActiveFolderId(item.parentDirId || null);
    }
    setCurrentSection('My Files');
    setActiveModal(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 dark:bg-black/75 backdrop-blur-xs flex flex-col items-center pt-[10vh] sm:pt-[14vh] px-4 select-none animate-in fade-in duration-200"
        onClick={() => setActiveModal(null)}
      >
        {/* Main Floating Integrated Card */}
        <div
          className="w-full max-w-xl bg-card-bg border border-card-border rounded-2xl shadow-xl overflow-hidden flex flex-col text-foreground animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Search Input Bar (Compact 48px height) */}
          <div className="flex items-center w-full px-4 h-12 gap-3 bg-card-bg">
            <Search className="h-4.5 w-4.5 text-[#6E60EE] shrink-0" strokeWidth={2.2} />
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search files, folders, and documents..."
              className="flex-1 bg-transparent text-foreground text-xs sm:text-sm font-semibold placeholder:text-text-muted placeholder:font-normal focus:outline-none outline-none border-none ring-0 focus:ring-0 p-0"
              autoComplete="off"
            />
            {/* Close Button X */}
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-foreground hover:bg-input-bg transition-colors cursor-pointer shrink-0"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results Area — ONLY displayed when user types a query */}
          {hasQuery && (
            <div className="border-t border-card-border/50 flex flex-col">
              {isLoading ? (
                /* Loading State */
                <div className="py-10 flex flex-col items-center justify-center text-center select-none px-4 gap-2">
                  <Loader2 className="w-5 h-5 text-[#6E60EE] animate-spin" />
                  <span className="text-xs text-text-muted font-medium">
                    Searching your files and folders...
                  </span>
                </div>
              ) : error ? (
                /* Error State */
                <div className="py-8 flex flex-col items-center justify-center text-center select-none px-4 gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-1">
                    <AlertCircle className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">
                    Search encountered an issue
                  </h4>
                  <p className="text-[11px] text-text-muted max-w-[280px]">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => refresh()}
                    className="mt-1 text-xs font-semibold text-[#6E60EE] hover:underline cursor-pointer"
                  >
                    Retry search
                  </button>
                </div>
              ) : searchResults.length === 0 ? (
                /* Clean No Results State */
                <div className="py-10 flex flex-col items-center justify-center text-center select-none px-4">
                  <div className="w-9 h-9 rounded-full bg-input-bg flex items-center justify-center text-text-muted mb-2">
                    <Search className="w-4.5 h-4.5 text-text-muted" strokeWidth={2} />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">
                    No results found
                  </h4>
                  <p className="text-[11px] text-text-muted mt-1 max-w-[280px] leading-normal font-normal">
                    No files or folders matched &ldquo;{localQuery}&rdquo;. Check spelling or try a different term.
                  </p>
                </div>
              ) : (
                /* Matching Real Results List (Compact & Clean) */
                <div
                  ref={listRef}
                  className="w-full max-h-[320px] sm:max-h-[340px] overflow-y-auto flex flex-col divide-y divide-card-border/30 p-1"
                >
                  {searchResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const isFolder = item.type === 'folder';
                    const displayDate = formatDate(item.updatedAt || item.createdAt || new Date().toISOString());
                    const displaySize = !isFolder && typeof item.size === 'number' && item.size > 0
                      ? formatBytes(item.size)
                      : null;

                    const snippetMetadata = isFolder
                      ? `Folder • in ${item.locationName}`
                      : `${(item.extension || item.type).toUpperCase()}${displaySize ? ` • ${displaySize}` : ''} • in ${item.locationName}`;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 group relative select-none",
                          isSelected
                            ? "bg-[#6E60EE]/8 text-foreground"
                            : "hover:bg-input-bg/70 text-foreground"
                        )}
                      >
                        {/* Left: Icon / Thumbnail Preview + Text */}
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                          {isFolder ? (
                            <div className="w-8 h-8 rounded-lg bg-[#6E60EE]/10 flex items-center justify-center text-[#6E60EE] shrink-0">
                              <Folder className="w-4 h-4" />
                            </div>
                          ) : (
                            <FilePreview
                              file={{
                                id: item.id,
                                _id: item._id,
                                name: item.name,
                                extension: item.extension,
                                type: item.type,
                                size: item.size,
                              }}
                              variant="compact"
                            />
                          )}

                          {/* Middle: Title + Lighter/Smaller Metadata */}
                          <div className="flex flex-col min-w-0 flex-1 justify-center">
                            <span className="text-xs sm:text-[13px] font-semibold text-foreground truncate group-hover:text-[#6E60EE] transition-colors leading-tight">
                              {highlightMatch(item.name, localQuery)}
                            </span>
                            <span className="text-[10.5px] sm:text-[11px] text-text-muted font-normal truncate mt-0.5 leading-none">
                              {snippetMetadata}
                            </span>
                          </div>
                        </div>

                        {/* Right: Date Modified + Quick Jump Action */}
                        <div className="flex items-center gap-2 shrink-0 text-right">
                          <span className="text-[11px] sm:text-xs text-text-muted font-normal">
                            {displayDate}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleGoToLocation(item, e)}
                            title="Go to location"
                            className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-[#6E60EE] hover:bg-[#6E60EE]/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* In-App File Preview Modal when opened from Search */}
      {previewFile && (
        <FilePreviewModal
          isOpen={Boolean(previewFile)}
          onClose={() => setPreviewFile(null)}
          file={previewFile}
          files={
            searchResults
              .filter(r => r.type !== 'folder')
              .map(r => ({
                id: r.id,
                _id: r._id || r.id,
                name: r.name,
                extension: r.extension,
                size: r.size,
                parentDirId: r.parentDirId,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
              })) as UnifiedFileItem[]
          }
          onNavigate={(f) => setPreviewFile(f as UnifiedFileItem)}
        />
      )}
    </>
  );
}
