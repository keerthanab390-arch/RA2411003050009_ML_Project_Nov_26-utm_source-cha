import { NormalizedLandmark, RawFacialMeasurements } from '../types';

/**
 * Calculates isotropic Euclidean distance between two normalized facial landmarks,
 * properly scaling coordinates by actual video dimensions to prevent aspect ratio distortion.
 *
 * Formula:
 * dx = (x2 - x1) * videoWidth
 * dy = (y2 - y1) * videoHeight
 * distance = sqrt(dx^2 + dy^2)
 */
export function calculateDistance(
  p1: NormalizedLandmark | undefined,
  p2: NormalizedLandmark | undefined,
  videoWidth: number = 640,
  videoHeight: number = 480
): number {
  if (!p1 || !p2 || typeof p1.x !== 'number' || typeof p2.x !== 'number') {
    return 0;
  }
  const w = videoWidth > 0 ? videoWidth : 640;
  const h = videoHeight > 0 ? videoHeight : 480;

  const dx = (p2.x - p1.x) * w;
  const dy = (p2.y - p1.y) * h;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes the centroid / average position of a cluster of landmark indices.
 */
export function calculateClusterCentroid(
  landmarks: NormalizedLandmark[],
  indices: number[]
): NormalizedLandmark | undefined {
  if (!landmarks || indices.length === 0) return undefined;

  let sumX = 0;
  let sumY = 0;
  let validCount = 0;

  for (const idx of indices) {
    const lm = landmarks[idx];
    if (lm && typeof lm.x === 'number' && typeof lm.y === 'number') {
      sumX += lm.x;
      sumY += lm.y;
      validCount++;
    }
  }

  if (validCount === 0) return undefined;

  return {
    x: sumX / validCount,
    y: sumY / validCount
  };
}

/**
 * Calculates the midpoint between two normalized landmarks.
 */
export function calculateMidpoint(
  p1: NormalizedLandmark | undefined,
  p2: NormalizedLandmark | undefined
): NormalizedLandmark {
  if (!p1 || !p2) {
    return { x: 0, y: 0 };
  }
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: p1.z !== undefined && p2.z !== undefined ? (p1.z + p2.z) / 2 : undefined
  };
}

/**
 * Official Anatomical MediaPipe Landmark Indices:
 *
 * 1. Face Width (Outer Facial Silhouette / Bizygomatic breadth):
 *    - Right outer face boundary: 234 (cluster: [234, 127, 93, 162, 21])
 *    - Left outer face boundary: 454 (cluster: [454, 356, 323, 389, 251])
 *
 * 2. Face Height (Trichion to Menton):
 *    - Upper forehead top midline: 10 (cluster: [10, 151, 9])
 *    - Bottom chin tip: 152 (cluster: [152, 175, 148, 377])
 *
 * 3. Forehead Width (Upper Face Silhouette / Frontotemporale):
 *    - Right upper temple: [109, 67, 103, 54, 21]
 *    - Left upper temple: [338, 297, 332, 284, 251]
 *
 * 4. Cheekbone Width (Zygomatic Prominences):
 *    - Right zygion: [116, 123, 147, 187, 234]
 *    - Left zygion: [345, 352, 376, 411, 454]
 *
 * 5. Jaw Width (Bigonial Mandibular Angles - Lower Face Width):
 *    - Right gonion: [58, 172, 136, 150, 149]
 *    - Left gonion: [288, 397, 365, 379, 378]
 *
 * 6. Chin Base Width (Sublabial Mandibular Symphysis):
 *    - Right chin base: [148, 176, 149]
 *    - Left chin base: [377, 400, 378]
 *
 * 7. Optical Centers (Interpupillary Distance):
 *    - Left Eye Center: [33, 133, 159, 145] or Pupil [468]
 *    - Right Eye Center: [263, 362, 386, 374] or Pupil [473]
 */
