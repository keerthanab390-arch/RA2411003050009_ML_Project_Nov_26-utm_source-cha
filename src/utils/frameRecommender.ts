import {
  FrameItem,
  StylePreference,
  ShapePreference,
  ColorPreference,
  SizePreference,
  BudgetPreference,
} from '../types';
import { getMLRecommendations } from '../recommendation/recommendationEngine';
import { getBudgetCeiling } from '../recommendation/featureExtractor';

export interface RecommendationParams {
  frames: FrameItem[];
  stylePreference?: StylePreference | string | null;
  shapePreference?: ShapePreference | string | null;
  colorPreference?: ColorPreference | string | null;
  sizePreference?: SizePreference | string | null;
  budgetPreference?: BudgetPreference | string | null;
  // Preserved for caller interface backwards compatibility; strictly never used
  faceShape?: unknown;
  isFaceAnalysisComplete?: boolean;
}

/**
 * Returns frames ranked using the preference-trained Machine Learning Recommendation Model.
 * Excludes frames exceeding the customer's budget ceiling.
 * Marks the top 3 highest scoring frames with isRecommended: true.
 *
 * Guaranteed: NO face-shape classification or scores are used.
 */
export function getRecommendedFrames({
  frames,
  stylePreference,
  colorPreference,
  budgetPreference,
}: RecommendationParams): FrameItem[] {
  if (!frames || frames.length === 0) {
    return [];
  }

  const budgetCeiling = getBudgetCeiling(budgetPreference);

  // 1. Filter out frames whose price exceeds the customer's budget ceiling
  const eligibleFrames = frames.filter((frame) => {
    return Number.isFinite(frame.price) && frame.price <= budgetCeiling;
  });

  if (eligibleFrames.length === 0) {
    return [];
  }

  // 2. Obtain top ML recommendations
  const topMLRecs = getMLRecommendations({
    frames: eligibleFrames,
    stylePreference,
    colorPreference,
    budgetPreference,
  });

  const topMLMap = new Map<string, FrameItem>();
  for (const rec of topMLRecs) {
    topMLMap.set(rec.frame.id, rec.frame);
  }

  // 3. For any remaining eligible frames, attach score
  const remainingFrames: FrameItem[] = [];
  for (const f of eligibleFrames) {
    if (!topMLMap.has(f.id)) {
      remainingFrames.push({
        ...f,
        isRecommended: false,
        recommendationScore: undefined,
      });
    }
  }

  // Sort remaining frames by price ascending
  remainingFrames.sort((a, b) => a.price - b.price);

  // Return top 3 ML recommended frames first, followed by remaining eligible frames
  return [...Array.from(topMLMap.values()), ...remainingFrames];
}
