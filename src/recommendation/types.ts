import { FrameItem, StylePreference, ColorPreference, BudgetPreference } from '../types';

export interface MLModelMetrics {
  train_samples: number;
  test_samples: number;
  train_customers: number;
  test_customers: number;
  roc_auc: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  brier_score: number;
  confusion_matrix: number[][];
}

export interface MLModelFeatureMeta {
  color_affinity: Record<string, string[]>;
  style_affinity: Record<string, Record<string, number>>;
  styles_list: string[];
  budget_ceiling_map: Record<string, number>;
  price_min: number;
  price_max: number;
}

export interface MLModelPayload {
  version: string;
  algorithm: string;
  trained_at: string;
  random_seed: number;
  feature_names: string[];
  coefficients: number[];
  intercept: number;
  metrics: MLModelMetrics;
  feature_meta: MLModelFeatureMeta;
}

export interface MLRecommendationParams {
  frames: FrameItem[];
  stylePreference?: StylePreference | string | null;
  colorPreference?: ColorPreference | string | null;
  budgetPreference?: BudgetPreference | string | null;
}

export interface MLRecommendationMatchFactors {
  styleMatch: boolean;
  styleAffinity: number;
  colorMatch: boolean;
  budgetFit: boolean;
  price: number;
  budgetCeiling: number;
}

export interface MLRecommendationResult {
  frame: FrameItem;
  predictedProbability: number;
  matchScorePercent: number;
  isMLGenerated: boolean;
  explanation: string;
  factors: MLRecommendationMatchFactors;
}

export type FeedbackActionType =
  | 'favourite'
  | 'cart'
  | 'try_on'
  | 'purchase'
  | 'explicit_like'
  | 'explicit_dislike'
  | 'dismiss';

export interface CustomerFeedbackRecord {
  customerId: string;
  sessionId: string;
  timestamp: string;
  prefStyle: string;
  prefColor: string;
  prefBudget: string;
  budgetCeiling: number;
  frameId: string;
  frameName: string;
  frameStyle: string;
  frameColor: string;
  framePrice: number;
  feedbackType: FeedbackActionType;
  feedbackLabel: 0 | 1; // 1 = positive, 0 = negative
}
