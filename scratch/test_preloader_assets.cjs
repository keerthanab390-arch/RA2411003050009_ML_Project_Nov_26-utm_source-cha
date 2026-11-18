// Test try-on asset filenames and preloading path verification
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const tryOnDir = 'c:/Users/sathi/OneDrive/Desktop/OptiTry/public/images/frames/tryon';
const files = fs.readdirSync(tryOnDir);

// Verify all 41 try-on PNGs exist and have valid size
assert.strictEqual(files.length, 41, 'Must have exactly 41 try-on frame PNGs');

for (let i = 1; i <= 41; i++) {
  const num = String(i).padStart(2, '0');
  const filename = `frame${num}.png`;
  assert(files.includes(filename), `Missing tryon file: ${filename}`);
  const stat = fs.statSync(path.join(tryOnDir, filename));
  assert(stat.size > 50000, `File ${filename} size too small: ${stat.size}`);
}

console.log('ALL 41 TRY-ON FRAME PNG FILES VERIFIED SUCCESSFULLY!');
