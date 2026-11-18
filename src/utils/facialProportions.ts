import { RawFacialMeasurements, FacialFeatures } from '../types';

/**
 * Calculates normalized facial proportions, silhouette contour metrics, and relative differences from raw measurements.
 * All metrics are derived mathematically from actual MediaPipe landmark coordinates.
 */
export function calculateFacialProportions(
  measurements: RawFacialMeasurements | null
): FacialFeatures | null {
  if (!measurements) return null;

  const {
    faceWidth,
    faceHeight,
    foreheadWidth,
    cheekboneWidth,
    jawWidth,
    chinWidth,
    eyeDistance
  } = measurements;

  if (faceWidth <= 0 || faceHeight <= 0) {
    return null;
  }

  // Safe division helper
  const safeDivide = (numerator: number, denominator: number): number => {
    if (denominator <= 0 || !isFinite(denominator) || isNaN(denominator)) return 0;
    const result = numerator / denominator;
    return isFinite(result) ? result : 0;
  };

  const effectiveCheekbone = cheekboneWidth > 0 ? cheekboneWidth : faceWidth;
  const effectiveJaw = jawWidth > 0 ? jawWidth : faceWidth * 0.75;
  const effectiveChin = chinWidth > 0 ? chinWidth : effectiveJaw * 0.50;

  // 1. Aspect & Vertical Ratios
  const faceAspectRatio = safeDivide(faceWidth, faceHeight);
  const faceRatio = faceAspectRatio;

  // 2. Relative Silhouette Proportions
  const upperFaceRatio = safeDivide(foreheadWidth, faceWidth);
  const foreheadToFaceRatio = upperFaceRatio;
  const foreheadToCheekboneRatio = safeDivide(foreheadWidth, effectiveCheekbone);
  const foreheadRatio = foreheadToCheekboneRatio;
  const cheekboneToFaceRatio = safeDivide(cheekboneWidth, faceWidth);
  const cheekboneRatio = cheekboneToFaceRatio;
  const jawToFaceRatio = safeDivide(jawWidth, faceWidth);
  const jawToCheekboneRatio = safeDivide(jawWidth, effectiveCheekbone);
  const jawRatio = jawToCheekboneRatio;

  // 3. Contour Taper & Balance
  const upperToLowerFaceRatio = safeDivide(foreheadWidth, effectiveJaw);
  const foreheadToJawRatio = upperToLowerFaceRatio;
  const chinTaper = safeDivide(effectiveChin, effectiveJaw);
  const chinToCheekboneRatio = safeDivide(effectiveChin, effectiveCheekbone);

  // 4. Normalized Relative Differences (normalized by cheekboneWidth)
  const cheekboneToJawDifference = safeDivide(effectiveCheekbone - jawWidth, effectiveCheekbone);
  const foreheadToJawDifference = safeDivide(foreheadWidth - jawWidth, effectiveCheekbone);
  const cheekboneToForeheadDifference = safeDivide(effectiveCheekbone - foreheadWidth, effectiveCheekbone);

  // 5. Optical Centers
  const eyeDistanceRatio = safeDivide(eyeDistance, faceWidth);

  return {
    faceAspectRatio,
    faceRatio,
    upperFaceRatio,
    foreheadToFaceRatio,
    foreheadToCheekboneRatio,
    foreheadRatio,
    cheekboneToFaceRatio,
    cheekboneRatio,
    jawToFaceRatio,
    jawToCheekboneRatio,
    jawRatio,
    upperToLowerFaceRatio,
    foreheadToJawRatio,
    chinTaper,
    chinToCheekboneRatio,
    cheekboneToJawDifference,
    foreheadToJawDifference,
    cheekboneToForeheadDifference,
    eyeDistanceRatio
  };
}
