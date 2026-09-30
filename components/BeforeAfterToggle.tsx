'use client';

import React, { useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface BeforeAfterToggleProps {
  isHolding: boolean;
  setIsHolding: (holding: boolean) => void;
  disabled?: boolean;
}

export const BeforeAfterToggle: React.FC<BeforeAfterToggleProps> = ({
  isHolding,
  setIsHolding,
  disabled = false,
}) => {
  // Global space key handler for hold-to-compare
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.code === 'Space' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsHolding(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsHolding(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, setIsHolding]);

  if (disabled) return null;

  return (
    <button
      type="button"
      onMouseDown={() => setIsHolding(true)}
      onMouseUp={() => setIsHolding(false)}
      onMouseLeave={() => setIsHolding(false)}
      onTouchStart={() => setIsHolding(true)}
      onTouchEnd={() => setIsHolding(false)}
      className={`select-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-md active:scale-95 ${
        isHolding
          ? 'bg-primary text-white ring-2 ring-primary/40'
          : 'bg-[#1C1C1F]/90 hover:bg-[#252529] text-on-surface hover:text-white border border-white/10'
      }`}
      title="Hold to see original image (or hold Spacebar)"
    >
      {isHolding ? (
        <>
          <EyeOff className="w-3.5 h-3.5 text-white" />
          <span>Showing Original</span>
        </>
      ) : (
        <>
          <Eye className="w-3.5 h-3.5 text-secondary" />
          <span>Hold for Original</span>
          <span className="hidden sm:inline-block font-mono text-[10px] px-1 py-0.5 rounded bg-black/40 text-outline ml-1">
            Space
          </span>
        </>
      )}
    </button>
  );
};
