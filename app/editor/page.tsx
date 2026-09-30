'use client';

import React, { useEffect, useState } from 'react';
import { Editor } from '@/components/Editor';

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
    return (
      <div className="w-full h-screen bg-[#0A0A0B] flex items-center justify-center text-on-surface-variant font-mono text-xs">
        Initializing PixelFix Studio...
      </div>
    );
  }

  return <Editor initialImageSrc={initialImage} />;
}
