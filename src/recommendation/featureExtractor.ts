/**
 * Deterministic Feature Extractor for OptiTry ML Recommendation Engine.
 *
 * Implements strict mathematical and encoding parity with the Python training pipeline
 * in `ml/train_model.py`.
 *
 * Strictly NO face-shape features or landmarks are used.
 */

import { MLModelFeatureMeta } from './types';

export const DEFAULT_FEATURE_META: MLModelFeatureMeta = {
  color_affinity: {
    Black: ['Black', 'Gunmetal'],
    Brown: ['Brown', 'Tortoise', 'Amber'],
    Gold: ['Gold', 'Rose Gold', 'Copper', 'Champagne'],
    Silver: ['Silver', 'Gunmetal'],
    Transparent: ['Clear', 'Champagne', 'Transparent'],
    Burgundy: ['Burgundy'],
    Teal: ['Teal', 'Blue'],
    'Rose Gold': ['Rose Gold', 'Gold'],
    'No Preference': []
  },
  style_affinity: {
    Classic: { Classic: 1.0, Professional: 0.70, Casual: 0.50, Modern: 0.35, Trendy: 0.20 },
    Modern: { Modern: 1.0, Professional: 0.70, Trendy: 0.65, Casual: 0.50, Classic: 0.30 },
    Trendy: { Trendy: 1.0, Modern: 0.75, Casual: 0.60, Classic: 0.30, Professional: 0.25 },
    Professional: { Professional: 1.0, Classic: 0.75, Modern: 0.65, Casual: 0.40, Trendy: 0.25 },
    Casual: { Casual: 1.0, Modern: 0.70, Trendy: 0.65, Classic: 0.50, Professional: 0.35 }
  },
  styles_list: ['Classic', 'Modern', 'Trendy', 'Professional', 'Casual'],
  budget_ceiling_map: {
    '₹1,000 - ₹1,200': 1200,
    '₹1,201 - ₹1,500': 1500,
    '₹1,501 - ₹1,800': 1800,
    '₹1,801 - ₹2,000': 2000,
    'Any Budget': 2000
  },
  price_min: 1000,
  price_max: 2000
};

export function getBudgetCeiling(
  budgetPref?: string | null,
  meta: MLModelFeatureMeta = DEFAULT_FEATURE_META
): number {
  if (!budgetPref || budgetPref.trim() === '') return 2000;
  return meta.budget_ceiling_map[budgetPref] ?? 2000;
}

export function extractFeatureVector(
  prefStyle: string | null | undefined,
  prefColor: string | null | undefined,
  budgetMax: number,
  frameStyle: string,
  frameColor: string,
  framePrice: number,
  meta: MLModelFeatureMeta = DEFAULT_FEATURE_META
): number[] {
  const prefStyleClean = (prefStyle ?? 'Classic').trim();
  const prefColorClean = (prefColor ?? 'No Preference').trim();
  const frameStyleClean = (frameStyle ?? '').trim();
  const frameColorClean = (frameColor ?? '').trim();
  const framePriceVal = Number.isFinite(framePrice) ? framePrice : 1500.0;
  const budgetVal = Number.isFinite(budgetMax) && budgetMax > 0 ? budgetMax : 2000.0;

  // 1. Style exact match
  const styleExact = frameStyleClean.toLowerCase() === prefStyleClean.toLowerCase() ? 1.0 : 0.0;

  // 2. Style affinity score
  const styleAffinity = meta.style_affinity[prefStyleClean]?.[frameStyleClean] ?? 0.40;

  // 3. Color match
  let colorMatch = 0.0;
  if (['no preference', '', 'none', 'any'].includes(prefColorClean.toLowerCase())) {
    colorMatch = 1.0;
  } else {
    const allowed = meta.color_affinity[prefColorClean] ?? [prefColorClean];
    const allowedLower = allowed.map((c) => c.toLowerCase());
    colorMatch = allowedLower.includes(frameColorClean.toLowerCase()) ? 1.0 : 0.0;
  }

  // 4. Budget within
  const budgetWithin = framePriceVal <= budgetVal ? 1.0 : 0.0;

  // 5. Price to budget ratio (clamped between 0.4 and 2.0)
  const priceToBudgetRatio = Math.min(2.0, Math.max(0.4, framePriceVal / budgetVal));

  // 6. Price normalized (scaled between 1000 and 2000)
  const priceNormalized = Math.min(1.0, Math.max(0.0, (framePriceVal - 1000.0) / 1000.0));

  // 7-11. Customer preference style indicators
  const prefClassic = prefStyleClean === 'Classic' ? 1.0 : 0.0;
  const prefModern = prefStyleClean === 'Modern' ? 1.0 : 0.0;
  const prefTrendy = prefStyleClean === 'Trendy' ? 1.0 : 0.0;
  const prefProfessional = prefStyleClean === 'Professional' ? 1.0 : 0.0;
  const prefCasual = prefStyleClean === 'Casual' ? 1.0 : 0.0;

  // 12-14. Multi-attribute interaction terms
  const styleMatchXBudget = styleExact * budgetWithin;
  const colorMatchXBudget = colorMatch * budgetWithin;
  const fullPreferenceMatch = styleExact * colorMatch * budgetWithin;

  return [
    styleExact,
    styleAffinity,
    colorMatch,
    budgetWithin,
    priceToBudgetRatio,
    priceNormalized,
    prefClassic,
    prefModern,
    prefTrendy,
    prefProfessional,
    prefCasual,
    styleMatchXBudget,
    colorMatchXBudget,
    fullPreferenceMatch
  ];
}
