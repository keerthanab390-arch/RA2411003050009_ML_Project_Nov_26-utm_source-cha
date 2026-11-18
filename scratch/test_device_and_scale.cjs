// Test device detection and scaling logic
const assert = require('assert');

function isIPadOrTablet(mockWindow) {
  if (!mockWindow || !mockWindow.navigator) return false;
  const ua = mockWindow.navigator.userAgent || '';
  const isIPad =
    /iPad/i.test(ua) ||
    (/Macintosh/i.test(ua) && typeof mockWindow.navigator.maxTouchPoints === 'number' && mockWindow.navigator.maxTouchPoints > 1);
  const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);
  return Boolean(isIPad || isTablet);
}

// Case 1: Standard Windows / macOS laptop (maxTouchPoints 0)
const laptopChrome = {
  navigator: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    maxTouchPoints: 0
  }
};
assert.strictEqual(isIPadOrTablet(laptopChrome), false, 'Laptop Chrome should NOT be detected as tablet');

const macbookSafari = {
  navigator: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    maxTouchPoints: 0
  }
};
assert.strictEqual(isIPadOrTablet(macbookSafari), false, 'MacBook Safari should NOT be detected as tablet');

// Case 2: iPad Safari (iOS 13+ Macintosh UA with multi-touch)
const iPadSafariModern = {
  navigator: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    maxTouchPoints: 5
  }
};
assert.strictEqual(isIPadOrTablet(iPadSafariModern), true, 'Modern iPad Safari MUST be detected as tablet');

// Case 3: iPad with legacy or standard iPad UA
const iPadLegacy = {
  navigator: {
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    maxTouchPoints: 5
  }
};
assert.strictEqual(isIPadOrTablet(iPadLegacy), true, 'Legacy iPad UA MUST be detected as tablet');

// Case 4: Android tablet
const androidTablet = {
  navigator: {
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-X900) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
    maxTouchPoints: 10
  }
};
assert.strictEqual(isIPadOrTablet(androidTablet), true, 'Android tablet MUST be detected as tablet');

// Verify Scaling computation
const baseWidthPercent = 48.0;
const DEFAULT_IPAD_SCALE_MULTIPLIER = 0.85;

function computeFinalWidth(isTablet, customMultiplier) {
  const deviceMultiplier = isTablet ? (customMultiplier ?? DEFAULT_IPAD_SCALE_MULTIPLIER) : 1.0;
  return Number((baseWidthPercent * deviceMultiplier).toFixed(2));
}

// On laptop: Exactly unchanged
assert.strictEqual(computeFinalWidth(false), 48.0, 'Laptop width must be exactly unchanged at 48.0%');

// On iPad with default 0.85 multiplier: 48 * 0.85 = 40.8%
assert.strictEqual(computeFinalWidth(true), 40.8, 'iPad width must be 40.8% with 0.85 multiplier');

// On iPad with user adjustment (-3% = 0.82): 48 * 0.82 = 39.36%
assert.strictEqual(computeFinalWidth(true, 0.82), 39.36, 'Adjustable multiplier must compute correctly');

console.log('ALL DEVICE DETECTION AND SCALING ASSERTIONS PASSED!');
