#!/usr/bin/env node
/**
 * public/hero-ai/*.jpg を WebP に変換する（原本jpgは残す）。
 *
 * - 1600x900（16:9）にリサイズ
 * - quality=82（イラスト用途で十分）
 * - 約50%削減を狙う
 *
 * Usage:
 *   node scripts/convert-hero-ai-to-webp.mjs [--force]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'public', 'hero-ai');

const force = process.argv.includes('--force');
const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.jpg'));

let processed = 0;
let skipped = 0;
let totalIn = 0;
let totalOut = 0;
const errors = [];

const CONCURRENCY = 6;
let cursor = 0;

async function convertOne(filename) {
  const src = path.join(DIR, filename);
  const dst = src.replace(/\.jpg$/, '.webp');
  if (!force && fs.existsSync(dst)) {
    skipped++;
    return;
  }
  try {
    const inSize = fs.statSync(src).size;
    await sharp(src)
      .resize(1600, 900, { fit: 'cover', position: 'center' })
      .webp({ quality: 82, effort: 4 })
      .toFile(dst);
    const outSize = fs.statSync(dst).size;
    totalIn += inSize;
    totalOut += outSize;
    processed++;
    if (processed % 25 === 0) {
      console.log(
        `  [${processed}/${files.length}] -${(((1 - outSize / inSize) * 100) | 0)}%  ${filename}`,
      );
    }
  } catch (err) {
    errors.push({ filename, error: err.message });
    console.error(`  ✗ ${filename}  ${err.message}`);
  }
}

async function worker() {
  while (cursor < files.length) {
    const i = cursor++;
    await convertOne(files[i]);
  }
}

console.log(`=== hero-ai WebP 変換 ===`);
console.log(`対象: ${files.length}本 (force=${force})`);
console.log(`サイズ: 1600x900, quality=82\n`);

const started = Date.now();
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
const elapsed = (Date.now() - started) / 1000;

console.log(`\n=== 完了 ===`);
console.log(`変換: ${processed}本 / スキップ: ${skipped}本 / エラー: ${errors.length}本`);
console.log(
  `削減: ${(totalIn / 1024 / 1024).toFixed(1)}MB → ${(totalOut / 1024 / 1024).toFixed(1)}MB  ` +
    `(${((1 - totalOut / totalIn) * 100).toFixed(1)}%減)`,
);
console.log(`経過: ${elapsed.toFixed(1)}秒`);
if (errors.length) {
  console.log('\n--- errors ---');
  errors.forEach((e) => console.log(`  ${e.filename}: ${e.error}`));
}
