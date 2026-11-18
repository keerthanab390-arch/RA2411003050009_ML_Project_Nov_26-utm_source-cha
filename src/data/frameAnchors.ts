export interface FrameAnchor {
  opticalCenterXPercent: number;  // Horizontal optical midpoint between the two lenses (%)
  opticalCenterYPercent: number;  // Vertical optical center of the lenses (%)
  lensDistanceRatio: number;      // Distance between two lens centers / image width
  frontWidthRatio: number;        // Visible front frame width / image width
  intrinsicTiltDeg: number;       // Intrinsic tilt angle in the photograph (degrees)
  bridgeXPercent: number;         // Backward compatibility
  bridgeYPercent: number;         // Backward compatibility
  frontFrameRatio: number;        // Backward compatibility
  defaultVerticalOffset?: number; // Configurable vertical offset
}

export const FRAME_ANCHORS: Record<string, FrameAnchor> = {
  frame01: { opticalCenterXPercent: 28.53, opticalCenterYPercent: 42.13, lensDistanceRatio: 0.2497, frontWidthRatio: 0.51, intrinsicTiltDeg: -1.62, bridgeXPercent: 28.53, bridgeYPercent: 42.13, frontFrameRatio: 0.51 },
  frame02: { opticalCenterXPercent: 27.76, opticalCenterYPercent: 42.74, lensDistanceRatio: 0.2437, frontWidthRatio: 0.4983, intrinsicTiltDeg: -0.71, bridgeXPercent: 27.76, bridgeYPercent: 42.74, frontFrameRatio: 0.4983 },
  frame03: { opticalCenterXPercent: 28.46, opticalCenterYPercent: 42.27, lensDistanceRatio: 0.2514, frontWidthRatio: 0.495, intrinsicTiltDeg: -0.87, bridgeXPercent: 28.46, bridgeYPercent: 42.27, frontFrameRatio: 0.495 },
  frame04: { opticalCenterXPercent: 28.16, opticalCenterYPercent: 42.05, lensDistanceRatio: 0.2499, frontWidthRatio: 0.5071, intrinsicTiltDeg: -2.48, bridgeXPercent: 28.16, bridgeYPercent: 42.05, frontFrameRatio: 0.5071 },
  frame05: { opticalCenterXPercent: 28.42, opticalCenterYPercent: 41.93, lensDistanceRatio: 0.2505, frontWidthRatio: 0.5096, intrinsicTiltDeg: -3.36, bridgeXPercent: 28.42, bridgeYPercent: 41.93, frontFrameRatio: 0.5096 },
  frame06: { opticalCenterXPercent: 28.52, opticalCenterYPercent: 41.95, lensDistanceRatio: 0.2516, frontWidthRatio: 0.5125, intrinsicTiltDeg: -3.36, bridgeXPercent: 28.52, bridgeYPercent: 41.95, frontFrameRatio: 0.5125 },
  frame07: { opticalCenterXPercent: 28.72, opticalCenterYPercent: 43.19, lensDistanceRatio: 0.2448, frontWidthRatio: 0.5079, intrinsicTiltDeg: -5.14, bridgeXPercent: 28.72, bridgeYPercent: 43.19, frontFrameRatio: 0.5079 },
  frame08: { opticalCenterXPercent: 28.32, opticalCenterYPercent: 42.14, lensDistanceRatio: 0.2508, frontWidthRatio: 0.5067, intrinsicTiltDeg: -2.13, bridgeXPercent: 28.32, bridgeYPercent: 42.14, frontFrameRatio: 0.5067 },
  frame09: { opticalCenterXPercent: 28.28, opticalCenterYPercent: 42.12, lensDistanceRatio: 0.2489, frontWidthRatio: 0.505, intrinsicTiltDeg: -1.83, bridgeXPercent: 28.28, bridgeYPercent: 42.12, frontFrameRatio: 0.505 },
  frame10: { opticalCenterXPercent: 28.31, opticalCenterYPercent: 42.7, lensDistanceRatio: 0.2505, frontWidthRatio: 0.5062, intrinsicTiltDeg: -1.76, bridgeXPercent: 28.31, bridgeYPercent: 42.7, frontFrameRatio: 0.5062 },
  frame11: { opticalCenterXPercent: 27.31, opticalCenterYPercent: 42.44, lensDistanceRatio: 0.252, frontWidthRatio: 0.4975, intrinsicTiltDeg: 1.21, bridgeXPercent: 27.31, bridgeYPercent: 42.44, frontFrameRatio: 0.4975 },
  frame12: { opticalCenterXPercent: 28.22, opticalCenterYPercent: 42.35, lensDistanceRatio: 0.2524, frontWidthRatio: 0.5088, intrinsicTiltDeg: -1.33, bridgeXPercent: 28.22, bridgeYPercent: 42.35, frontFrameRatio: 0.5088 },
  frame13: { opticalCenterXPercent: 27.94, opticalCenterYPercent: 42.23, lensDistanceRatio: 0.2498, frontWidthRatio: 0.5042, intrinsicTiltDeg: -0.53, bridgeXPercent: 27.94, bridgeYPercent: 42.23, frontFrameRatio: 0.5042 },
  frame14: { opticalCenterXPercent: 28.7, opticalCenterYPercent: 42.69, lensDistanceRatio: 0.2515, frontWidthRatio: 0.5117, intrinsicTiltDeg: -3.73, bridgeXPercent: 28.7, bridgeYPercent: 42.69, frontFrameRatio: 0.5117 },
  frame15: { opticalCenterXPercent: 28.73, opticalCenterYPercent: 42.77, lensDistanceRatio: 0.2522, frontWidthRatio: 0.5112, intrinsicTiltDeg: -3.64, bridgeXPercent: 28.73, bridgeYPercent: 42.77, frontFrameRatio: 0.5112 },
  frame16: { opticalCenterXPercent: 28.07, opticalCenterYPercent: 43.9, lensDistanceRatio: 0.2465, frontWidthRatio: 0.5021, intrinsicTiltDeg: 0.19, bridgeXPercent: 28.07, bridgeYPercent: 43.9, frontFrameRatio: 0.5021 },
  frame17: { opticalCenterXPercent: 28.38, opticalCenterYPercent: 43.79, lensDistanceRatio: 0.2467, frontWidthRatio: 0.5071, intrinsicTiltDeg: -0.24, bridgeXPercent: 28.38, bridgeYPercent: 43.79, frontFrameRatio: 0.5071 },
  frame18: { opticalCenterXPercent: 28.82, opticalCenterYPercent: 44.64, lensDistanceRatio: 0.2543, frontWidthRatio: 0.4971, intrinsicTiltDeg: -6.04, bridgeXPercent: 28.82, bridgeYPercent: 44.64, frontFrameRatio: 0.4971 },
  frame19: { opticalCenterXPercent: 28.49, opticalCenterYPercent: 42.3, lensDistanceRatio: 0.2445, frontWidthRatio: 0.505, intrinsicTiltDeg: -4.46, bridgeXPercent: 28.49, bridgeYPercent: 42.3, frontFrameRatio: 0.505 },
  frame20: { opticalCenterXPercent: 28.03, opticalCenterYPercent: 42.48, lensDistanceRatio: 0.2409, frontWidthRatio: 0.4813, intrinsicTiltDeg: -0.92, bridgeXPercent: 28.03, bridgeYPercent: 42.48, frontFrameRatio: 0.4813 },
  frame21: { opticalCenterXPercent: 28.19, opticalCenterYPercent: 41.92, lensDistanceRatio: 0.25, frontWidthRatio: 0.5079, intrinsicTiltDeg: -0.28, bridgeXPercent: 28.19, bridgeYPercent: 41.92, frontFrameRatio: 0.5079 },
  frame22: { opticalCenterXPercent: 28.21, opticalCenterYPercent: 41.94, lensDistanceRatio: 0.2496, frontWidthRatio: 0.505, intrinsicTiltDeg: -0.31, bridgeXPercent: 28.21, bridgeYPercent: 41.94, frontFrameRatio: 0.505 },
  frame23: { opticalCenterXPercent: 28.78, opticalCenterYPercent: 42.55, lensDistanceRatio: 0.2495, frontWidthRatio: 0.5071, intrinsicTiltDeg: -2.85, bridgeXPercent: 28.78, bridgeYPercent: 42.55, frontFrameRatio: 0.5071 },
  frame24: { opticalCenterXPercent: 28.48, opticalCenterYPercent: 41.65, lensDistanceRatio: 0.2578, frontWidthRatio: 0.5133, intrinsicTiltDeg: 0.36, bridgeXPercent: 28.48, bridgeYPercent: 41.65, frontFrameRatio: 0.5133 },
  frame25: { opticalCenterXPercent: 28.18, opticalCenterYPercent: 42.17, lensDistanceRatio: 0.2585, frontWidthRatio: 0.5054, intrinsicTiltDeg: -1.49, bridgeXPercent: 28.18, bridgeYPercent: 42.17, frontFrameRatio: 0.5054 },
  frame26: { opticalCenterXPercent: 28.17, opticalCenterYPercent: 42.28, lensDistanceRatio: 0.2577, frontWidthRatio: 0.5117, intrinsicTiltDeg: -1.05, bridgeXPercent: 28.17, bridgeYPercent: 42.28, frontFrameRatio: 0.5117 },
  frame27: { opticalCenterXPercent: 28.59, opticalCenterYPercent: 41.61, lensDistanceRatio: 0.2494, frontWidthRatio: 0.5117, intrinsicTiltDeg: -2.51, bridgeXPercent: 28.59, bridgeYPercent: 41.61, frontFrameRatio: 0.5117 },
  frame28: { opticalCenterXPercent: 28.52, opticalCenterYPercent: 41.71, lensDistanceRatio: 0.2495, frontWidthRatio: 0.51, intrinsicTiltDeg: -2.19, bridgeXPercent: 28.52, bridgeYPercent: 41.71, frontFrameRatio: 0.51 },
  frame29: { opticalCenterXPercent: 28.71, opticalCenterYPercent: 42.09, lensDistanceRatio: 0.251, frontWidthRatio: 0.5108, intrinsicTiltDeg: -2.77, bridgeXPercent: 28.71, bridgeYPercent: 42.09, frontFrameRatio: 0.5108 },
  frame30: { opticalCenterXPercent: 28.13, opticalCenterYPercent: 42.08, lensDistanceRatio: 0.2423, frontWidthRatio: 0.5, intrinsicTiltDeg: -0.4, bridgeXPercent: 28.13, bridgeYPercent: 42.08, frontFrameRatio: 0.5 },
  frame31: { opticalCenterXPercent: 28.24, opticalCenterYPercent: 42.99, lensDistanceRatio: 0.2463, frontWidthRatio: 0.5067, intrinsicTiltDeg: -2.0, bridgeXPercent: 28.24, bridgeYPercent: 42.99, frontFrameRatio: 0.5067 },
  frame32: { opticalCenterXPercent: 28.26, opticalCenterYPercent: 43.04, lensDistanceRatio: 0.2465, frontWidthRatio: 0.5042, intrinsicTiltDeg: -1.81, bridgeXPercent: 28.26, bridgeYPercent: 43.04, frontFrameRatio: 0.5042 },
  frame33: { opticalCenterXPercent: 28.08, opticalCenterYPercent: 41.93, lensDistanceRatio: 0.2467, frontWidthRatio: 0.5029, intrinsicTiltDeg: -2.43, bridgeXPercent: 28.08, bridgeYPercent: 41.93, frontFrameRatio: 0.5029 },
  frame34: { opticalCenterXPercent: 28.4, opticalCenterYPercent: 42.47, lensDistanceRatio: 0.2506, frontWidthRatio: 0.5038, intrinsicTiltDeg: -2.85, bridgeXPercent: 28.4, bridgeYPercent: 42.47, frontFrameRatio: 0.5038 },
  frame35: { opticalCenterXPercent: 28.35, opticalCenterYPercent: 42.7, lensDistanceRatio: 0.2416, frontWidthRatio: 0.4858, intrinsicTiltDeg: -4.24, bridgeXPercent: 28.35, bridgeYPercent: 42.7, frontFrameRatio: 0.4858 },
  frame36: { opticalCenterXPercent: 28.39, opticalCenterYPercent: 42.31, lensDistanceRatio: 0.2511, frontWidthRatio: 0.4808, intrinsicTiltDeg: -0.33, bridgeXPercent: 28.39, bridgeYPercent: 42.31, frontFrameRatio: 0.4808 },
  frame37: { opticalCenterXPercent: 28.07, opticalCenterYPercent: 42.81, lensDistanceRatio: 0.2478, frontWidthRatio: 0.5062, intrinsicTiltDeg: -1.74, bridgeXPercent: 28.07, bridgeYPercent: 42.81, frontFrameRatio: 0.5062 },
  frame38: { opticalCenterXPercent: 28.11, opticalCenterYPercent: 41.97, lensDistanceRatio: 0.25, frontWidthRatio: 0.5042, intrinsicTiltDeg: 0.62, bridgeXPercent: 28.11, bridgeYPercent: 41.97, frontFrameRatio: 0.5042 },
  frame39: { opticalCenterXPercent: 28.58, opticalCenterYPercent: 41.89, lensDistanceRatio: 0.2496, frontWidthRatio: 0.5054, intrinsicTiltDeg: -3.46, bridgeXPercent: 28.58, bridgeYPercent: 41.89, frontFrameRatio: 0.5054 },
  frame40: { opticalCenterXPercent: 28.15, opticalCenterYPercent: 43.04, lensDistanceRatio: 0.2439, frontWidthRatio: 0.5029, intrinsicTiltDeg: -3.06, bridgeXPercent: 28.15, bridgeYPercent: 43.04, frontFrameRatio: 0.5029 },
};

