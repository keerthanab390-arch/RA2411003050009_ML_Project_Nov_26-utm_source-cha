/**
 * OptiTry Machine Learning Recommendation Engine.
 *
 * Implements client-side inference using the trained Logistic Regression model
 * exported from `ml/train_model.py`.
 *
 * Requirements & Constraints:
 * 1. Accepts customer explicit colour, style, and budget preferences.
 * 2. Excludes frames whose price exceeds the customer's budget ceiling.
 * 3. Returns up to three eligible recommendations in descending order of predicted preference.
 * 4. Explains recommendations using supported attributes without inventing explanations.
 * 5. Handles missing preferences, missing frame attributes, and empty catalogues gracefully.
 * 6. Prevents duplicate frame recommendations.
 * 7. Reuses actual frame IDs and image references from FRAMES_CATALOGUE.
 * 8. Distinguishes ML predictions from fallback recommendations.
 * 9. CRITICAL: Strictly NO face-shape classification, predictions, or compatibility scores.
 */

import { FrameItem } from '../types';
import rawModelPayload from './model_weights.json';
import {
  MLModelPayload,
  MLRecommendationParams,
  MLRecommendationResult,
  MLRecommendationMatchFactors
} from './types';
import {
  extractFeatureVector,
  getBudgetCeiling,
  DEFAULT_FEATURE_META
} from './featureExtractor';

/**
 * Validates the imported model weights payload.
 */
function validateModelPayload(payload: unknown): payload is MLModelPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Partial<MLModelPayload>;
  if (!Array.isArray(p.feature_names) || p.feature_names.length === 0) return false;
  if (!Array.isArray(p.coefficients) || p.coefficients.length !== p.feature_names.length) return false;
  if (typeof p.intercept !== 'number' || !Number.isFinite(p.intercept)) return false;
  return true;
}

const activeModel: MLModelPayload | null = validateModelPayload(rawModelPayload)
  ? (rawModelPayload as MLModelPayload)
  : null;

/**
 * Standard Sigmoid activation function.
 */
function sigmoid(z: number): number {
  if (z > 40) return 0.9999;
  if (z < -40) return 0.0001;
  return 1 / (1 + Math.exp(-z));
}

/**
 * Computes predicted probability using the learned logistic regression weights.
 */
export function predictPreferenceProbability(
  featureVector: number[],
  coefficients: number[],
  intercept: number
): number {
  let logit = intercept;
  for (let i = 0; i < featureVector.length; i++) {
    logit += featureVector[i] * coefficients[i];
  }
  return sigmoid(logit);
}

/**
 * Generates an honest, grounded explanation based on real matching attributes.
 * Avoids asserting certainty or claiming guarantees.
 */
function composeExplanation({
  frame,
  styleMatch,
  colorMatch,
  budgetFit,
  budgetCeiling,
  predictedProbability,
  isML
}: {
  frame: FrameItem;
  styleMatch: boolean;
  colorMatch: boolean;
  budgetFit: boolean;
  budgetCeiling: number;
  predictedProbability: number;
  isML: boolean;
}): string {
  const scorePercent = Math.round(predictedProbability * 100);
  const parts: string[] = [];

  if (styleMatch) {
    parts.push(`matches your ${frame.style.toLowerCase()} style preference`);
  }

  if (colorMatch) {
    parts.push(`matches your preferred ${frame.color.toLowerCase()} colour`);
  }

  if (budgetFit) {
    parts.push(`fits comfortably within your ₹${budgetCeiling.toLocaleString('en-IN')} budget at ₹${frame.price.toLocaleString('en-IN')}`);
  }

  const prefix = isML
    ? `ML estimated preference: ${scorePercent}%`
    : `Heuristic match: ${scorePercent}%`;

  if (parts.length === 0) {
    return `${prefix}. Selected as a balanced option within your search criteria.`;
  }

  return `${prefix} — ${parts.join(', ')}.`;
}

/**
 * Fallback recommendation algorithm when the ML model weights are unavailable or corrupted.
 */
