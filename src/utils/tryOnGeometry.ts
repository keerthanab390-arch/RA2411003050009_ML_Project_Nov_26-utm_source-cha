import { NormalizedLandmark, GlassesFitData } from '../types';
import {
  ANATOMICAL_CLUSTERS,
  calculateClusterCentroid,
} from './landmarkMeasurements';
import { getFrameAnchor } from '../data/frameAnchors';

export interface ComputeFitOptions {
  frameKey?: string;
  scaleMultiplier?: number;
  verticalOffsetPercent?: number;
}

/**
 * Default fitting settings.
 *
 * Increase the scale multiplier to make glasses wider.
 * Increase the vertical offset to move glasses lower.
 */
const DEFAULT_SCALE_MULTIPLIER = 1.45;
const DEFAULT_VERTICAL_OFFSET_PERCENT = 1.5;

/**
 * Horizontal positioning blend.
 *
 * The eye midpoint remains the primary reference.
 * The nose bridge provides a secondary reference to
 * improve horizontal alignment.
 */
const EYE_CENTER_WEIGHT = 0.7;
const NOSE_BRIDGE_WEIGHT = 0.3;

const clamp = (
  value: number,
  min: number,
  max: number
): number => Math.max(min, Math.min(max, value));

/**
 * Check that a landmark contains valid coordinates.
 */
const isValidLandmark = (
  lm: NormalizedLandmark | null | undefined
): lm is NormalizedLandmark =>
  Boolean(
    lm &&
    typeof lm.x === 'number' &&
    typeof lm.y === 'number' &&
    Number.isFinite(lm.x) &&
    Number.isFinite(lm.y)
  );

/**
 * Convert a normalized landmark to pixel coordinates
 * in the horizontally mirrored photograph.
 */
const toMirroredPoint = (
  landmark: NormalizedLandmark,
  imageWidth: number,
  imageHeight: number
) => ({
  x: (1 - landmark.x) * imageWidth,
  y: landmark.y * imageHeight,
});

/**
 * Calculate glasses position, width, and rotation using
 * MediaPipe facial landmarks.
 *
 * Improvements:
 * - Eye-based positioning with nose-bridge horizontal correction.
 * - Adjustable glasses width.
 * - Configurable vertical offset.
 * - Stable rotation using outer eye corners.
 * - Single-pass intrinsic frame tilt correction.
 * - Safe landmark validation and fallback handling.
 * - Protection against invalid measurements.
 *
 * Coordinates are calculated for a horizontally mirrored
 * photograph.
 */
