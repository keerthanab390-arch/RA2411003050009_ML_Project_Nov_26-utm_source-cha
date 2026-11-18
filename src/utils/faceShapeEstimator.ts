import { FacialFeatures, FaceShape, FaceShapeClassificationOutput, FaceShapeScoreDetails } from '../types';

export interface FaceShapeTargetProfile {
  targetFaceAspect: number;
  sigmaFaceAspect: number;
  targetForeheadToCheek: number;
  sigmaForeheadToCheek: number;
  targetJawToCheek: number;
  sigmaJawToCheek: number;
  targetUpperToLower: number;
  sigmaUpperToLower: number;
  targetChinTaper: number;
  sigmaChinTaper: number;
}

/**
 * Centralized Morphological Silhouette Configurations & Geometric Centroids
 * Calibrated against canonical facial anatomy and multi-strata contour metrics.
 */
export const FACE_SHAPE_CONFIG: Record<FaceShape, FaceShapeTargetProfile> = {
  Oval: {
    targetFaceAspect: 0.78,
    sigmaFaceAspect: 0.05,
    targetForeheadToCheek: 0.85,
    sigmaForeheadToCheek: 0.06,
    targetJawToCheek: 0.74,
    sigmaJawToCheek: 0.05,
    targetUpperToLower: 1.15,
    sigmaUpperToLower: 0.08,
    targetChinTaper: 0.48,
    sigmaChinTaper: 0.05
  },
  Round: {
    targetFaceAspect: 0.89,
    sigmaFaceAspect: 0.06,
    targetForeheadToCheek: 0.86,
    sigmaForeheadToCheek: 0.06,
    targetJawToCheek: 0.78,
    sigmaJawToCheek: 0.05,
    targetUpperToLower: 1.08,
    sigmaUpperToLower: 0.07,
    targetChinTaper: 0.52,
    sigmaChinTaper: 0.06
  },
  Square: {
    targetFaceAspect: 0.84,
    sigmaFaceAspect: 0.06,
    targetForeheadToCheek: 0.90,
    sigmaForeheadToCheek: 0.06,
    targetJawToCheek: 0.86,
    sigmaJawToCheek: 0.05,
    targetUpperToLower: 1.03,
    sigmaUpperToLower: 0.06,
    targetChinTaper: 0.58,
    sigmaChinTaper: 0.06
  },
  Heart: {
    targetFaceAspect: 0.79,
    sigmaFaceAspect: 0.06,
    targetForeheadToCheek: 0.94,
    sigmaForeheadToCheek: 0.06,
    targetJawToCheek: 0.66,
    sigmaJawToCheek: 0.05,
    targetUpperToLower: 1.28,
    sigmaUpperToLower: 0.09,
    targetChinTaper: 0.42,
    sigmaChinTaper: 0.05
  },
  Oblong: {
    targetFaceAspect: 0.68,
    sigmaFaceAspect: 0.05,
    targetForeheadToCheek: 0.86,
    sigmaForeheadToCheek: 0.06,
    targetJawToCheek: 0.80,
    sigmaJawToCheek: 0.06,
    targetUpperToLower: 1.06,
    sigmaUpperToLower: 0.07,
    targetChinTaper: 0.50,
    sigmaChinTaper: 0.06
  }
};

/**
 * Calculates Gaussian affinity score for a feature given a target center and standard deviation.
 */
function gaussianAffinity(value: number, target: number, sigma: number): number {
  if (sigma <= 0) return 0;
  const diff = value - target;
  return Math.exp(-(diff * diff) / (2 * sigma * sigma));
}

/**
 * Multi-dimensional geometric face shape classification engine with scoring approach.
 * Evaluates the full facial silhouette (forehead, cheekbones, jaw, chin, aspect ratio, and contour taper).
 */