export const ANATOMICAL_CLUSTERS = {
  FACE_WIDTH_RIGHT: [234, 127, 93, 162, 21],
  FACE_WIDTH_LEFT: [454, 356, 323, 389, 251],
  FOREHEAD_TOP: [10, 151, 9],
  CHIN_BOTTOM: [152, 175, 148, 377],
  FOREHEAD_RIGHT: [109, 67, 103, 54, 21],
  FOREHEAD_LEFT: [338, 297, 332, 284, 251],
  CHEEKBONE_RIGHT: [116, 123, 147, 187, 234],
  CHEEKBONE_LEFT: [345, 352, 376, 411, 454],
  JAW_RIGHT: [58, 172, 136, 150, 149],
  JAW_LEFT: [288, 397, 365, 379, 378],
  CHIN_RIGHT: [148, 176, 149],
  CHIN_LEFT: [377, 400, 378],
  LEFT_EYE: [33, 133, 159, 145],
  RIGHT_EYE: [263, 362, 386, 374],
  LEFT_PUPIL: 468,
  RIGHT_PUPIL: 473
};

/**
 * Calculates physical Face Width (in pixels) using 234 ↔ 454 lateral boundaries.
 */
export function calculateFaceWidth(
  landmarks: NormalizedLandmark[],
  videoWidth: number = 640,
  videoHeight: number = 480
): number {
  const rightCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.FACE_WIDTH_RIGHT);
  const leftCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.FACE_WIDTH_LEFT);
  return calculateDistance(rightCentroid, leftCentroid, videoWidth, videoHeight);
}

/**
 * Calculates physical Face Height (in pixels) from 10 (trichion) to 152 (chin menton).
 */
export function calculateFaceHeight(
  landmarks: NormalizedLandmark[],
  videoWidth: number = 640,
  videoHeight: number = 480
): number {
  const topCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.FOREHEAD_TOP);
  const chinCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.CHIN_BOTTOM);
  return calculateDistance(topCentroid, chinCentroid, videoWidth, videoHeight);
}

/**
 * Calculates physical Forehead Width (in pixels) across upper temples.
 */
export function calculateForeheadWidth(
  landmarks: NormalizedLandmark[],
  videoWidth: number = 640,
  videoHeight: number = 480
): number {
  const rightCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.FOREHEAD_RIGHT);
  const leftCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.FOREHEAD_LEFT);
  return calculateDistance(rightCentroid, leftCentroid, videoWidth, videoHeight);
}

/**
 * Calculates physical Cheekbone Width (in pixels) across zygomatic prominences.
 */
export function calculateCheekboneWidth(
  landmarks: NormalizedLandmark[],
  videoWidth: number = 640,
  videoHeight: number = 480
): number {
  const rightCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.CHEEKBONE_RIGHT);
  const leftCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.CHEEKBONE_LEFT);
  return calculateDistance(rightCentroid, leftCentroid, videoWidth, videoHeight);
}

/**
 * Calculates physical Jaw Width (in pixels) between mandibular gonion angles.
 */
export function calculateJawWidth(
  landmarks: NormalizedLandmark[],
  videoWidth: number = 640,
  videoHeight: number = 480
): number {
  const rightCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.JAW_RIGHT);
  const leftCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.JAW_LEFT);
  return calculateDistance(rightCentroid, leftCentroid, videoWidth, videoHeight);
}

/**
 * Calculates physical Chin Base Width (in pixels).
 */
export function calculateChinWidth(
  landmarks: NormalizedLandmark[],
  videoWidth: number = 640,
  videoHeight: number = 480
): number {
  const rightCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.CHIN_RIGHT);
  const leftCentroid = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.CHIN_LEFT);
  return calculateDistance(rightCentroid, leftCentroid, videoWidth, videoHeight);
}

/**
 * Calculates physical Eye Distance (in pixels) between both optical centers.
 */
