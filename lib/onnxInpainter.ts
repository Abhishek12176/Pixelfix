import { createCanvas, resizeToCanvas, compositeInpaintedResult } from './canvasUtils';
import { ModelProgress } from '@/types';

export let activeProvider: 'wasm' = 'wasm';

export function getActiveEngine(): string {
  return 'LaMa (Web Worker WASM)';
}

let workerInstance: Worker | null = null;

/**
 * Instantiates or retrieves the singleton Web Worker for ONNX inpainting.
 */
export function getInpainterWorker(): Worker {
  if (typeof window === 'undefined') {
    throw new Error('ONNX inference runs exclusively client-side in the browser');
  }

  if (!workerInstance) {
    workerInstance = new Worker(new URL('../lib/inpainter.worker.ts', import.meta.url));
  }
  return workerInstance;
}

/**
 * Executes LaMa inpainting by offloading inference to the Web Worker.
 * 1. Resizes image & mask to 512x512 on the main thread (<1ms).
 * 2. Transfers pixel buffers to Web Worker for model fetching and inference.
 * 3. Receives inpainted 512x512 result and composites with feathering back to original dimensions.
 */
export async function runInpainting(
  originalImageCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  onProgress?: (progress: ModelProgress) => void,
  customWorker?: Worker
): Promise<HTMLCanvasElement> {
  const worker = customWorker || getInpainterWorker();

  const dim = 512;
  const resizedImgCanvas = resizeToCanvas(originalImageCanvas, dim, dim);
  const resizedMaskCanvas = resizeToCanvas(maskCanvas, dim, dim);

  const imgCtx = resizedImgCanvas.getContext('2d')!;
  const maskCtx = resizedMaskCanvas.getContext('2d')!;

  const imgData = imgCtx.getImageData(0, 0, dim, dim);
  const maskData = maskCtx.getImageData(0, 0, dim, dim);

  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    const handleMessage = (e: MessageEvent) => {
      const msg = e.data;
      if (!msg || msg.id !== requestId) return;

      if (msg.type === 'PROGRESS') {
        onProgress?.(msg.progress);
      } else if (msg.type === 'SUCCESS') {
        cleanup();
        try {
          const out512Canvas = createCanvas(dim, dim);
          const out512Ctx = out512Canvas.getContext('2d')!;
          const out512ImgData = out512Ctx.createImageData(dim, dim);
          const receivedPixels = new Uint8ClampedArray(msg.outputBuffer);
          out512ImgData.data.set(receivedPixels);
          out512Ctx.putImageData(out512ImgData, 0, 0);

          // Composite and blend back to original dimensions seamlessly
          const compositedCanvas = compositeInpaintedResult(
            originalImageCanvas,
            out512Canvas,
            maskCanvas
          );

          onProgress?.({
            status: 'done',
            progress: 100,
            stage: 'Finished',
            elapsedMs: msg.elapsedMs,
          });

          resolve(compositedCanvas);
        } catch (compositeErr) {
          reject(compositeErr);
        }
      } else if (msg.type === 'ERROR') {
        cleanup();
        reject(new Error(msg.error || 'Worker inpainting failed'));
      }
    };

    const handleError = (error: ErrorEvent) => {
      cleanup();
      reject(new Error(error.message || 'Worker encounter an error'));
    };

    const cleanup = () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    // Send buffers to worker using transferables for 0-copy performance
    const imgBuffer = imgData.data.buffer;
    const maskBuffer = maskData.data.buffer;

    worker.postMessage(
      {
        type: 'INPAINT',
        id: requestId,
        imgBuffer,
        maskBuffer,
        width: dim,
        height: dim,
      },
      [imgBuffer, maskBuffer]
    );
  });
}
