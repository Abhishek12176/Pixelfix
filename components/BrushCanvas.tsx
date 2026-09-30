'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolMode, Point } from '@/types';
import { APP_CONFIG } from '@/lib/constants';
import { BeforeAfterToggle } from './BeforeAfterToggle';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface BrushCanvasProps {
  originalImage: HTMLImageElement | null;
  currentImageCanvas: HTMLCanvasElement | null;
  maskCanvasRef: React.RefObject<HTMLCanvasElement>;
  toolMode: ToolMode;
  brushSize: number;
  isProcessing: boolean;
  hasResult: boolean;
  onMaskChange: () => void;
  onSaveSnapshot: () => void;
}

export const BrushCanvas: React.FC<BrushCanvasProps> = ({
  originalImage,
  currentImageCanvas,
  maskCanvasRef,
  toolMode,
  brushSize,
  isProcessing,
  hasResult,
  onMaskChange,
  onSaveSnapshot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction & Drawing state
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const [isCursorInside, setIsCursorInside] = useState(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);

  // Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });

  // Compare split slider state (0 to 100)
  const [compareSplit, setCompareSplit] = useState(50);
  const [isSplitDragging, setIsSplitDragging] = useState(false);

  // Sync image canvas to display canvas whenever currentImageCanvas updates
  useEffect(() => {
    if (!originalImage) return;

    const imgWidth = originalImage.naturalWidth || originalImage.width;
    const imgHeight = originalImage.naturalHeight || originalImage.height;

    // Initialize or resize mask canvas to match natural image dimensions
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas && (maskCanvas.width !== imgWidth || maskCanvas.height !== imgHeight)) {
      maskCanvas.width = imgWidth;
      maskCanvas.height = imgHeight;
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        maskCtx.clearRect(0, 0, imgWidth, imgHeight);
      }
    }

    // Render current image onto display canvas
    const displayCanvas = displayCanvasRef.current;
    if (displayCanvas) {
      displayCanvas.width = imgWidth;
      displayCanvas.height = imgHeight;
      const ctx = displayCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, imgWidth, imgHeight);
        if (isHoldingOriginal) {
          ctx.drawImage(originalImage, 0, 0);
        } else if (currentImageCanvas) {
          ctx.drawImage(currentImageCanvas, 0, 0);
        } else {
          ctx.drawImage(originalImage, 0, 0);
        }
      }
    }
  }, [originalImage, currentImageCanvas, isHoldingOriginal, maskCanvasRef]);

  // Coordinates helper mapping screen client coordinates to internal canvas pixels
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number): Point | null => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Drawing routines
  const drawStroke = (to: Point) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || !lastPoint.current) return;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = brushSize;

    if (toolMode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.85)';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.85)';
    }

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Fill endpoint circle for smooth brush cap
    ctx.beginPath();
    ctx.arc(to.x, to.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    lastPoint.current = to;
    onMaskChange();
  };

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isProcessing) return;
    const pt = getCanvasCoordinates(e.clientX, e.clientY);
    if (!pt) return;

    isDrawing.current = true;
    lastPoint.current = pt;

    // Draw single dot on click
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      const ctx = maskCanvas.getContext('2d');
      if (ctx) {
        ctx.save();
        if (toolMode === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = 'rgba(59, 130, 246, 0.85)';
        }
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        onMaskChange();
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });

    if (!isDrawing.current || isProcessing) return;
    const pt = getCanvasCoordinates(e.clientX, e.clientY);
    if (!pt) return;

    drawStroke(pt);
  };

  const handlePointerUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      lastPoint.current = null;
      onSaveSnapshot();
    }
  };

  // Calculate visual scale of brush on screen
  const getScreenBrushSize = () => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return brushSize;
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / canvas.width;
    return Math.max(6, brushSize * scale);
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={() => setIsCursorInside(true)}
      onPointerLeave={() => {
        setIsCursorInside(false);
        handlePointerUp();
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative flex-1 w-full h-full min-h-[500px] overflow-hidden flex items-center justify-center bg-[#0A0A0B] select-none cursor-none"
      style={{
        backgroundImage: `radial-gradient(rgba(202, 190, 255, 0.08) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Floating Controls: Hold to compare + Zoom */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
        {hasResult && (
          <BeforeAfterToggle
            isHolding={isHoldingOriginal}
            setIsHolding={setIsHoldingOriginal}
            disabled={isProcessing}
          />
        )}

        <div className="flex items-center bg-[#1C1C1F]/90 backdrop-blur-md border border-white/10 p-0.5 rounded-full shadow-lg">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-on-surface px-1 min-w-[42px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
            className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors ml-0.5"
            title="Reset Zoom (Fit)"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        className="relative shadow-[0_24px_64px_rgba(0,0,0,0.85)] rounded-xl overflow-hidden transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          maxWidth: '92%',
          maxHeight: '82vh',
        }}
      >
        {/* Layer 1: Base Image Canvas */}
        <canvas
          ref={displayCanvasRef}
          className="block max-h-[76vh] max-w-full w-auto h-auto object-contain pointer-events-none select-none rounded-xl"
        />

        {/* Layer 2: Mask Canvas (User brushes here - vibrant blue overlay) */}
        <canvas
          ref={maskCanvasRef}
          onPointerDown={handlePointerDown}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-auto select-none rounded-xl touch-none ${
            isHoldingOriginal ? 'opacity-0' : 'opacity-90'
          }`}
          style={{
            filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))',
          }}
        />
      </div>

      {/* Custom Circular Brush Cursor Tracker */}
      {isCursorInside && cursorPos && !isProcessing && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
          }}
        >
          <div
            className={`rounded-full border transition-all duration-75 ${
              toolMode === 'eraser'
                ? 'border-white/80 bg-white/15'
                : 'border-blue-400 bg-blue-500/25 shadow-[0_0_12px_rgba(59,130,246,0.5)]'
            }`}
            style={{
              width: `${getScreenBrushSize()}px`,
              height: `${getScreenBrushSize()}px`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}
    </div>
  );
};
