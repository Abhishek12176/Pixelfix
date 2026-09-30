'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface UploadZoneProps {
  onImageSelected: (file: File | string) => void;
  className?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected, className = '' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full max-w-2xl mx-auto ${className}`}>
      {/* Upload Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-surface-container-low/60 hover:bg-surface-container/60 ${
          isDragOver
            ? 'border-primary bg-primary/5 shadow-[0_0_32px_rgba(124,92,252,0.25)] scale-[1.01]'
            : 'border-white/10 hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300 shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1.5 max-w-sm">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Drop your photo here, or <span className="text-primary hover:underline">browse</span>
          </h3>
          <p className="text-xs text-on-surface-variant">
            Supports PNG, JPG, or WebP. 100% private — processed entirely on your device.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-white/5 text-[11px] font-mono text-outline">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          <span>No file size limit · Instant local AI</span>
        </div>
      </div>

      {/* Demo sample images row */}
      <div className="w-full mt-6 flex flex-col items-center gap-3">
        <span className="text-xs font-medium text-on-surface-variant">Or test with a sample photo:</span>
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {APP_CONFIG.samples.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onImageSelected(sample.url)}
              type="button"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-white/15 transition-all text-left group active:scale-95"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 shrink-0 relative border border-white/10">
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-xs font-medium text-white truncate">{sample.title}</span>
                <span className="text-[10px] text-on-surface-variant truncate">{sample.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