export function computeGlassesFit(
  landmarks: NormalizedLandmark[] | null | undefined,
  imageWidth: number = 640,
  imageHeight: number = 480,
  options?: ComputeFitOptions
): GlassesFitData {
  const defaultFit: GlassesFitData = {
    centerX: 50,
    centerY: 40,
    widthPercent: 48,
    rotationDeg: 0,
    isDetected: false,
  };

  // --------------------------------------------------
  // 1. Validate input dimensions and landmarks
  // --------------------------------------------------

  if (
    !landmarks ||
    landmarks.length < 468 ||
    !Number.isFinite(imageWidth) ||
    !Number.isFinite(imageHeight) ||
    imageWidth <= 0 ||
    imageHeight <= 0
  ) {
    return defaultFit;
  }

  // --------------------------------------------------
  // 2. Identify the outer eye corners
  // --------------------------------------------------

  const outerLm1 = isValidLandmark(landmarks[263])
    ? landmarks[263]
    : calculateClusterCentroid(landmarks, [263, 362, 382]);

  const outerLm2 = isValidLandmark(landmarks[33])
    ? landmarks[33]
    : calculateClusterCentroid(landmarks, [33, 133, 155]);

  if (
    !isValidLandmark(outerLm1) ||
    !isValidLandmark(outerLm2)
  ) {
    return defaultFit;
  }

  // --------------------------------------------------
  // 3. Find eye centers
  // --------------------------------------------------

  const leftEyeCluster = calculateClusterCentroid(
    landmarks,
    ANATOMICAL_CLUSTERS.LEFT_EYE
  );

  const rightEyeCluster = calculateClusterCentroid(
    landmarks,
    ANATOMICAL_CLUSTERS.RIGHT_EYE
  );

  const pupilLm1 =
    landmarks.length > 473 && isValidLandmark(landmarks[473])
      ? landmarks[473]
      : isValidLandmark(leftEyeCluster)
        ? leftEyeCluster
        : outerLm1;

  const pupilLm2 =
    landmarks.length > 468 && isValidLandmark(landmarks[468])
      ? landmarks[468]
      : isValidLandmark(rightEyeCluster)
        ? rightEyeCluster
        : outerLm2;

  // --------------------------------------------------
  // 4. Convert landmarks to mirrored pixel coordinates
  // --------------------------------------------------

  const outerPoints = [
    toMirroredPoint(outerLm1, imageWidth, imageHeight),
    toMirroredPoint(outerLm2, imageWidth, imageHeight),
  ].sort((a, b) => a.x - b.x);

  const eyePoints = [
    toMirroredPoint(pupilLm1, imageWidth, imageHeight),
    toMirroredPoint(pupilLm2, imageWidth, imageHeight),
  ].sort((a, b) => a.x - b.x);

  const viewerLeftOuter = outerPoints[0];
  const viewerRightOuter = outerPoints[1];

  const viewerLeftEye = eyePoints[0];
  const viewerRightEye = eyePoints[1];

  // --------------------------------------------------
  // 5. Calculate outer-eye distance
  // --------------------------------------------------

  const dxOuter =
    viewerRightOuter.x - viewerLeftOuter.x;

  const dyOuter =
    viewerRightOuter.y - viewerLeftOuter.y;

  const outerEyeDistancePx = Math.hypot(
    dxOuter,
    dyOuter
  );

  if (
    !Number.isFinite(outerEyeDistancePx) ||
    outerEyeDistancePx < 15
  ) {
    return defaultFit;
  }

  // --------------------------------------------------
  // 6. Calculate the eye midpoint
  // --------------------------------------------------

  const eyeMidpointX =
    (viewerLeftEye.x + viewerRightEye.x) / 2;

  const eyeMidpointY =
    (viewerLeftEye.y + viewerRightEye.y) / 2;

  // --------------------------------------------------
  // 7. Find the nose bridge landmark
  // --------------------------------------------------

  /*
   * Landmark 168 is used as an upper nose-bridge reference.
   * Landmark 6 is the fallback when 168 is unavailable.
   */
  const noseBridgeLm = isValidLandmark(landmarks[168])
    ? landmarks[168]
    : isValidLandmark(landmarks[6])
      ? landmarks[6]
      : null;

  const noseBridgePoint = noseBridgeLm
    ? toMirroredPoint(
      noseBridgeLm,
      imageWidth,
      imageHeight
    )
    : null;

  /*
   * The eye midpoint is the primary horizontal anchor.
   *
   * Blend in the nose bridge only when it is available.
   * This allows the center to follow the nose when the
   * eyes and nose are not perfectly symmetric.
   */
  const centerX = noseBridgePoint
    ? eyeMidpointX * EYE_CENTER_WEIGHT +
    noseBridgePoint.x * NOSE_BRIDGE_WEIGHT
    : eyeMidpointX;

  const centerXPercent =
    (centerX / imageWidth) * 100;

  // --------------------------------------------------
  // 8. Calculate vertical position
  // --------------------------------------------------

  /*
   * Keep vertical placement based on the eye midpoint.
   *
   * The nose-bridge landmark helps horizontal centering;
   * it does not automatically move the glasses downward.
   */
  const verticalOffset =
    typeof options?.verticalOffsetPercent === 'number' &&
      Number.isFinite(options.verticalOffsetPercent)
      ? options.verticalOffsetPercent
      : DEFAULT_VERTICAL_OFFSET_PERCENT;

  const centerYPercent =
    (eyeMidpointY / imageHeight) * 100 +
    verticalOffset;

  // --------------------------------------------------
  // 9. Calculate face rotation
  // --------------------------------------------------

  const faceAngleDeg =
    Math.atan2(dyOuter, dxOuter) *
    (180 / Math.PI);

  const dxPupil =
    viewerRightEye.x - viewerLeftEye.x;

  const dyPupil =
    viewerRightEye.y - viewerLeftEye.y;

  const pupilDistancePx = Math.hypot(
    dxPupil,
    dyPupil
  );

  // --------------------------------------------------
  // 10. Get frame-specific calibration
  // --------------------------------------------------

  const frameAnchor = getFrameAnchor(
    options?.frameKey ?? 'tryon/frame01.png'
  );

  const frontRatio =
    Number.isFinite(frameAnchor.frontWidthRatio) &&
      frameAnchor.frontWidthRatio > 0
      ? frameAnchor.frontWidthRatio
      : 1;

  const intrinsicTilt =
    Number.isFinite(frameAnchor.intrinsicTiltDeg)
      ? frameAnchor.intrinsicTiltDeg
      : 0;

  // --------------------------------------------------
  // 11. Calculate glasses width
  // --------------------------------------------------

  const requestedScale =
    typeof options?.scaleMultiplier === 'number' &&
      Number.isFinite(options.scaleMultiplier) &&
      options.scaleMultiplier > 0
      ? options.scaleMultiplier
      : DEFAULT_SCALE_MULTIPLIER;

  const canvasWidthPx =
    (requestedScale / frontRatio) *
    outerEyeDistancePx;

  const widthPercent =
    (canvasWidthPx / imageWidth) * 100;

  // --------------------------------------------------
  // 12. Calculate rotation with one tilt correction
  // --------------------------------------------------

  const unadjustedRotation =
    faceAngleDeg - intrinsicTilt;

  const rotationDeg = clamp(
    unadjustedRotation,
    -30,
    30
  );

  const safeFaceAngleDeg = clamp(
    faceAngleDeg,
    -30,
    30
  );

  // --------------------------------------------------
  // 13. Calculate additional facial measurements
  // --------------------------------------------------

  const eyeDistancePercent =
    (pupilDistancePx / imageWidth) * 100;

  const outerEyeDistancePercent =
    (outerEyeDistancePx / imageWidth) * 100;

  const noseBridgeYPx =
    noseBridgePoint?.y ?? eyeMidpointY;

  // --------------------------------------------------
  // 14. Return fitting information
  // --------------------------------------------------

  return {
    centerX: Number(
      clamp(centerXPercent, 5, 95).toFixed(2)
    ),

    centerY: Number(
      clamp(centerYPercent, 5, 95).toFixed(2)
    ),

    widthPercent: Number(
      clamp(widthPercent, 25, 95).toFixed(2)
    ),

    rotationDeg: Number.isFinite(rotationDeg)
      ? Number(rotationDeg.toFixed(2))
      : 0,

    isDetected: true,

    eyeDistancePercent: Number(
      clamp(eyeDistancePercent, 5, 80).toFixed(2)
    ),

    outerEyeDistancePercent: Number(
      clamp(outerEyeDistancePercent, 10, 90).toFixed(2)
    ),

    eyeMidpointX: Number(
      clamp(
        (eyeMidpointX / imageWidth) * 100,
        5,
        95
      ).toFixed(2)
    ),

    eyeMidpointY: Number(
      clamp(
        (eyeMidpointY / imageHeight) * 100,
        5,
        95
      ).toFixed(2)
    ),

    noseBridgeY: Number(
      clamp(
        (noseBridgeYPx / imageHeight) * 100,
        5,
        95
      ).toFixed(2)
    ),

    faceAngleDeg: Number.isFinite(safeFaceAngleDeg)
      ? Number(safeFaceAngleDeg.toFixed(2))
      : 0,
  };
}