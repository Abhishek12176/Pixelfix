'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const LoadingSkeleton = () => (
  <div className="w-full h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-on-surface-variant font-mono text-xs gap-3">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    <span>Initializing PixelFix Studio...</span>
  </div>
);

const Editor = dynamic(
  () => import('@/components/Editor').then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => <LoadingSkeleton />,
  }
);

export default function EditorPage() {
  const [initialImage, setInitialImage] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const pending = sessionStorage.getItem('pixelfix_pending_image');
      if (pending) {
        setInitialImage(pending);
        sessionStorage.removeItem('pixelfix_pending_image');
        sessionStorage.removeItem('pixelfix_pending_filename');
      }
    }
  }, []);

  if (!isMounted) {
    return <LoadingSkeleton />;
  }

  return <Editor initialImageSrc={initialImage} />;
}
