'use client';

import React from 'react';
import Link from 'next/link';
import { Undo2, Redo2, RotateCcw, ArrowLeft, ArrowUpRight } from 'lucide-react';
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
  engineMode = 'LaMa (Web Worker WASM)',
}) => {
  return (
    <header className="h-14 w-full bg-[#141416]/90 backdrop-blur-xl border-b border-white/5 px-4 flex items-center justify-between z-30 select-none shrink-0" aria-label="Studio Toolbar">
      {/* Left: Back / Brand / File Info */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-300 hover:text-white text-xs font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-primary"
          title="Back to Home"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" aria-hidden="true" />

        {/* Wordmark Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface-container border border-white/10 flex items-center justify-center text-primary shadow-sm">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-[11px] font-mono text-zinc-300 truncate max-w-xs border border-white/5">
            <span className="truncate text-white">{metadata.name}</span>
            <span className="text-zinc-500">·</span>
            <span>
              {metadata.width}×{metadata.height}
            </span>
          </div>
        )}
      </div>

      {/* Center: Undo / Redo / Reset Action Controls */}
      <div className="flex items-center gap-1 bg-[#1C1C1F] p-1 rounded-xl border border-white/5 shadow-inner" role="group" aria-label="History and reset actions">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
            canUndo
              ? 'text-white hover:bg-white/10 active:scale-95'
              : 'text-zinc-600 cursor-not-allowed'
          }`}
          title="Undo (⌘Z)"
          aria-label="Undo last action"
          type="button"
        >
          <Undo2 className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
            canRedo
              ? 'text-white hover:bg-white/10 active:scale-95'
              : 'text-zinc-600 cursor-not-allowed'
          }`}
          title="Redo (⌘⇧Z)"
          aria-label="Redo action"
          type="button"
        >
          <Redo2 className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="h-4 w-[1px] bg-white/10 my-auto mx-0.5" aria-hidden="true" />

        <button
          onClick={onReset}
          disabled={!hasMask && !canUndo}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
            hasMask || canUndo
              ? 'text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95'
              : 'text-zinc-600 cursor-not-allowed'
          }`}
          title="Reset to Original"
          aria-label="Reset photo to original"
          type="button"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Right: Engine status + Portfolio link */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-[11px] font-mono text-zinc-300 border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" aria-hidden="true" />
          <span>{engineMode}</span>
        </div>

        <a
          href={APP_CONFIG.portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Made by Abhishek (opens portfolio in new tab)"
          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-zinc-300 hover:text-white transition-colors border border-white/5 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <span>Made by {APP_CONFIG.author}</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </header>
  );
};