export const DEFAULT_ANCHOR: FrameAnchor = {
  opticalCenterXPercent: 28.53,
  opticalCenterYPercent: 42.13,
  lensDistanceRatio: 0.2497,
  frontWidthRatio: 0.5100,
  intrinsicTiltDeg: -1.62,
  bridgeXPercent: 28.53,
  bridgeYPercent: 42.13,
  frontFrameRatio: 0.5100
};

/**
 * Calibrated anchor for front-facing virtual try-on assets (e.g. tryon/frame01.png).
 * Front cutouts are horizontally centered (50%), have full 1.0 front frame span,
 * zero intrinsic photographic tilt, and optical lens center at ~38% height.
 */
export const TRYON_FRONT_ANCHOR: FrameAnchor = {
  opticalCenterXPercent: 50.0,
  opticalCenterYPercent: 38.0,
  lensDistanceRatio: 0.50,
  frontWidthRatio: 1.0,
  intrinsicTiltDeg: 0.0,
  bridgeXPercent: 50.0,
  bridgeYPercent: 38.0,
  frontFrameRatio: 1.0
};

export function getFrameAnchor(imagePathOrFrameId: string | null | undefined): FrameAnchor {
  if (!imagePathOrFrameId || typeof imagePathOrFrameId !== 'string') {
    return TRYON_FRONT_ANCHOR;
  }
  if (imagePathOrFrameId.includes('/tryon/') || imagePathOrFrameId.includes('tryon')) {
    return TRYON_FRONT_ANCHOR;
  }
  const match = imagePathOrFrameId.match(/frame(\d+)/i);
  if (!match) return DEFAULT_ANCHOR;
  const num = parseInt(match[1], 10);
  const key = `frame${num < 10 ? '0' + num : num}`;
  return FRAME_ANCHORS[key] || DEFAULT_ANCHOR;
}
