'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '@/types';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  onUndo?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss, onUndo }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform translate-y-0 opacity-100 max-w-[92vw] sm:max-w-md pointer-events-auto"
    >
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1C1C1F]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.85)] text-white">
        <div className="shrink-0">
          {toast.type === 'success' && (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Info className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-xs font-medium text-white truncate">{toast.title}</span>
          {toast.description && (
            <span className="text-[11px] text-zinc-300 truncate">{toast.description}</span>
          )}
        </div>

        {onUndo && toast.type === 'success' && (
          <button
            type="button"
            onClick={() => {
              onUndo();
              onDismiss();
            }}
            aria-label="Undo last action"
            className="px-2 py-0.5 rounded text-xs font-medium text-primary hover:text-white hover:bg-white/10 transition-colors ml-auto shrink-0 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            Undo
          </button>
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
