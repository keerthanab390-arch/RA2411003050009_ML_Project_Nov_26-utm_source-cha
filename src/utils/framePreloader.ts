/**
 * In-memory caching and preloading utilities for virtual try-on frame overlays.
 */

const preloadedUrls = new Set<string>();
const imageBitmaps = new Map<string, HTMLImageElement>();

/**
 * Check if a try-on frame asset is already cached and ready to render.
 */
export function isFramePreloaded(src: string | null | undefined): boolean {
  if (!src) return false;
  return preloadedUrls.has(src);
}

/**
 * Preload a single frame PNG image into memory.
 */
export function preloadFrameImage(src: string): Promise<HTMLImageElement> {
  if (!src) return Promise.reject(new Error('Invalid image source'));

  if (imageBitmaps.has(src)) {
    return Promise.resolve(imageBitmaps.get(src)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;

    img.onload = () => {
      preloadedUrls.add(src);
      imageBitmaps.set(src, img);
      resolve(img);
    };

    img.onerror = () => {
      // If /tryon/ failed, attempt standard frames fallback
      if (src.includes('/tryon/')) {
        const fallback = src.replace('/tryon/', '/');
        const fallbackImg = new Image();
        fallbackImg.decoding = 'async';
        fallbackImg.src = fallback;
        fallbackImg.onload = () => {
          preloadedUrls.add(src);
          preloadedUrls.add(fallback);
          imageBitmaps.set(src, fallbackImg);
          resolve(fallbackImg);
        };
        fallbackImg.onerror = () => resolve(img);
      } else {
        resolve(img);
      }
    };
  });
}

/**
 * Check if an image is already completely loaded by the browser engine.
 */
export function checkImageReady(src: string | null | undefined): boolean {
  if (!src) return false;
  if (preloadedUrls.has(src)) return true;
  if (typeof document === 'undefined') return false;

  const testImg = new Image();
  testImg.src = src;
  if (testImg.complete && testImg.naturalWidth > 0) {
    preloadedUrls.add(src);
    return true;
  }
  return false;
}

/**
 * Background preloader that warms all 41 try-on PNG assets in the catalogue.
 * Prioritizes the active frame, then loads remaining frames asynchronously.
 */
let hasScheduledPreload = false;

export function preloadAllTryOnFrames(priorityFrameIndex: number = 0): void {
  if (typeof window === 'undefined') return;
  if (hasScheduledPreload) return;
  hasScheduledPreload = true;

  // 1. Immediately preload the priority frame and adjacent 5 frames
  const queue: number[] = [];
  const start = Math.max(1, priorityFrameIndex - 2);
  const end = Math.min(41, priorityFrameIndex + 4);

  for (let i = start; i <= end; i++) {
    queue.push(i);
  }

  // 2. Queue remaining frames
  for (let i = 1; i <= 41; i++) {
    if (!queue.includes(i)) {
      queue.push(i);
    }
  }

  let currentIndex = 0;
  const loadNext = () => {
    if (currentIndex >= queue.length) return;
    const num = String(queue[currentIndex]).padStart(2, '0');
    currentIndex++;

    preloadFrameImage(`/images/frames/tryon/frame${num}.png`).finally(() => {
      // Schedule next item lightly so the main UI thread remains completely responsive
      setTimeout(loadNext, 16);
    });
  };

  // Start preloading after a short idle delay
  setTimeout(loadNext, 100);
}
