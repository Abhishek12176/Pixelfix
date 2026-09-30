import { createCanvas, resizeToCanvas, compositeInpaintedResult } from './canvasUtils';
import { APP_CONFIG } from './constants';
import { ModelProgress } from '@/types';

type OrtType = typeof import('onnxruntime-web');

let ortModule: OrtType | null = null;
let activeSession: import('onnxruntime-web').InferenceSession | null = null;
let isInitializing = false;

export let activeProvider: 'wasm' | 'webgpu' = 'wasm';

export function getActiveEngine(): string {
  return activeProvider === 'webgpu' ? 'LaMa (WebGPU)' : 'LaMa (CPU Mode)';
}

async function getOrt(): Promise<OrtType> {
  if (typeof window === 'undefined') {
    throw new Error('ONNX inference runs exclusively client-side in the browser');
  }

  if (ortModule) return ortModule;

  // 1. Check window.ort (loaded via layout Script from 1.19.2 CDN)
  if ((window as any).ort) {
    ortModule = (window as any).ort as OrtType;
  } else {
    // 2. Load script dynamically
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort.all.min.js';
      script.onload = () => {
        ortModule = (window as any).ort as OrtType;
        resolve();
      };
      script.onerror = (e) => reject(new Error('Failed to load onnxruntime-web: ' + e));
      document.head.appendChild(script);
    });
  }

  if (!ortModule) {
    throw new Error('Could not initialize onnxruntime-web global');
  }

  // Configure WASM paths and optimize thread count safely
  ortModule.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/';

  const canUseMultiThreads =
    typeof window !== 'undefined' &&
    typeof SharedArrayBuffer !== 'undefined' &&
    typeof crossOriginIsolated !== 'undefined' &&
    crossOriginIsolated;

  const threads = canUseMultiThreads
    ? Math.min(4, Math.max(1, (navigator.hardwareConcurrency || 4) - 1))
    : 1;

  ortModule.env.wasm.numThreads = threads;
  ortModule.env.wasm.simd = true;
  ortModule.env.wasm.proxy = false;

  return ortModule;
}

/**
 * Downloads model with streaming progress reporting and CacheStorage caching.
 */
