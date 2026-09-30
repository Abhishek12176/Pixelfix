'use client';

import React from 'react';
import Link from 'next/link';
import { Undo2, Redo2, RotateCcw, ArrowLeft, ArrowUpRight, Cpu } from 'lucide-react';
import { ImageMetadata } from '@/types';
import { APP_CONFIG } from '@/lib/constants';

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  hasMask: boolean;
  metadata: ImageMetadata | null;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onNewImage?: () => void;
  engineMode?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  canRedo,
  hasMask,
  metadata,
  onUndo,
  onRedo,
  onReset,
  onNewImage,
  engineMode = 'LaMa (CPU Mode)',
}) => {
  return (
    <header className="h-14 w-full bg-[#141416]/90 backdrop-blur-xl border-b border-white/5 px-4 flex items-center justify-between z-30 select-none shrink-0">
      {/* Left: Back / Brand / File Info */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-white text-xs font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

        {/* Wordmark Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface-container border border-white/10 flex items-center justify-center text-primary shadow-sm">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L14 10M14 10L17 13M14 10L12 8M17 13L15 15" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="1" fill="currentColor" />
              <rect x="13.5" y="13.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.4" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">
            Pixel<span className="text-primary">Fix</span>
          </span>
        </div>

        {/* File metadata pill */}
        {metadata && (
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-[11px] font-mono text-on-surface-variant truncate max-w-xs border border-white/5">
            <span className="truncate text-white">{metadata.name}</span>
            <span className="text-outline">·</span>
            <span>
              {metadata.width}×{metadata.height}
            </span>
          </div>
        )}
      </div>

      {/* Center: Undo / Redo / Reset Action Controls */}
      <div className="flex items-center gap-1 bg-[#1C1C1F] p-1 rounded-xl border border-white/5 shadow-inner">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
            canUndo
              ? 'text-white hover:bg-white/10 active:scale-95'
              : 'text-outline/40 cursor-not-allowed'
          }`}
          title="Undo (⌘Z)"
          type="button"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
            canRedo
              ? 'text-white hover:bg-white/10 active:scale-95'
              : 'text-outline/40 cursor-not-allowed'
          }`}
          title="Redo (⌘⇧Z)"
          type="button"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-white/10 my-auto mx-0.5" />

        <button
          onClick={onReset}
          disabled={!hasMask && !canUndo}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
            hasMask || canUndo
              ? 'text-on-surface-variant hover:text-white hover:bg-white/10 active:scale-95'
              : 'text-outline/40 cursor-not-allowed'
          }`}
          title="Reset to Original"
          type="button"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Engine status + Portfolio link */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-[11px] font-mono text-on-surface-variant border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span>{engineMode}</span>
        </div>

        <a
          href={APP_CONFIG.portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface hover:text-primary transition-colors border border-white/5"
        >
          <span>Made by {APP_CONFIG.author}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
