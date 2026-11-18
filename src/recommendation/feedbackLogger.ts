/**
 * Customer Feedback Logger for OptiTry Recommendation Engine.
 *
 * Captures explicit interaction signals (likes, dislikes, favourites, try-ons, cart additions)
 * with pseudonymous identifiers.
 *
 * Privacy & Safety Guarantees:
 * - NO personally identifiable information (PII) is stored.
 * - NO camera images or facial landmarks are recorded.
 * - Allows store managers and researchers to export clean datasets for retraining.
 */

import { CustomerFeedbackRecord, FeedbackActionType } from './types';
import { FrameItem } from '../types';
import { getBudgetCeiling } from './featureExtractor';

const FEEDBACK_STORAGE_KEY = 'optitry_feedback_log';
const CUSTOMER_ID_KEY = 'optitry_customer_id';
const SESSION_ID_KEY = 'optitry_session_id';

export function getOrCreateCustomerId(): string {
  try {
    let customerId = localStorage.getItem(CUSTOMER_ID_KEY);
    if (!customerId) {
      customerId = `cust_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(CUSTOMER_ID_KEY, customerId);
    }
    return customerId;
  } catch {
    return 'cust_guest';
  }
}

export function getOrCreateSessionId(): string {
  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return `sess_${Date.now()}`;
  }
}

export function getFeedbackLogs(): CustomerFeedbackRecord[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to read customer feedback log from localStorage', e);
    return [];
  }
}

export function logFeedbackEvent({
  frame,
  feedbackType,
  prefStyle,
  prefColor,
  prefBudget
}: {
  frame: FrameItem;
  feedbackType: FeedbackActionType;
  prefStyle?: string | null;
  prefColor?: string | null;
  prefBudget?: string | null;
}): CustomerFeedbackRecord {
  const customerId = getOrCreateCustomerId();
  const sessionId = getOrCreateSessionId();
  const budgetCeiling = getBudgetCeiling(prefBudget);

  // 1 for positive interaction, 0 for explicit negative interaction
  const isPositive = ['favourite', 'cart', 'try_on', 'purchase', 'explicit_like'].includes(feedbackType);
  const feedbackLabel: 0 | 1 = isPositive ? 1 : 0;

  const record: CustomerFeedbackRecord = {
    customerId,
    sessionId,
    timestamp: new Date().toISOString(),
    prefStyle: (prefStyle ?? 'Classic').trim(),
    prefColor: (prefColor ?? 'No Preference').trim(),
    prefBudget: (prefBudget ?? 'Any Budget').trim(),
    budgetCeiling,
    frameId: frame.id,
    frameName: frame.name,
    frameStyle: frame.style,
    frameColor: frame.color,
    framePrice: frame.price,
    feedbackType,
    feedbackLabel
  };

  try {
    const existing = getFeedbackLogs();
    // Keep last 1,000 interactions to prevent excessive storage consumption
    const updated = [...existing, record].slice(-1000);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Unable to append feedback record to localStorage', e);
  }

  return record;
}

export function clearFeedbackLogs(): void {
  try {
    localStorage.removeItem(FEEDBACK_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear feedback logs', e);
  }
}

export function exportFeedbackAsCSV(): string {
  const records = getFeedbackLogs();
  if (records.length === 0) return '';

  const headers = [
    'customer_id',
    'session_id',
    'timestamp',
    'pref_style',
    'pref_color',
    'pref_budget',
    'budget_max',
    'frame_id',
    'frame_name',
    'frame_style',
    'frame_color',
    'frame_price',
    'feedback_type',
    'feedback_label'
  ];

  const rows = records.map((r) => [
    r.customerId,
    r.sessionId,
    r.timestamp,
    r.prefStyle,
    r.prefColor,
    r.prefBudget,
    r.budgetCeiling,
    r.frameId,
    `"${r.frameName.replace(/"/g, '""')}"`,
    r.frameStyle,
    r.frameColor,
    r.framePrice,
    r.feedbackType,
    r.feedbackLabel
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function downloadFeedbackCSV(): void {
  const csvContent = exportFeedbackAsCSV();
  if (!csvContent) {
    alert('No feedback interactions recorded yet in this browser.');
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `optitry_customer_feedback_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
