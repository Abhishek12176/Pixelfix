'use client';

import React from 'react';
import {
  Paintbrush,
  Eraser,
  Sparkles,
  Download,
  Trash2,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { ToolMode } from '@/types';
import { APP_CONFIG } from '@/lib/constants';
import { PortfolioCard } from './PortfolioCard';

interface ControlPanelProps {
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  hasMask: boolean;
  hasResult: boolean;
  isProcessing: boolean;
  onClearMask: () => void;
  onRemoveObject: () => void;
  onDownload: () => void;
  onNewImage: () => void;
  activeMaskPixels?: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  toolMode,
  setToolMode,
  brushSize,
  setBrushSize,
  hasMask,
  hasResult,
  isProcessing,
  onClearMask,
  onRemoveObject,
  onDownload,
  onNewImage,
  activeMaskPixels = 0,
}) => {
  return (
    <aside className="w-full lg:w-[360px] xl:w-[380px] bg-[#141416] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col justify-between shrink-0 select-none overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      <div className="p-5 flex flex-col gap-5">
        {/* Tool Mode Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-outline uppercase tracking-wider">
            <span>Masking Tool</span>
            <span className="text-secondary font-medium">
              {hasMask ? 'Ready to Inpaint' : 'Paint over object'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setToolMode('brush')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                toolMode === 'brush'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              <Paintbrush className="w-4 h-4" />
              <span>Brush (B)</span>
            </button>

            <button
              type="button"
              onClick={() => setToolMode('eraser')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                toolMode === 'eraser'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>Eraser (E)</span>
            </button>
          </div>
        </div>

        {/* Brush Parameters */}
        <div className="flex flex-col gap-4 p-4 rounded-xl bg-surface-container border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white tracking-tight">Brush Size</span>
            {/* Live Size Preview Dot */}
            <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
              <div
                className="rounded-full bg-primary transition-all duration-75 shadow-[0_0_8px_rgba(124,92,252,0.6)]"
                style={{
                  width: `${Math.max(4, Math.min(24, brushSize / 3))}px`,
                  height: `${Math.max(4, Math.min(24, brushSize / 3))}px`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Radius</span>
              <div className="flex items-center gap-1 font-mono text-xs text-white">
                <input
                  type="number"
                  min={APP_CONFIG.brush.minSize}
                  max={APP_CONFIG.brush.maxSize}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Math.max(4, Math.min(120, Number(e.target.value))))}
                  className="w-12 text-right bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white outline-none focus:border-primary"
                />
                <span className="text-outline">px</span>
              </div>
            </div>

            <input
              type="range"
              min={APP_CONFIG.brush.minSize}
              max={APP_CONFIG.brush.maxSize}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-col gap-3">
          {/* Primary "Remove Object" Button */}
          <button
            type="button"
            onClick={onRemoveObject}
            disabled={!hasMask || isProcessing}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-between shadow-lg transition-all active:scale-[0.98] ${
              hasMask && !isProcessing
                ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/30 cursor-pointer'
                : 'bg-white/5 text-outline/50 border border-white/5 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span>{isProcessing ? 'Removing...' : 'Remove Object'}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-black/30 font-mono text-[11px] text-white/80">
              Enter ↵
            </span>
          </button>

          {/* Secondary Actions: Clear Mask */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClearMask}
              disabled={!hasMask || isProcessing}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-white/5 ${
                hasMask && !isProcessing
                  ? 'bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-white'
                  : 'bg-white/5 text-outline/40 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Mask</span>
            </button>
          </div>

          {/* Download Button (shows when result ready) */}
          {hasResult && (
            <button
              type="button"
              onClick={onDownload}
              className="w-full py-3 px-4 rounded-xl bg-surface-container-high hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/10 transition-all shadow-md active:scale-98 animate-in fade-in"
            >
              <Download className="w-4 h-4 text-secondary" />
              <span>Download Cleaned Image</span>
            </button>
          )}

          {/* Switch / New Image Trigger */}
          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              onClick={onNewImage}
              className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Open New Photo</span>
            </button>
          </div>
        </div>

        {/* Active Mask Stats Badge */}
        {hasMask && (
          <div className="p-3 rounded-xl bg-surface-container/60 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Selection Area:</span>
            <span className="font-mono text-primary font-medium">
              {activeMaskPixels > 0 ? `${activeMaskPixels.toLocaleString()} px` : 'Active'}
            </span>
          </div>
        )}
      </div>

      {/* Portfolio & Hotkeys Attribution Card */}
      <div className="p-5 mt-auto">
        <PortfolioCard />
      </div>
    </aside>
  );
};
