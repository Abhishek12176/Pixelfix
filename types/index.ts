export interface Point {
  x: number;
  y: number;
}

export type ToolMode = 'brush' | 'eraser' | 'pan';

export type InpaintingStatus = 'idle' | 'downloading' | 'processing' | 'done' | 'error';

export interface ModelProgress {
  status: InpaintingStatus;
  progress: number; // 0 to 100
  stage: string;
  downloadedMB?: number;
  totalMB?: number;
  error?: string;
  elapsedMs?: number;
}

export interface ImageMetadata {
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
  aspectRatio: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}