export function classifyFaceShapeWithScores(
  features: FacialFeatures | null,
  validFrameCount: number = 25
): FaceShapeClassificationOutput {
  if (!features) {
    return {
      estimatedShape: 'Oval',
      scores: { Oval: 10, Round: 0, Square: 0, Heart: 0, Oblong: 0 },
      scoreList: [
        { shape: 'Oval', score: 10, normalizedPercentage: 100 },
        { shape: 'Round', score: 0, normalizedPercentage: 0 },
        { shape: 'Square', score: 0, normalizedPercentage: 0 },
        { shape: 'Heart', score: 0, normalizedPercentage: 0 },
        { shape: 'Oblong', score: 0, normalizedPercentage: 0 }
      ],
      features: {
        faceAspectRatio: 0.78,
        faceRatio: 0.78,
        upperFaceRatio: 0.85,
        foreheadToFaceRatio: 0.85,
        foreheadToCheekboneRatio: 0.85,
        foreheadRatio: 0.85,
        cheekboneToFaceRatio: 0.90,
        cheekboneRatio: 0.90,
        jawToFaceRatio: 0.68,
        jawToCheekboneRatio: 0.74,
        jawRatio: 0.74,
        upperToLowerFaceRatio: 1.15,
        foreheadToJawRatio: 1.15,
        chinTaper: 0.48,
        chinToCheekboneRatio: 0.35,
        cheekboneToJawDifference: 0.26,
        foreheadToJawDifference: 0.11,
        cheekboneToForeheadDifference: 0.15,
        eyeDistanceRatio: 0.40
      },
      description: 'Balanced vertical-to-horizontal proportions with gentle tapering toward the jawline.'
    };
  }

  const {
    faceAspectRatio,
    foreheadToCheekboneRatio,
    jawToCheekboneRatio,
    upperToLowerFaceRatio,
    chinTaper,
    cheekboneToJawDifference,
    foreheadToJawDifference
  } = features;

  const rawScores: Record<FaceShape, number> = {
    Oval: 0,
    Round: 0,
    Square: 0,
    Heart: 0,
    Oblong: 0
  };

  const shapes: FaceShape[] = ['Oval', 'Round', 'Square', 'Heart', 'Oblong'];

  // 1. Calculate Multi-Feature Gaussian Compatibility Scores for each shape
  for (const shape of shapes) {
    const config = FACE_SHAPE_CONFIG[shape];

    // Feature 1: Face Aspect Ratio (Weight: 3.5)
    const scoreAspect = gaussianAffinity(faceAspectRatio, config.targetFaceAspect, config.sigmaFaceAspect) * 3.5;

    // Feature 2: Jaw-to-Cheekbone Width (Weight: 3.0)
    const scoreJaw = gaussianAffinity(jawToCheekboneRatio, config.targetJawToCheek, config.sigmaJawToCheek) * 3.0;

    // Feature 3: Upper-to-Lower Taper (Forehead / Jaw) (Weight: 2.5)
    const scoreTaper = gaussianAffinity(upperToLowerFaceRatio, config.targetUpperToLower, config.sigmaUpperToLower) * 2.5;

    // Feature 4: Forehead-to-Cheekbone Width (Weight: 1.5)
    const scoreForehead = gaussianAffinity(foreheadToCheekboneRatio, config.targetForeheadToCheek, config.sigmaForeheadToCheek) * 1.5;

    // Feature 5: Chin Taper (Weight: 2.0)
    const scoreChin = gaussianAffinity(chinTaper, config.targetChinTaper, config.sigmaChinTaper) * 2.0;

    rawScores[shape] = scoreAspect + scoreJaw + scoreTaper + scoreForehead + scoreChin;
  }

  // 2. Morphological Contour & Relative Difference Reinforcements

  // --- HEART ---
  // Upper face significantly wider + substantial downward taper to delicate chin
  if (upperToLowerFaceRatio >= 1.18 && foreheadToJawDifference >= 0.11) {
    rawScores.Heart += 3.5;
    if (jawToCheekboneRatio <= 0.70) rawScores.Heart += 2.0;
    if (chinTaper <= 0.46) rawScores.Heart += 1.5;
  }

  // --- SQUARE ---
  // Broad angular jaw matching cheekbones and forehead width + wide chin base
  if (jawToCheekboneRatio >= 0.82 && cheekboneToJawDifference <= 0.16) {
    rawScores.Square += 3.5;
    if (Math.abs(foreheadToJawDifference) <= 0.08) rawScores.Square += 2.0;
    if (chinTaper >= 0.52) rawScores.Square += 1.5;
  }

  // --- ROUND ---
  // High aspect ratio (compact) + wide cheekbones + soft curved jaw contours
  if (faceAspectRatio >= 0.84 && jawToCheekboneRatio < 0.82) {
    rawScores.Round += 3.5;
    if (faceAspectRatio >= 0.88) rawScores.Round += 2.0;
    if (jawToCheekboneRatio >= 0.73 && jawToCheekboneRatio <= 0.81) rawScores.Round += 1.5;
  }

  // --- OBLONG ---
  // Significant vertical elongation + straight vertical silhouette
  if (faceAspectRatio < 0.73) {
    rawScores.Oblong += 4.0;
    if (faceAspectRatio < 0.69) rawScores.Oblong += 2.5;
    if (Math.abs(foreheadToJawDifference) <= 0.10) rawScores.Oblong += 1.5;
  }

  // --- OVAL ---
  // Harmonious elongation + cheekbones widest + gentle organic jaw taper
  if (
    faceAspectRatio >= 0.73 &&
    faceAspectRatio <= 0.83 &&
    jawToCheekboneRatio >= 0.69 &&
    jawToCheekboneRatio <= 0.78 &&
    upperToLowerFaceRatio >= 1.05 &&
    upperToLowerFaceRatio <= 1.22
  ) {
    rawScores.Oval += 3.0;
    if (cheekboneToJawDifference >= 0.18 && cheekboneToJawDifference <= 0.28) {
      rawScores.Oval += 1.5;
    }
  }

  // 3. Find shape with highest compatibility score
  let bestShape: FaceShape = 'Oval';
  let highestScore = -1;

  for (const [shape, score] of Object.entries(rawScores) as [FaceShape, number][]) {
    if (score > highestScore) {
      highestScore = score;
      bestShape = shape;
    }
  }

  // 4. Generate sorted score details
  const totalScore = Object.values(rawScores).reduce((a, b) => a + b, 0);
  const scoreList: FaceShapeScoreDetails[] = shapes
    .map(shape => ({
      shape,
      score: rawScores[shape],
      normalizedPercentage: totalScore > 0 ? Math.round((rawScores[shape] / totalScore) * 100) : 20
    }))
    .sort((a, b) => b.score - a.score);

  // 5. Development Debug Logging (Strictly formatted as requested)
  if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
    console.log(
      `\n================ FACE SHAPE ANALYSIS ================\n` +
      `Face Aspect Ratio: ${faceAspectRatio.toFixed(3)}\n` +
      `Forehead/Cheekbone: ${foreheadToCheekboneRatio.toFixed(3)}\n` +
      `Jaw/Cheekbone: ${jawToCheekboneRatio.toFixed(3)}\n` +
      `Upper/Lower Face: ${upperToLowerFaceRatio.toFixed(3)}\n` +
      `Chin Taper: ${chinTaper.toFixed(3)}\n` +
      `Cheekbone-Jaw Diff: ${cheekboneToJawDifference.toFixed(3)}\n` +
      `Forehead-Jaw Diff: ${foreheadToJawDifference.toFixed(3)}\n\n` +
      `Shape Scores:\n` +
      `Oval: ${rawScores.Oval.toFixed(1)}\n` +
      `Round: ${rawScores.Round.toFixed(1)}\n` +
      `Square: ${rawScores.Square.toFixed(1)}\n` +
      `Heart: ${rawScores.Heart.toFixed(1)}\n` +
      `Oblong: ${rawScores.Oblong.toFixed(1)}\n\n` +
      `Final Shape: ${bestShape} (Valid Frames: ${validFrameCount})\n` +
      `=====================================================\n`
    );
  }

  const metadata = getFaceShapeMetadata(bestShape);

  return {
    estimatedShape: bestShape,
    scores: rawScores,
    scoreList,
    features,
    description: metadata.description
  };
}

