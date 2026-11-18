/**
 * Device detection utilities for responsive try-on calibration.
 */

/**
 * Detects whether the current device is an iPad or tablet.
 * iPad Safari on iPadOS 13+ identifies as Macintosh in userAgent but has touch points.
 */
export function isIPadOrTablet(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent || '';
  
  // iPad on iOS 13+ reports as Macintosh with multi-touch
  const isIPad =
    /iPad/i.test(ua) ||
    (/Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);

  const isTablet =
    /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);

  return Boolean(isIPad || isTablet);
}

/**
 * Default tablet/iPad-only scale multiplier.
 * Starting at 0.85 as calibrated for tablet front cameras.
 */
export const DEFAULT_IPAD_SCALE_MULTIPLIER = 0.85;
