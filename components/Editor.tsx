'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Toolbar } from './Toolbar';
import { BrushCanvas } from './BrushCanvas';
import { ControlPanel } from './ControlPanel';
import { UploadZone } from './UploadZone';
import { LoadingOverlay } from './LoadingOverlay';
import { Toast } from './Toast';
import { ToolMode, ModelProgress, ToastMessage, ImageMetadata } from '@/types';
import { APP_CONFIG } from '@/lib/constants';
import {
  loadImage,
  createCanvas,
  hasMaskPixels,
  countMaskPixels,
  downloadCanvas,
} from '@/lib/canvasUtils';
import { runInpainting, getActiveEngine } from '@/lib/onnxInpainter';

interface EditorProps {
  initialImageSrc?: string;
}

export const Editor: React.FC<EditorProps> = ({ initialImageSrc }) => {
  // Image & Canvas state
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [currentImageCanvas, setCurrentImageCanvas] = useState<HTMLCanvasElement | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [engineMode, setEngineMode] = useState<string>(getActiveEngine());
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  // Tools & Brush state
  const [toolMode, setToolMode] = useState<ToolMode>('brush');
  const [brushSize, setBrushSize] = useState<number>(APP_CONFIG.brush.defaultSize);
  const [hasMask, setHasMask] = useState<boolean>(false);
  const [activeMaskPixels, setActiveMaskPixels] = useState<number>(0);
  const [hasResult, setHasResult] = useState<boolean>(false);

  // Undo / Redo history stack
  const historyRef = useRef<{ imageSnapshot: HTMLCanvasElement; maskSnapshot: HTMLCanvasElement }[]>([]);
  const redoRef = useRef<{ imageSnapshot: HTMLCanvasElement; maskSnapshot: HTMLCanvasElement }[]>([]);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Processing & Toasts
  const [modelProgress, setModelProgress] = useState<ModelProgress | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Initialize or load an image
  const loadImageSource = useCallback(async (source: File | string) => {
    try {
      let src = '';
      let filename = 'photo.jpg';
      let sizeBytes = 0;

      if (typeof source === 'string') {
        src = source;
        filename = source.split('/').pop() || 'sample.jpg';
      } else {
        src = URL.createObjectURL(source);
        filename = source.name;
        sizeBytes = source.size;
      }

      const img = await loadImage(src);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      setOriginalImage(img);
      setImageMetadata({
        name: filename,
        width,
        height,
        sizeBytes: sizeBytes || width * height * 4,
        aspectRatio: width / height,
      });

      // Create base working image canvas
      const baseCanvas = createCanvas(width, height);
      const ctx = baseCanvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);
      setCurrentImageCanvas(baseCanvas);

      // Reset mask & history
      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) maskCtx.clearRect(0, 0, width, height);
      }

      setHasMask(false);
      setActiveMaskPixels(0);
      setHasResult(false);
      historyRef.current = [];
      redoRef.current = [];
      setCanUndo(false);
      setCanRedo(false);
    } catch (err) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Failed to load photo',
        description: (err as Error).message,
      });
    }
  }, []);

  // Load initial image if provided (or sample)
  useEffect(() => {
    if (initialImageSrc) {
      loadImageSource(initialImageSrc);
    }
  }, [initialImageSrc, loadImageSource]);

  // Check mask pixels state
  const handleMaskChange = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const exists = hasMaskPixels(maskCanvas);
    setHasMask(exists);
    if (exists) {
      setActiveMaskPixels(countMaskPixels(maskCanvas));
    } else {
      setActiveMaskPixels(0);
    }
  };

  // Save history snapshot for Undo
  const saveSnapshot = useCallback(() => {
    if (!currentImageCanvas || !maskCanvasRef.current) return;

    // Clone current image canvas
    const imgSnap = createCanvas(currentImageCanvas.width, currentImageCanvas.height);
    const imgCtx = imgSnap.getContext('2d');
    if (imgCtx) imgCtx.drawImage(currentImageCanvas, 0, 0);

    // Clone current mask canvas
    const maskCanvas = maskCanvasRef.current;
    const maskSnap = createCanvas(maskCanvas.width, maskCanvas.height);
    const maskCtx = maskSnap.getContext('2d');
    if (maskCtx) maskCtx.drawImage(maskCanvas, 0, 0);

    historyRef.current.push({ imageSnapshot: imgSnap, maskSnapshot: maskSnap });
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [currentImageCanvas]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const last = historyRef.current.pop();
    if (!last || !currentImageCanvas || !maskCanvasRef.current) return;

    // Save current to redo stack
    const currentImgSnap = createCanvas(currentImageCanvas.width, currentImageCanvas.height);
    currentImgSnap.getContext('2d')?.drawImage(currentImageCanvas, 0, 0);

    const maskCanvas = maskCanvasRef.current;
    const currentMaskSnap = createCanvas(maskCanvas.width, maskCanvas.height);
    currentMaskSnap.getContext('2d')?.drawImage(maskCanvas, 0, 0);

    redoRef.current.push({ imageSnapshot: currentImgSnap, maskSnapshot: currentMaskSnap });

    // Restore image
    const restoredImgCanvas = createCanvas(last.imageSnapshot.width, last.imageSnapshot.height);
    restoredImgCanvas.getContext('2d')?.drawImage(last.imageSnapshot, 0, 0);
    setCurrentImageCanvas(restoredImgCanvas);

    // Restore mask
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.drawImage(last.maskSnapshot, 0, 0);
    }

    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
    handleMaskChange();
  }, [currentImageCanvas]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoRef.current.length === 0) return;
    const next = redoRef.current.pop();
    if (!next || !currentImageCanvas || !maskCanvasRef.current) return;

    saveSnapshot();

    // Restore image
    const restoredImgCanvas = createCanvas(next.imageSnapshot.width, next.imageSnapshot.height);
    restoredImgCanvas.getContext('2d')?.drawImage(next.imageSnapshot, 0, 0);
    setCurrentImageCanvas(restoredImgCanvas);

    // Restore mask
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.drawImage(next.maskSnapshot, 0, 0);
    }

    setCanRedo(redoRef.current.length > 0);
    handleMaskChange();
  }, [currentImageCanvas, saveSnapshot]);

  // Reset to original image
  const handleReset = () => {
    if (!originalImage) return;
    saveSnapshot();

    const baseCanvas = createCanvas(
      originalImage.naturalWidth || originalImage.width,
      originalImage.naturalHeight || originalImage.height
    );
    baseCanvas.getContext('2d')?.drawImage(originalImage, 0, 0);
    setCurrentImageCanvas(baseCanvas);

    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      maskCanvas.getContext('2d')?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
    setHasMask(false);
    setActiveMaskPixels(0);
    setHasResult(false);

    setToast({
      id: Date.now().toString(),
      type: 'info',
      title: 'Reset to original',
      description: 'Restored original photo and cleared mask.',
    });
  };

  // Clear mask only
  const handleClearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      saveSnapshot();
      maskCanvas.getContext('2d')?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      setHasMask(false);
      setActiveMaskPixels(0);
    }
  };

  // Execute AI Object Removal
  const handleRemoveObject = async () => {
    if (!currentImageCanvas || !maskCanvasRef.current || !hasMask) return;

    try {
      saveSnapshot();
      const maskCanvas = maskCanvasRef.current;

      const resultCanvas = await runInpainting(
        currentImageCanvas,
        maskCanvas,
        (progress) => {
          setModelProgress(progress);
        }
      );

      // Update engine mode indicator
      setEngineMode(getActiveEngine());

      // Update current image canvas with result
      setCurrentImageCanvas(resultCanvas);
      setHasResult(true);

      // Clear mask after successful removal
      maskCanvas.getContext('2d')?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      setHasMask(false);
      setActiveMaskPixels(0);

      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Object removed. Looks clean.',
        description: '100% artifact free · client-side inference',
        duration: 4000,
      });
    } catch (err) {
      console.error('Inpainting error:', err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Removal failed',
        description: (err as Error).message || 'An error occurred during inference.',
      });
    } finally {
      setModelProgress(null);
    }
  };

  // Download cleaned image
  const handleDownload = () => {
    if (!currentImageCanvas) return;
    const name = imageMetadata?.name ? `pixelfix-${imageMetadata.name}` : 'pixelfix-cleaned.png';
    downloadCanvas(currentImageCanvas, name);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      title: 'Download complete',
      description: 'Saved high-res cleaned image.',
    });
  };

  // Hotkeys: ⌘Z (Undo), ⌘⇧Z (Redo), Enter (Remove), B/E (Brush/Eraser), [ / ] (Size)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key === 'Enter' && hasMask && !modelProgress) {
        e.preventDefault();
        handleRemoveObject();
      } else if (e.key.toLowerCase() === 'b') {
        setToolMode('brush');
      } else if (e.key.toLowerCase() === 'e') {
        setToolMode('eraser');
      } else if (e.key === '[') {
        setBrushSize((s) => Math.max(APP_CONFIG.brush.minSize, s - 6));
      } else if (e.key === ']') {
        setBrushSize((s) => Math.min(APP_CONFIG.brush.maxSize, s + 6));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, hasMask, modelProgress, handleUndo, handleRedo]);

  const isProcessing = Boolean(
    modelProgress && (modelProgress.status === 'downloading' || modelProgress.status === 'processing')
  );

  return (
    <div className="flex flex-col w-full h-screen bg-[#0A0A0B] text-[#EDEDED] overflow-hidden select-none">
      {/* Top Bar Navigation */}
      <Toolbar
        canUndo={canUndo}
        canRedo={canRedo}
        hasMask={hasMask}
        metadata={imageMetadata}
        engineMode={engineMode}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        onNewImage={() => {
          setOriginalImage(null);
          setCurrentImageCanvas(null);
        }}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row w-full h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {originalImage ? (
          <>
            {/* Left 65%: Brush Canvas Stage */}
            <div className="relative flex-1 h-full min-w-0 flex flex-col">
              <BrushCanvas
                originalImage={originalImage}
                currentImageCanvas={currentImageCanvas}
                maskCanvasRef={maskCanvasRef}
                toolMode={toolMode}
                brushSize={brushSize}
                isProcessing={isProcessing}
                hasResult={hasResult}
                onMaskChange={handleMaskChange}
                onSaveSnapshot={saveSnapshot}
              />
            </div>

            {/* Right 35%: Fixed 380px Control Panel */}
            <ControlPanel
              toolMode={toolMode}
              setToolMode={setToolMode}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              hasMask={hasMask}
              hasResult={hasResult}
              isProcessing={isProcessing}
              onClearMask={handleClearMask}
              onRemoveObject={handleRemoveObject}
              onDownload={handleDownload}
              onNewImage={() => {
                setOriginalImage(null);
                setCurrentImageCanvas(null);
              }}
              activeMaskPixels={activeMaskPixels}
            />
          </>
        ) : (
          /* Empty Stage: Upload Zone */
          <div className="flex-1 flex items-center justify-center p-6 bg-[#0A0A0B]">
            <UploadZone onImageSelected={loadImageSource} />
          </div>
        )}

        {/* Neural Loading & Progress Overlay */}
        <LoadingOverlay progress={modelProgress} />

        {/* Floating Toast Notification */}
        <Toast toast={toast} onDismiss={() => setToast(null)} onUndo={handleUndo} />
      </main>
    </div>
  );
};
