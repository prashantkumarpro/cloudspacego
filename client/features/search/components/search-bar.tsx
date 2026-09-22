'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/providers/app-provider';
import { Tooltip } from '@/components/ui/tooltip';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { usePlusActions } from '@/hooks/use-plus-actions';

export function SearchBar() {
  const { toggleSidebar, isSidebarCollapsed, setActiveModal } = useApp();
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  const { actions, hiddenInputs } = usePlusActions(() => setIsPlusMenuOpen(false));

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPlusMenuOpen(false);
      }
    };

    if (isPlusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlusMenuOpen]);

  return (
    <div className="flex items-center bg-input-bg border border-card-border rounded-full p-1 gap-2 shadow-none transition-all duration-200 w-fit select-none shrink-0 h-10">
      {hiddenInputs}

      {/* 1. Sidebar Toggle Button (hidden on mobile/tablet) */}
      <div className="hidden md:block">
        <Tooltip content={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} side='bottom'>
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-card-bg active:bg-[#6E60EE]/10 active:text-[#6E60EE] active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-input-bg shrink-0"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
        </Tooltip>
      </div>

      {/* 2. Search Open Button (triggers search popup) */}
      <Tooltip content="Search files" side="bottom">
        <button
          onClick={() => setActiveModal('search')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-card-bg active:bg-[#6E60EE]/10 active:text-[#6E60EE] active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-input-bg shrink-0"
          aria-label="Open search popup modal"
        >
          <Search className="w-4.5 h-4.5" strokeWidth={2.2} />
        </button>
      </Tooltip>

      {/* 3. Primary "+" Action Button with Compact Popover (hidden on mobile/tablet) */}
      <div className="hidden md:block relative" ref={plusMenuRef}>
        <Tooltip content="New" side="bottom" disabled={isPlusMenuOpen}>
          <button
            onClick={() => setIsPlusMenuOpen(prev => !prev)}
            aria-expanded={isPlusMenuOpen}
            aria-haspopup="menu"
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center bg-[#6E60EE] hover:bg-[#6E60EE]/90 text-white shadow-xs transition-all duration-200 cursor-pointer focus:outline-none shrink-0",
              isPlusMenuOpen && "ring-2 ring-[#6E60EE]/40"
            )}
            aria-label="New folder or file upload options menu"
          >
            <svg
              className={cn(
                "w-4 h-4 text-white transition-transform duration-200",
                isPlusMenuOpen && "rotate-45"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14m-7-7h14" />
            </svg>
          </button>
        </Tooltip>

        {/* Compact Popover Menu */}
        {isPlusMenuOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute top-full left-0 mt-2 w-44 bg-card-bg border border-card-border rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-1 flex flex-col gap-0.5 z-50 select-none animate-in fade-in zoom-in-95 duration-150 focus:outline-none"
          >
            {actions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  role="menuitem"
                  onClick={action.onClick}
                  className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded-lg text-xs font-semibold text-foreground hover:text-[#6E60EE] hover:bg-input-bg transition-colors duration-150 cursor-pointer select-none text-left focus:outline-none focus-visible:bg-input-bg"
                >
                  <Icon className="w-4 h-4 text-[#6E60EE] shrink-0" strokeWidth={2} />
                  <span className="truncate">{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
