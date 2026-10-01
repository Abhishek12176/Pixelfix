'use client';

import React from 'react';
import { Sparkles, Download, Cpu } from 'lucide-react';
import { ModelProgress } from '@/types';

interface LoadingOverlayProps {
  progress: ModelProgress | null;
  onCancel?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progress, onCancel }) => {
  if (!progress || progress.status === 'idle' || progress.status === 'done') {
    return null;
  }

  const isDownloading = progress.status === 'downloading';
  const isProcessing = progress.status === 'processing';

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200"
    >
      {/* Dynamic Ambient Glow Orbs */}
      <div className="absolute w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10" aria-hidden="true" />

      {isDownloading && (
        <div className="max-w-md w-full p-6 rounded-2xl bg-[#141416] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.8)] flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_24px_rgba(124,92,252,0.3)]">
            <Download className="w-6 h-6 animate-bounce" aria-hidden="true" />
          </div>

          <div className="flex flex-col gap-1.5 text-center">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Downloading AI Model (62 MB)
            </h3>
            <p className="text-xs text-zinc-300 max-w-xs leading-relaxed">
              First time only. The model runs 100% locally in your browser. Next visits will be instant.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex flex-col gap-2">
            <div
              role="progressbar"
              aria-valuenow={progress.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Model download progress"
              className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden p-0.5 border border-white/5"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 shadow-[0_0_12px_rgba(124,92,252,0.6)]"
                style={{ width: `${Math.max(5, progress.progress)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 px-0.5">
              <span>{progress.stage || 'Loading neural weights...'}</span>
              <span className="text-white font-semibold">{progress.progress}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" aria-hidden="true" />
            <span>WASM SIMD Acceleration (Web Worker)</span>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="flex flex-col items-center gap-4">
          {/* Floating HUD Card matching Stitch 6 */}
          <div className="flex items-center gap-3.5 px-5 py-3 rounded-full bg-[#1C1C1F]/95 backdrop-blur-2xl border border-primary/30 shadow-[0_16px_48px_rgba(0,0,0,0.85)] text-white">
            <div className="relative flex h-3 w-3" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '3s' }} aria-hidden="true" />
              <span className="text-xs font-medium tracking-tight">Synthesizing texture...</span>
              <span className="text-zinc-500 text-xs">·</span>
              <span className="text-xs font-mono text-secondary font-semibold">Removing object</span>
            </div>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                aria-label="Cancel inpainting"
                className="ml-2 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <Cpu className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
            <span>Local Neural Inpainting (Web Worker)</span>
          </div>
        </div>
      )}
    </div>
  );
};