export function calculateEyeDistance(
  landmarks: NormalizedLandmark[],
  videoWidth: number = 640,
  videoHeight: number = 480
): number {
  let leftCenter: NormalizedLandmark | undefined;
  let rightCenter: NormalizedLandmark | undefined;

  if (landmarks.length > ANATOMICAL_CLUSTERS.RIGHT_PUPIL && landmarks[ANATOMICAL_CLUSTERS.LEFT_PUPIL]) {
    leftCenter = landmarks[ANATOMICAL_CLUSTERS.LEFT_PUPIL];
    rightCenter = landmarks[ANATOMICAL_CLUSTERS.RIGHT_PUPIL];
  } else {
    leftCenter = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.LEFT_EYE);
    rightCenter = calculateClusterCentroid(landmarks, ANATOMICAL_CLUSTERS.RIGHT_EYE);
  }

  return calculateDistance(leftCenter, rightCenter, videoWidth, videoHeight);
}

/**
 * Validates that landmark positions are anatomically plausible and non-degenerate.
 */
export function validateLandmarkQuality(landmarks: NormalizedLandmark[]): boolean {
  if (!landmarks || landmarks.length < 468) return false;

  const top = landmarks[10];
  const chin = landmarks[152];
  const rightCheek = landmarks[234];
  const leftCheek = landmarks[454];

  if (!top || !chin || !rightCheek || !leftCheek) return false;

  // Verify that coordinates are within normalized [0, 1] frame
  if (
    top.x < 0 || top.x > 1 || top.y < 0 || top.y > 1 ||
    chin.x < 0 || chin.x > 1 || chin.y < 0 || chin.y > 1 ||
    rightCheek.x < 0 || rightCheek.x > 1 || leftCheek.x < 0 || leftCheek.x > 1
  ) {
    return false;
  }

  // Chin must be below forehead vertically
  if (chin.y <= top.y + 0.10) {
    return false;
  }

  // Face width must be non-trivial
  const width = Math.abs(leftCheek.x - rightCheek.x);
  if (width < 0.10) {
    return false;
  }

  return true;
}

/**
 * Performs complete isotropic mathematical calculation of all facial metrics from MediaPipe landmarks,
 * normalized relative to total face height for resolution-independent proportions.
 */
export function calculateAllRawMeasurements(
  landmarks: NormalizedLandmark[],
  videoWidth: number = 640,
  videoHeight: number = 480
): RawFacialMeasurements | null {
  if (!validateLandmarkQuality(landmarks)) {
    return null;
  }

  const w = videoWidth > 0 ? videoWidth : 640;
  const h = videoHeight > 0 ? videoHeight : 480;

  // 1. Calculate physical pixel distances
  const faceWidthPx = calculateFaceWidth(landmarks, w, h);
  const faceHeightPx = calculateFaceHeight(landmarks, w, h);
  const foreheadWidthPx = calculateForeheadWidth(landmarks, w, h);
  const cheekboneWidthPx = calculateCheekboneWidth(landmarks, w, h);
  const jawWidthPx = calculateJawWidth(landmarks, w, h);
  const chinWidthPx = calculateChinWidth(landmarks, w, h);
  const eyeDistancePx = calculateEyeDistance(landmarks, w, h);

  if (faceWidthPx <= 0 || faceHeightPx <= 0) {
    return null;
  }

  // 2. Compute TRUE natural aspect ratio
  const faceRatio = faceWidthPx / faceHeightPx;

  // 3. Normalize all metrics relative to faceHeight (dimensionless proportions)
  const normFaceWidth = faceWidthPx / h;
  const normFaceHeight = faceHeightPx / h;
  const normForeheadWidth = foreheadWidthPx / h;
  const normCheekboneWidth = cheekboneWidthPx / h;
  const normJawWidth = jawWidthPx / h;
  const normChinWidth = chinWidthPx / h;
  const normEyeDistance = eyeDistancePx / h;

  return {
    faceWidth: normFaceWidth,
    faceHeight: normFaceHeight,
    foreheadWidth: normForeheadWidth,
    cheekboneWidth: normCheekboneWidth,
    jawWidth: normJawWidth,
    chinWidth: normChinWidth,
    eyeDistance: normEyeDistance,
    faceRatio
  };
}