async function fetchModelBufferWithProgress(
  onProgress?: (progress: ModelProgress) => void
): Promise<ArrayBuffer> {
  const cacheName = 'pixelfix-v1-models';
  const localUrl = APP_CONFIG.model.localUrl;
  const cdnUrl = APP_CONFIG.model.cdnUrl;

  // 1. Check browser Cache API first
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(cacheName);
      const cachedResponse = (await cache.match(localUrl)) || (await cache.match(cdnUrl));
      if (cachedResponse) {
        onProgress?.({
          status: 'downloading',
          progress: 100,
          stage: 'Loading cached AI model from disk...',
          downloadedMB: APP_CONFIG.model.sizeMB,
          totalMB: APP_CONFIG.model.sizeMB,
        });
        return await cachedResponse.arrayBuffer();
      }
    } catch {
      console.warn('CacheStorage read failed, falling back to network fetch');
    }
  }

  // 2. Network fetch with fallback (local -> CDN)
  let response: Response | null = null;
  let chosenUrl = localUrl;

  onProgress?.({
    status: 'downloading',
    progress: 5,
    stage: 'Connecting to neural model stream...',
    downloadedMB: 0,
    totalMB: APP_CONFIG.model.sizeMB,
  });

  try {
    const headCheck = await fetch(localUrl, { method: 'HEAD' });
    if (headCheck.ok) {
      response = await fetch(localUrl);
      chosenUrl = localUrl;
    }
  } catch {
    // local fetch failed, will try CDN
  }

  if (!response || !response.ok) {
    try {
      response = await fetch(cdnUrl);
      chosenUrl = cdnUrl;
    } catch (err) {
      throw new Error(`Failed to download model from ${cdnUrl}: ${(err as Error).message}`);
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP error downloading model: ${response.status} ${response.statusText}`);
  }

  const contentLengthHeader = response.headers.get('content-length');
  const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : APP_CONFIG.model.sizeBytes;
  const totalMB = Number((totalBytes / (1024 * 1024)).toFixed(1));

  // Stream reader for granular progress
  const reader = response.body?.getReader();
  if (!reader) {
    const buffer = await response.arrayBuffer();
    return buffer;
  }

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      receivedBytes += value.length;
      const pct = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
      const downloadedMB = Number((receivedBytes / (1024 * 1024)).toFixed(1));

      onProgress?.({
        status: 'downloading',
        progress: pct,
        stage: `Downloading AI model (${downloadedMB} MB / ${totalMB} MB)...`,
        downloadedMB,
        totalMB,
      });
    }
  }

  // Combine chunks into single ArrayBuffer
  const allChunks = new Uint8Array(receivedBytes);
  let position = 0;
  for (const chunk of chunks) {
    allChunks.set(chunk, position);
    position += chunk.length;
  }

  // Store in Cache API for instant 0-second reloads
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(cacheName);
      await cache.put(
        chosenUrl,
        new Response(allChunks.buffer, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': receivedBytes.toString(),
          },
        })
      );
    } catch (e) {
      console.warn('Could not persist model into CacheStorage:', e);
    }
  }

  return allChunks.buffer;
}

/**
 * Initializes and caches the ONNX Inference Session
 */
export async function getInpaintingSession(
  onProgress?: (progress: ModelProgress) => void
): Promise<import('onnxruntime-web').InferenceSession> {
  if (activeSession) return activeSession;

  if (isInitializing) {
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (activeSession) return activeSession;
  }

  isInitializing = true;
  try {
    const ort = await getOrt();
    const modelBuffer = await fetchModelBufferWithProgress(onProgress);

    onProgress?.({
      status: 'downloading',
      progress: 99,
      stage: 'Initializing neural pipeline...',
      downloadedMB: APP_CONFIG.model.sizeMB,
      totalMB: APP_CONFIG.model.sizeMB,
    });

    // STEP 1: Force WASM for universal compatibility and rock-solid stability
    console.log(`[ONNX] Initializing session with WASM provider (simd: true, threads: ${ort.env.wasm.numThreads})...`);
    activeSession = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    activeProvider = 'wasm';
    console.log('[ONNX] Neural model ready on WASM (CPU Mode)');

    onProgress?.({
      status: 'idle',
      progress: 100,
      stage: 'Neural model ready',
    });

    return activeSession;
  } finally {
    isInitializing = false;
  }
}

/**
 * Executes LaMa inpainting on the provided source image and mask canvases.
 * 1. Resizes both to 512x512.
 * 2. Normalizes image to [0, 1] and mask to binary 0/1.
 * 3. Runs ONNX session.
 * 4. De-normalizes output tensor and composites with 15px feathering.
 */
export async function runInpainting(
  originalImageCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  onProgress?: (progress: ModelProgress) => void
): Promise<HTMLCanvasElement> {
  const startTime = performance.now();
  const ort = await getOrt();
  const session = await getInpaintingSession(onProgress);

  onProgress?.({
    status: 'processing',
    progress: 25,
    stage: 'Removing with LaMa...',
  });

  const dim = 512;
  const numPixels = dim * dim;

  // 1. Resize image and mask to 512x512
  const resizedImgCanvas = resizeToCanvas(originalImageCanvas, dim, dim);
  const resizedMaskCanvas = resizeToCanvas(maskCanvas, dim, dim);

  const imgCtx = resizedImgCanvas.getContext('2d')!;
  const maskCtx = resizedMaskCanvas.getContext('2d')!;

  const imgData = imgCtx.getImageData(0, 0, dim, dim);
  const maskData = maskCtx.getImageData(0, 0, dim, dim);

  const imgPixels = imgData.data;
  const maskPixels = maskData.data;

  // STEP 1: Verify ONNX Model I/O
  const inputNames = session.inputNames;
  const outputNames = session.outputNames;
  console.log('ONNX Model Inputs:', inputNames);
  console.log('ONNX Model Outputs:', outputNames);

  // STEP 2: Pre-processing (Input Tensors)
  const feeds: Record<string, import('onnxruntime-web').Tensor> = {};

  if (inputNames.length === 1) {
    // 4-channel unified input: [1, 4, 512, 512]
    // Ch 0-2: RGB in [0, 1] with masked area zeroed out (critical for LaMa inpainting)
    // Ch 3: Mask in [0, 1] where 1.0 represents masked area (to remove) and 0.0 is background
    const tensorData = new Float32Array(1 * 4 * numPixels);
    const rOffset = 0;
    const gOffset = numPixels;
    const bOffset = 2 * numPixels;
    const mOffset = 3 * numPixels;

    for (let i = 0; i < numPixels; i++) {
      const idx = i * 4;
      const ma = maskPixels[idx + 3];
      const mr = maskPixels[idx];
      const mg = maskPixels[idx + 1];
      const mb = maskPixels[idx + 2];

      // Detect masked pixel: works with transparent canvas + colored/white brush, or solid B&W mask
      let isMasked = false;
      if (ma >= 15) {
        const rgbMax = Math.max(mr, mg, mb);
        if (rgbMax >= 15) {
          isMasked = true;
        }
      }

      const m = isMasked ? 1.0 : 0.0;
      // Zero out RGB in the masked area so the neural net inpaints it cleanly
      const r = isMasked ? 0.0 : imgPixels[idx] / 255.0;
      const g = isMasked ? 0.0 : imgPixels[idx + 1] / 255.0;
      const b = isMasked ? 0.0 : imgPixels[idx + 2] / 255.0;

      tensorData[rOffset + i] = r;
      tensorData[gOffset + i] = g;
      tensorData[bOffset + i] = b;
      tensorData[mOffset + i] = m;
    }

    feeds[inputNames[0]] = new ort.Tensor('float32', tensorData, [1, 4, dim, dim]);
  } else {
    // Separate image [1, 3, 512, 512] and mask [1, 1, 512, 512]
    const imgTensorData = new Float32Array(1 * 3 * numPixels);
    const maskTensorData = new Float32Array(1 * 1 * numPixels);

    const rOffset = 0;
    const gOffset = numPixels;
    const bOffset = 2 * numPixels;

    for (let i = 0; i < numPixels; i++) {
      const idx = i * 4;
      const ma = maskPixels[idx + 3];
      const mr = maskPixels[idx];
      const mg = maskPixels[idx + 1];
      const mb = maskPixels[idx + 2];

      let isMasked = false;
      if (ma >= 15) {
        const rgbMax = Math.max(mr, mg, mb);
        if (rgbMax >= 15) {
          isMasked = true;
        }
      }

      const m = isMasked ? 1.0 : 0.0;
      const r = isMasked ? 0.0 : imgPixels[idx] / 255.0;
      const g = isMasked ? 0.0 : imgPixels[idx + 1] / 255.0;
      const b = isMasked ? 0.0 : imgPixels[idx + 2] / 255.0;

      imgTensorData[rOffset + i] = r;
      imgTensorData[gOffset + i] = g;
      imgTensorData[bOffset + i] = b;
      maskTensorData[i] = m;
    }

    const imgInputName =
      inputNames.find((n) => /image|img/i.test(n)) || inputNames[0];
    const maskInputName =
      inputNames.find((n) => /mask/i.test(n)) || inputNames[1];

    feeds[imgInputName] = new ort.Tensor('float32', imgTensorData, [1, 3, dim, dim]);
    feeds[maskInputName] = new ort.Tensor('float32', maskTensorData, [1, 1, dim, dim]);
  }

  onProgress?.({
    status: 'processing',
    progress: 60,
    stage: 'Removing with LaMa...',
  });

  // STEP 3: Run inference & Fix Post-processing
  let results: Record<string, import('onnxruntime-web').Tensor>;
  try {
    results = await session.run(feeds);
  } catch (runErr) {
    console.warn('[ONNX] Inference run failed with current session, falling back to safe single-thread WASM:', runErr);
    ort.env.wasm.numThreads = 1;
    const modelBuffer = await fetchModelBufferWithProgress(onProgress);
    activeSession = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    activeProvider = 'wasm';
    results = await activeSession.run(feeds);
  }

  onProgress?.({
    status: 'processing',
    progress: 85,
    stage: 'Blending seamless background...',
  });

  const outputName = session.outputNames[0];
  const outputTensor = results[outputName];
  const outData = outputTensor.data as Float32Array;

  // CRITICAL: Compute min and max values safely without call stack overflow
  let minVal = Infinity;
  let maxVal = -Infinity;
  let hasNaN = false;
  for (let i = 0; i < outData.length; i++) {
    const val = outData[i];
    if (isNaN(val)) {
      hasNaN = true;
    } else {
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
    }
  }

  console.log('Output Min/Max:', minVal, maxVal);
  if (hasNaN) {
    console.warn('Warning: Model output tensor contains NaN values.');
  }

  const out512Canvas = createCanvas(dim, dim);
  const out512Ctx = out512Canvas.getContext('2d')!;
  const out512ImgData = out512Ctx.createImageData(dim, dim);
  const out512Pixels = out512ImgData.data;

  // Check if output is in [-1, 1] range or [0, 1] range
  const isMinusOneToOne = minVal < -0.1;
  const isZeroToOne = !isMinusOneToOne && maxVal <= 2.0;

  const outR = 0;
  const outG = numPixels;
  const outB = 2 * numPixels;

  for (let i = 0; i < numPixels; i++) {
    let r = outData[outR + i];
    let g = outData[outG + i];
    let b = outData[outB + i];

    if (isMinusOneToOne) {
      r = ((r + 1.0) / 2.0) * 255.0;
      g = ((g + 1.0) / 2.0) * 255.0;
      b = ((b + 1.0) / 2.0) * 255.0;
    } else if (isZeroToOne) {
      r = r * 255.0;
      g = g * 255.0;
      b = b * 255.0;
    }

    const idx = i * 4;
    out512Pixels[idx] = Math.min(255, Math.max(0, Math.round(r)));
    out512Pixels[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
    out512Pixels[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
    out512Pixels[idx + 3] = 255;
  }
  out512Ctx.putImageData(out512ImgData, 0, 0);

  // STEP 4: Composite and blend back to original dimensions
  const compositedCanvas = compositeInpaintedResult(originalImageCanvas, out512Canvas, maskCanvas);

  const elapsedMs = Math.round(performance.now() - startTime);

  onProgress?.({
    status: 'done',
    progress: 100,
    stage: 'Finished',
    elapsedMs,
  });

  return compositedCanvas;
}