function fallbackRecommendation(
  eligibleFrames: FrameItem[],
  stylePref?: string | null,
  colorPref?: string | null,
  budgetCeiling: number = 2000
): MLRecommendationResult[] {
  const scored = eligibleFrames.map((frame) => {
    const styleMatch = Boolean(stylePref && frame.style.toLowerCase() === stylePref.toLowerCase());
    const colorMatch = Boolean(
      !colorPref ||
      colorPref === 'No Preference' ||
      frame.color.toLowerCase() === colorPref.toLowerCase()
    );
    const budgetFit = frame.price <= budgetCeiling;

    let score = 0.50;
    if (styleMatch) score += 0.25;
    if (colorMatch) score += 0.15;
    if (budgetFit) score += 0.10;

    const factors: MLRecommendationMatchFactors = {
      styleMatch,
      styleAffinity: styleMatch ? 1.0 : 0.40,
      colorMatch,
      budgetFit,
      price: frame.price,
      budgetCeiling
    };

    return {
      frame,
      predictedProbability: score,
      matchScorePercent: Math.round(score * 100),
      isMLGenerated: false,
      explanation: composeExplanation({
        frame,
        styleMatch,
        colorMatch,
        budgetFit,
        budgetCeiling,
        predictedProbability: score,
        isML: false
      }),
      factors
    };
  });

  scored.sort((a, b) => b.predictedProbability - a.predictedProbability);
  return scored.slice(0, 3);
}

/**
 * Primary ML Recommendation function.
 *
 * Evaluates candidate frames against user preferences using the trained Logistic Regression model.
 * Returns up to 3 highest scoring eligible frames.
 */
export function getMLRecommendations({
  frames,
  stylePreference,
  colorPreference,
  budgetPreference
}: MLRecommendationParams): MLRecommendationResult[] {
  if (!frames || frames.length === 0) {
    return [];
  }

  // De-duplicate frames by ID to guarantee uniqueness
  const uniqueFramesMap = new Map<string, FrameItem>();
  for (const f of frames) {
    if (f && f.id && !uniqueFramesMap.has(f.id)) {
      uniqueFramesMap.set(f.id, f);
    }
  }
  const uniqueFrames = Array.from(uniqueFramesMap.values());

  const meta = activeModel?.feature_meta ?? DEFAULT_FEATURE_META;
  const budgetCeiling = getBudgetCeiling(budgetPreference, meta);

  // Hard constraint: Exclude frames whose price exceeds the customer's budget ceiling
  const eligibleFrames = uniqueFrames.filter((f) => {
    return Number.isFinite(f.price) && f.price <= budgetCeiling;
  });

  if (eligibleFrames.length === 0) {
    return [];
  }

  // If model is missing or invalid, trigger safe fallback
  if (!activeModel) {
    console.warn('ML Model weights not available or invalid. Employing fallback recommender.');
    return fallbackRecommendation(eligibleFrames, stylePreference, colorPreference, budgetCeiling);
  }

  const { coefficients, intercept } = activeModel;

  const scoredResults: MLRecommendationResult[] = eligibleFrames.map((frame) => {
    const featureVector = extractFeatureVector(
      stylePreference,
      colorPreference,
      budgetCeiling,
      frame.style,
      frame.color,
      frame.price,
      meta
    );

    const prob = predictPreferenceProbability(featureVector, coefficients, intercept);

    const styleMatch = Boolean(
      stylePreference && frame.style.toLowerCase() === stylePreference.toLowerCase()
    );

    const prefColorClean = (colorPreference ?? 'No Preference').toLowerCase();
    const colorMatch =
      ['no preference', '', 'any'].includes(prefColorClean) ||
      frame.color.toLowerCase() === prefColorClean;

    const budgetFit = frame.price <= budgetCeiling;

    const factors: MLRecommendationMatchFactors = {
      styleMatch,
      styleAffinity: featureVector[1],
      colorMatch,
      budgetFit,
      price: frame.price,
      budgetCeiling
    };

    const explanation = composeExplanation({
      frame,
      styleMatch,
      colorMatch,
      budgetFit,
      budgetCeiling,
      predictedProbability: prob,
      isML: true
    });

    return {
      frame: {
        ...frame,
        isRecommended: true,
        recommendationScore: {
          frameId: frame.id,
          totalScore: prob,
          styleScore: featureVector[1],
          colorScore: colorMatch ? 1 : 0,
          sizeScore: 1,
          budgetScore: budgetFit ? 1 : 0,
          isRecommended: true,
          matchReason: explanation
        }
      },
      predictedProbability: prob,
      matchScorePercent: Math.round(prob * 100),
      isMLGenerated: true,
      explanation,
      factors
    };
  });

  // Sort descending by predicted preference probability
  scoredResults.sort((a, b) => {
    const diff = b.predictedProbability - a.predictedProbability;
    if (Math.abs(diff) > 0.0001) return diff;
    return a.frame.name.localeCompare(b.frame.name);
  });

  // Return up to three eligible recommendations
  return scoredResults.slice(0, 3);
}

/**
 * Accessor for model metadata and evaluation metrics.
 */
export function getModelMetadata(): Partial<MLModelPayload> | null {
  if (!activeModel) return null;
  return {
    version: activeModel.version,
    algorithm: activeModel.algorithm,
    trained_at: activeModel.trained_at,
    metrics: activeModel.metrics,
    feature_names: activeModel.feature_names
  };
}
