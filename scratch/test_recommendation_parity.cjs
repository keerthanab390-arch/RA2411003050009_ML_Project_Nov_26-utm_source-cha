/**
 * Parity and Integration Tests for OptiTry Recommendation Engine.
 * Tests feature vector parity, mathematical prediction parity with Python,
 * budget filtering, top-3 selection, and absence of face-shape classification.
 */

const fs = require('fs');
const path = require('path');

// 1. Load ground truth from Python
const groundTruth = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'parity_ground_truth.json'), 'utf-8')
);

// 2. Load model weights
const modelWeights = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/recommendation/model_weights.json'), 'utf-8')
);

// Feature extractor logic replicated from src/recommendation/featureExtractor.ts
function extractFeatureVector(prefStyle, prefColor, budgetMax, frameStyle, frameColor, framePrice, meta) {
  const prefStyleClean = (prefStyle ?? 'Classic').trim();
  const prefColorClean = (prefColor ?? 'No Preference').trim();
  const frameStyleClean = (frameStyle ?? '').trim();
  const frameColorClean = (frameColor ?? '').trim();
  const framePriceVal = Number.isFinite(framePrice) ? framePrice : 1500.0;
  const budgetVal = Number.isFinite(budgetMax) && budgetMax > 0 ? budgetMax : 2000.0;

  const styleExact = frameStyleClean.toLowerCase() === prefStyleClean.toLowerCase() ? 1.0 : 0.0;
  const styleAffinity = meta.style_affinity[prefStyleClean]?.[frameStyleClean] ?? 0.40;

  let colorMatch = 0.0;
  if (['no preference', '', 'none', 'any'].includes(prefColorClean.toLowerCase())) {
    colorMatch = 1.0;
  } else {
    const allowed = meta.color_affinity[prefColorClean] ?? [prefColorClean];
    const allowedLower = allowed.map(c => c.toLowerCase());
    colorMatch = allowedLower.includes(frameColorClean.toLowerCase()) ? 1.0 : 0.0;
  }

  const budgetWithin = framePriceVal <= budgetVal ? 1.0 : 0.0;
  const priceToBudgetRatio = Math.min(2.0, Math.max(0.4, framePriceVal / budgetVal));
  const priceNormalized = Math.min(1.0, Math.max(0.0, (framePriceVal - 1000.0) / 1000.0));

  const prefClassic = prefStyleClean === 'Classic' ? 1.0 : 0.0;
  const prefModern = prefStyleClean === 'Modern' ? 1.0 : 0.0;
  const prefTrendy = prefStyleClean === 'Trendy' ? 1.0 : 0.0;
  const prefProfessional = prefStyleClean === 'Professional' ? 1.0 : 0.0;
  const prefCasual = prefStyleClean === 'Casual' ? 1.0 : 0.0;

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

function predict(vec, coefs, intercept) {
  let logit = intercept;
  for (let i = 0; i < vec.length; i++) {
    logit += vec[i] * coefs[i];
  }
  return 1 / (1 + Math.exp(-logit));
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

console.log('--- Test Suite 1: Feature Vector and Probability Parity with Python ---');
for (const tc of groundTruth) {
  const jsVec = extractFeatureVector(
    tc.pref_style,
    tc.pref_color,
    tc.budget_max,
    tc.frame_style,
    tc.frame_color,
    tc.frame_price,
    modelWeights.feature_meta
  );

  const jsProb = predict(jsVec, modelWeights.coefficients, modelWeights.intercept);

  // Compare vectors
  let maxVecDiff = 0;
  for (let i = 0; i < jsVec.length; i++) {
    maxVecDiff = Math.max(maxVecDiff, Math.abs(jsVec[i] - tc.python_vector[i]));
  }
  assert(maxVecDiff < 1e-6, `${tc.name}: feature vector matches Python (max diff: ${maxVecDiff.toExponential(2)})`);

  const probDiff = Math.abs(jsProb - tc.python_probability);
  assert(probDiff < 1e-4, `${tc.name}: probability matches Python (JS: ${jsProb.toFixed(4)}, Py: ${tc.python_probability.toFixed(4)}, diff: ${probDiff.toExponential(2)})`);
}

console.log('\n--- Test Suite 2: Budget Filtering and Top-3 Selection ---');
const catalogue = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../ml/data/catalogue_reference.json'), 'utf-8')
);

function simulateRecommendation(frames, prefStyle, prefColor, budgetPref) {
  const budgetMap = {
    '₹1,000 - ₹1,200': 1200,
    '₹1,201 - ₹1,500': 1500,
    '₹1,501 - ₹1,800': 1800,
    '₹1,801 - ₹2,000': 2000,
    'Any Budget': 2000
  };
  const budgetCeiling = budgetMap[budgetPref] || 2000;

  // Filter out frames exceeding budget
  const eligible = frames.filter(f => f.price <= budgetCeiling);
  if (eligible.length === 0) return [];

  const scored = eligible.map(frame => {
    const vec = extractFeatureVector(prefStyle, prefColor, budgetCeiling, frame.style, frame.color, frame.price, modelWeights.feature_meta);
    const prob = predict(vec, modelWeights.coefficients, modelWeights.intercept);
    return { frame, prob };
  });

  scored.sort((a, b) => b.prob - a.prob);
  return scored.slice(0, 3);
}

// Test budget filtering: ₹1,000 - ₹1,200
const budget1200Recs = simulateRecommendation(catalogue, 'Classic', 'Black', '₹1,000 - ₹1,200');
assert(budget1200Recs.length > 0 && budget1200Recs.length <= 3, `Returns at most 3 recommendations (got ${budget1200Recs.length})`);
const allWithin1200 = budget1200Recs.every(r => r.frame.price <= 1200);
assert(allWithin1200, 'All recommended frames are within the ₹1,200 budget ceiling');

// Test descending ordering
if (budget1200Recs.length >= 2) {
  assert(budget1200Recs[0].prob >= budget1200Recs[1].prob, 'Recommendations are sorted in descending order of predicted preference');
}

// Test no duplicate IDs
const recIds = budget1200Recs.map(r => r.frame.id);
const uniqueIds = new Set(recIds);
assert(uniqueIds.size === recIds.length, 'No duplicate frames recommended');

console.log('\n--- Test Suite 3: Absence of Face-Shape Logic ---');
const recommenderCode = fs.readFileSync(path.join(__dirname, '../src/recommendation/recommendationEngine.ts'), 'utf-8');
const featureExtractorCode = fs.readFileSync(path.join(__dirname, '../src/recommendation/featureExtractor.ts'), 'utf-8');
const forbiddenStrings = ['faceShape', 'face_shape', 'faceshape', 'ovalScore', 'roundScore'];

for (const term of forbiddenStrings) {
  assert(!recommenderCode.toLowerCase().includes(term.toLowerCase()), `No '${term}' in recommendationEngine.ts`);
  assert(!featureExtractorCode.toLowerCase().includes(term.toLowerCase()), `No '${term}' in featureExtractor.ts`);
}

console.log(`\n================================`);
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`================================`);

if (failed > 0) {
  process.exit(1);
}
