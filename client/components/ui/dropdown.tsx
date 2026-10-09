import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils/cn';

export interface DropdownItemType {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItemType[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      {/* Trigger Button Wrapper */}
      <div onClick={toggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Content */}
      <div
        className={cn(
          "absolute z-40 mt-2.5 w-60 bg-card-bg border border-card-border rounded-2xl shadow-2xl focus:outline-none p-1.5 flex flex-col gap-0.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        )}
        aria-hidden={!isOpen}
      >
        {/* Dropdown Items list */}
        <div className="flex flex-col gap-0.5 w-full" role="menu" aria-orientation="vertical">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  close();
                }
              }}
              disabled={item.disabled}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm font-semibold text-text-secondary hover:text-foreground hover:bg-input-bg transition-colors flex items-center gap-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none",
                item.className
              )}
              role="menuitem"
            >
              {item.icon && <span className="shrink-0 flex items-center justify-center">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
