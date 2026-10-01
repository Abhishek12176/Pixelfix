import * as ort from 'onnxruntime-web';
import { ModelProgress } from '@/types';
import { APP_CONFIG } from '@/lib/constants';

// Configure WASM paths safely to official CDN matching onnxruntime-web
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.0/dist/';
ort.env.wasm.numThreads = 1;
ort.env.wasm.simd = true;
ort.env.wasm.proxy = false;

let activeSession: ort.InferenceSession | null = null;
let isInitializing = false;

/**
 * Downloads model with streaming progress reporting and CacheStorage caching in the worker.
 */
async function fetchModelBufferWithProgress(
  onProgress?: (progress: ModelProgress) => void
): Promise<ArrayBuffer> {
  const cacheName = 'pixelfix-v1-models';
  const localUrl = APP_CONFIG.model.localUrl;
  const cdnUrl = APP_CONFIG.model.cdnUrl;

  // 1. Check Cache API first
  if (typeof self !== 'undefined' && 'caches' in self) {
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
      console.warn('CacheStorage read failed in worker, falling back to network fetch');
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

  const allChunks = new Uint8Array(receivedBytes);
  let position = 0;
  for (const chunk of chunks) {
    allChunks.set(chunk, position);
    position += chunk.length;
  }

  // Store in Cache API
  if (typeof self !== 'undefined' && 'caches' in self) {
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
      console.warn('Could not persist model into CacheStorage in worker:', e);
    }
  }

  return allChunks.buffer;
}

/**
 * Initializes and caches the ONNX Inference Session inside the worker.
 */
async function getInpaintingSession(
  onProgress?: (progress: ModelProgress) => void
): Promise<ort.InferenceSession> {
  if (activeSession) return activeSession;

  if (isInitializing) {
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (activeSession) return activeSession;
  }

  isInitializing = true;
  try {
    const modelBuffer = await fetchModelBufferWithProgress(onProgress);

    onProgress?.({
      status: 'downloading',
      progress: 99,
      stage: 'Initializing neural pipeline...',
      downloadedMB: APP_CONFIG.model.sizeMB,
      totalMB: APP_CONFIG.model.sizeMB,
    });

    console.log('[Worker] Initializing ONNX session with WASM provider...');
    activeSession = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    console.log('[Worker] Neural model ready on WASM');

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
 * Execute inpainting inference on 512x512 RGBA pixel buffers
 */
async function executeInpainting(
  imgPixels: Uint8ClampedArray,
  maskPixels: Uint8ClampedArray,
  onProgress: (progress: ModelProgress) => void
): Promise<{ outputPixels: Uint8ClampedArray; elapsedMs: number }> {
  const startTime = performance.now();
  const session = await getInpaintingSession(onProgress);

  onProgress({
    status: 'processing',
    progress: 25,
    stage: 'Removing with LaMa...',
  });

  const dim = 512;
  const numPixels = dim * dim;
  const inputNames = session.inputNames;
  const feeds: Record<string, ort.Tensor> = {};

  if (inputNames.length === 1) {
    // 4-channel unified input: [1, 4, 512, 512]
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

    const imgInputName = inputNames.find((n) => /image|img/i.test(n)) || inputNames[0];
    const maskInputName = inputNames.find((n) => /mask/i.test(n)) || inputNames[1];

    feeds[imgInputName] = new ort.Tensor('float32', imgTensorData, [1, 3, dim, dim]);
    feeds[maskInputName] = new ort.Tensor('float32', maskTensorData, [1, 1, dim, dim]);
  }

  onProgress({
    status: 'processing',
    progress: 60,
    stage: 'Removing with LaMa...',
  });

  const results = await session.run(feeds);

  onProgress({
    status: 'processing',
    progress: 85,
    stage: 'Blending seamless background...',
  });

  const outputName = session.outputNames[0];
  const outputTensor = results[outputName];
  const outData = outputTensor.data as Float32Array;

  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < outData.length; i++) {
    const val = outData[i];
    if (!isNaN(val)) {
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
    }
  }

  const isMinusOneToOne = minVal < -0.1;
  const isZeroToOne = !isMinusOneToOne && maxVal <= 2.0;

  const outPixels = new Uint8ClampedArray(numPixels * 4);
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
    outPixels[idx] = Math.min(255, Math.max(0, Math.round(r)));
    outPixels[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
    outPixels[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
    outPixels[idx + 3] = 255;
  }

  const elapsedMs = Math.round(performance.now() - startTime);
  return { outputPixels: outPixels, elapsedMs };
}

// Worker message listener
self.onmessage = async (e: MessageEvent) => {
  const { type, id } = e.data;

  if (type === 'PING') {
    self.postMessage({ type: 'PONG', id });
    return;
  }

  if (type === 'INPAINT') {
    const { imgBuffer, maskBuffer, width, height } = e.data;
    const imgPixels = new Uint8ClampedArray(imgBuffer);
    const maskPixels = new Uint8ClampedArray(maskBuffer);

    try {
      const { outputPixels, elapsedMs } = await executeInpainting(
        imgPixels,
        maskPixels,
        (progress) => {
          self.postMessage({ type: 'PROGRESS', id, progress });
        }
      );

      // Return result with transferable buffer for zero-overhead communication
      (self as any).postMessage(
        {
          type: 'SUCCESS',
          id,
          outputBuffer: outputPixels.buffer,
          width,
          height,
          elapsedMs,
        },
        [outputPixels.buffer]
      );
    } catch (err) {
      console.error('[Worker] Inpainting error:', err);
      self.postMessage({
        type: 'ERROR',
        id,
        error: (err as Error).message || 'Inference error in worker',
      });
    }
  }
};
