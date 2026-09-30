export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

/**
 * Checks if a mask canvas has any painted pixels (alpha > 20 or white value > 50).
 */
export function hasMaskPixels(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx || canvas.width === 0 || canvas.height === 0) return false;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 16) {
    // Check if pixel is white or has alpha
    if (data[i + 3] > 20 && (data[i] > 30 || data[i + 1] > 30 || data[i + 2] > 30)) {
      return true;
    }
  }
  return false;
}

/**
 * Count painted mask pixels
 */
export function countMaskPixels(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d');
  if (!ctx || canvas.width === 0 || canvas.height === 0) return 0;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 20 && (data[i] > 30 || data[i + 1] > 30 || data[i + 2] > 30)) {
      count++;
    }
  }
  return count;
}

/**
 * Resizes an image or canvas to exactly targetWidth x targetHeight using high-quality smoothing
 */
export function resizeToCanvas(
  source: CanvasImageSource,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  return canvas;
}

/**
 * STEP 4: Canvas Blending (The White Patch Fix)
 * Scales the 512x512 AI output back to the original image size and blends seamlessly:
 * 1. Draw original image on a temporary canvas.
 * 2. Draw AI output (512x512) onto another temporary canvas.
 * 3. Scale AI output canvas up to original image dimensions.
 * 4. Create new ImageData from the original image.
 * 5. Loop through every pixel. Get corresponding pixel from scaled AI output AND the mask.
 * 6. If mask pixel is white (masked), replace original pixel with AI pixel.
 * 7. If mask pixel is black/transparent (unmasked), keep original pixel.
 * 8. Put final blended ImageData back onto the main canvas.
 */
export function compositeInpaintedResult(
  originalCanvas: HTMLCanvasElement,
  inpainted512Canvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement
): HTMLCanvasElement {
  const width = originalCanvas.width;
  const height = originalCanvas.height;

  // 1. Draw the original image on a temporary canvas
  const origCanvas = createCanvas(width, height);
  const origCtx = origCanvas.getContext('2d')!;
  origCtx.drawImage(originalCanvas, 0, 0);

  // 2 & 3. Draw AI output (512x512) onto another temporary canvas, scaled up to original image dimensions
  const aiCanvas = createCanvas(width, height);
  const aiCtx = aiCanvas.getContext('2d')!;
  aiCtx.imageSmoothingEnabled = true;
  aiCtx.imageSmoothingQuality = 'high';
  aiCtx.drawImage(inpainted512Canvas, 0, 0, width, height);

  // Scale mask canvas to original image dimensions if dimensions differ
  let scaledMask = maskCanvas;
  if (maskCanvas.width !== width || maskCanvas.height !== height) {
    scaledMask = createCanvas(width, height);
    const scaledMaskCtx = scaledMask.getContext('2d')!;
    scaledMaskCtx.imageSmoothingEnabled = true;
    scaledMaskCtx.drawImage(maskCanvas, 0, 0, width, height);
  }
  const maskCtx = scaledMask.getContext('2d')!;

  // 4. Create ImageData for original, AI, and mask
  const origImgData = origCtx.getImageData(0, 0, width, height);
  const aiImgData = aiCtx.getImageData(0, 0, width, height);
  const maskImgData = maskCtx.getImageData(0, 0, width, height);

  const origPixels = origImgData.data;
  const aiPixels = aiImgData.data;
  const maskPixels = maskImgData.data;

  // Final canvas and ImageData
  const finalCanvas = createCanvas(width, height);
  const finalCtx = finalCanvas.getContext('2d')!;
  const finalImgData = finalCtx.createImageData(width, height);
  const finalPixels = finalImgData.data;

  const totalPixels = width * height;

  // 5. Loop through every pixel. Get corresponding pixel from scaled AI output AND the mask
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;

    const ma = maskPixels[idx + 3];
    const mr = maskPixels[idx];
    const mg = maskPixels[idx + 1];
    const mb = maskPixels[idx + 2];

    // Determine mask weight: 0.0 (unmasked / keep original) to 1.0 (masked / replace with AI)
    // Supports transparent canvas with colored/white brush strokes as well as solid B&W masks
    let weight = 0.0;
    if (ma >= 15) {
      const rgbMax = Math.max(mr, mg, mb);
      if (rgbMax >= 15) {
        // If solid B&W mask (black background = 0), rgbMax > 15 is white
        // If transparent canvas with brush stroke, alpha and color intensity determine weight
        weight = Math.min(1.0, Math.max(rgbMax / 255.0, ma / 255.0));
      }
    }

    if (weight <= 0.02) {
      // 7. If mask pixel is black/transparent (unmasked), keep original pixel
      finalPixels[idx] = origPixels[idx];
      finalPixels[idx + 1] = origPixels[idx + 1];
      finalPixels[idx + 2] = origPixels[idx + 2];
      finalPixels[idx + 3] = origPixels[idx + 3];
    } else if (weight >= 0.98) {
      // 6. If mask pixel is white (masked), replace original pixel with AI pixel
      finalPixels[idx] = aiPixels[idx];
      finalPixels[idx + 1] = aiPixels[idx + 1];
      finalPixels[idx + 2] = aiPixels[idx + 2];
      finalPixels[idx + 3] = 255;
    } else {
      // Smooth linear transition at mask edges for flawless, artifact-free boundary blending
      finalPixels[idx] = Math.round(origPixels[idx] * (1 - weight) + aiPixels[idx] * weight);
      finalPixels[idx + 1] = Math.round(origPixels[idx + 1] * (1 - weight) + aiPixels[idx + 1] * weight);
      finalPixels[idx + 2] = Math.round(origPixels[idx + 2] * (1 - weight) + aiPixels[idx + 2] * weight);
      finalPixels[idx + 3] = 255;
    }
  }

  // 8. Put final blended ImageData back onto the main canvas
  finalCtx.putImageData(finalImgData, 0, 0);
  return finalCanvas;
}

/**
 * Triggers browser download of a canvas as PNG
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename = 'pixelfix-cleaned.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
