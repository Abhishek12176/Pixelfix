import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface PortfolioCardProps {
  className?: string;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ className = '' }) => {
  return (
    <div className={`p-4 rounded-xl bg-surface-container border border-white/5 flex flex-col gap-3 shadow-md ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-inner" aria-hidden="true">
            AP
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-white font-medium truncate">Crafted by {APP_CONFIG.author}</span>
            <span className="text-[10px] text-zinc-400 truncate">Full Stack & AI UX</span>
          </div>
        </div>

        <a
          href={APP_CONFIG.portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Abhishek's portfolio (opens in new tab)"
          className="px-2.5 py-1 rounded-md text-primary hover:bg-primary/10 text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-0.5 group focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <span>Portfolio</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </a>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5">
        <span>⌘Z to Undo</span>
        <span>[ / ] Brush Size</span>
        <span>Space to Compare</span>
      </div>
    </div>
  );
};