/**
 * Standard estimator function returning the classified FaceShape.
 */
export function estimateFaceShape(
  features: FacialFeatures | null,
  validFrameCount: number = 25
): FaceShape {
  const result = classifyFaceShapeWithScores(features, validFrameCount);
  return result.estimatedShape;
}

export interface FaceShapeAnalysisMeta {
  shape: FaceShape;
  description: string;
  keyCharacteristics: string[];
}

/**
 * Returns detailed morphological explanation for the estimated face shape.
 */
export function getFaceShapeMetadata(shape: FaceShape): FaceShapeAnalysisMeta {
  switch (shape) {
    case 'Oval':
      return {
        shape: 'Oval',
        description: 'Balanced vertical-to-horizontal proportions with gentle tapering toward the jawline and subtle cheekbone prominence.',
        keyCharacteristics: [
          'Face height exceeds width by ~1.25–1.35x',
          'Cheekbones form the widest point of the face',
          'Soft, smoothly curved jawline without sharp angles'
        ]
      };
    case 'Round':
      return {
        shape: 'Round',
        description: 'Nearly equal face width and height ratios with soft, curved jaw contours and prominent full cheeks.',
        keyCharacteristics: [
          'Face width and height ratio is close to 1:1',
          'Cheekbones and face width are prominent',
          'Rounded, soft mandibular jawline'
        ]
      };
    case 'Square':
      return {
        shape: 'Square',
        description: 'Strong, well-defined angular jawline with width comparable to cheekbones and forehead.',
        keyCharacteristics: [
          'Broad forehead with equal jaw width',
          'Pronounced, angular mandibular jawline',
          'Structured horizontal facial geometry'
        ]
      };
    case 'Heart':
      return {
        shape: 'Heart',
        description: 'Prominent, wide forehead and high cheekbones tapering down to a delicate, pointed chin.',
        keyCharacteristics: [
          'Forehead is noticeably wider than jaw',
          'High, prominent cheekbone structure',
          'Tapered, narrow lower jaw and chin'
        ]
      };
    case 'Oblong':
      return {
        shape: 'Oblong',
        description: 'Elongated facial structure where face vertical height is distinctly greater than face width.',
        keyCharacteristics: [
          'Vertical face height significantly exceeds width',
          'Forehead, cheekbones, and jaw share similar width',
          'Straight, extended vertical contours'
        ]
      };
    default:
      return {
        shape: 'Oval',
        description: 'Harmonious optical proportions suitable for versatile frame geometries.',
        keyCharacteristics: ['Balanced proportions']
      };
  }
}
