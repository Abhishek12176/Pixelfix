'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  ArrowRight,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowUpRight,
  Sliders,
  Layers,
  Heart,
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export const Hero: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      // Store in sessionStorage so editor can pick it up immediately
      sessionStorage.setItem('pixelfix_pending_image', url);
      sessionStorage.setItem('pixelfix_pending_filename', file.name);
      router.push('/editor');
    }
  };

  const handleSampleClick = (sampleUrl: string, sampleName: string) => {
    sessionStorage.setItem('pixelfix_pending_image', sampleUrl);
    sessionStorage.setItem('pixelfix_pending_filename', sampleName);
    router.push('/editor');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] flex flex-col selection:bg-primary selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto h-14 px-6 flex items-center justify-between">
          {/* Left: PixelFix Brand Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#141416] border border-white/10 flex items-center justify-center text-primary group-hover:scale-105 transition-all shadow-sm">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L14 10M14 10L17 13M14 10L12 8M17 13L15 15" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="8" r="1" fill="currentColor" />
                <rect x="13.5" y="13.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.4" />
              </svg>
            </div>
            <span className="font-semibold text-base tracking-tight text-white">
              Pixel<span className="text-primary">Fix</span>
            </span>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 text-[11px] font-mono text-outline">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span>v2.4 · LaMa Engine</span>
            </div>
          </Link>

          {/* Right: Portfolio Link */}
          <a
            href={APP_CONFIG.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-on-surface-variant hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-white/5 group"
          >
            <span>Made by {APP_CONFIG.author}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center">
        {/* Background Ambient Violet & Mint Glow Orbs */}
        <div className="relative w-full overflow-hidden flex flex-col items-center">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-primary/15 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute top-72 left-1/3 w-[360px] h-[240px] bg-secondary/10 rounded-full blur-[110px] pointer-events-none -z-10" />

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C1C1F] border border-white/10 shadow-sm mb-8 select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              <span className="text-xs font-mono text-on-surface-variant font-medium tracking-tight">
                New: In-Browser LaMa AI <span className="text-outline">·</span> Sub-second inference
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white max-w-3xl leading-[1.12] mb-6">
              Remove anything.<br />
              <span className="text-on-surface-variant">Perfect every shot.</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed mb-10 text-balance">
              Upload a photo, brush over what you don't want, and let AI handle the rest. Free forever.
              Nothing leaves your device.
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Primary Action Button Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-8">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium text-sm flex items-center justify-center gap-2.5 shadow-[0_0_32px_rgba(124,92,252,0.4)] transition-all active:scale-[0.98] group cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Photo</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                href="/editor"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1C1C1F] hover:bg-[#252529] text-white font-medium text-sm flex items-center justify-center gap-2 border border-white/10 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Open Studio</span>
              </Link>
            </div>

            {/* Sample image quick-test buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10 text-xs text-on-surface-variant">
              <span>Or try with:</span>
              {APP_CONFIG.samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSampleClick(s.url, s.name)}
                  type="button"
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 font-mono text-[11px]"
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Trust Row */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-on-surface-variant text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                <span>No signup</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                <span>Runs in your browser</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                <span>Your photos stay private</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                <span>Free forever</span>
              </div>
            </div>
          </div>

          {/* Interactive Studio Preview Card matching Stitch 3 */}
          <div className="w-full max-w-5xl mx-auto px-6 pb-20">
            <div className="relative w-full rounded-2xl bg-[#141416] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col group">
              {/* Studio Window Bar */}
              <div className="h-10 bg-[#1C1C1F] px-4 flex items-center justify-between border-b border-white/5 text-xs text-on-surface-variant select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  </div>
                  <span className="text-white font-mono ml-2">interior_living_scandinavian.raw</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-secondary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    WebGPU FP16
                  </span>
                </div>
              </div>

              {/* Preview Graphic */}
              <div className="relative w-full h-80 sm:h-96 md:h-[460px] overflow-hidden bg-black flex items-center justify-center cursor-pointer"
                   onClick={() => handleSampleClick('/samples/cafe_street.jpg', 'cafe_street.jpg')}>
                <img
                  src="/samples/cafe_street.jpg"
                  alt="PixelFix Studio Inpainting Demonstration"
                  className="w-full h-full object-cover opacity-90"
                />

                {/* Simulated mask overlay on photobomber */}
                <div className="absolute right-[12%] bottom-[14%] w-36 h-48 rounded-2xl border-2 border-dashed border-primary bg-primary/30 backdrop-blur-[2px] flex items-center justify-center shadow-[0_0_32px_rgba(124,92,252,0.5)]">
                  <span className="px-2 py-1 rounded bg-black/75 text-[10px] font-mono text-white">
                    Masked Object
                  </span>
                </div>

                {/* Floating Click to Try CTA on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-xs flex items-center gap-2 shadow-2xl">
                    <Sparkles className="w-4 h-4" />
                    <span>Click to Edit This in Studio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Section (3 Columns) */}
        <section className="w-full max-w-6xl mx-auto px-6 py-16 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#141416] border border-white/5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">Brush. Remove. Done.</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Highlight people in the background, power lines, text, or watermarks. Click remove and watch them disappear instantly with seamless texture filling.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#141416] border border-white/5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-1">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">Runs Locally</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                AI runs directly in your browser using ONNX WebAssembly and WebGPU. No image is ever uploaded to a remote server, guaranteeing 100% private data.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#141416] border border-white/5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">Built with Love</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Engineered by Abhishek with cutting-edge web AI technology. Check out more projects on Abhishek's portfolio.
              </p>
              <a
                href={APP_CONFIG.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-auto inline-flex items-center gap-1 font-medium pt-2"
              >
                <span>See the portfolio</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 px-6 text-center text-xs font-mono text-outline">
        <p>Built with onnxruntime-web + LaMa · Hosted on Vercel · Made by {APP_CONFIG.author}</p>
      </footer>
    </div>
  );
};
