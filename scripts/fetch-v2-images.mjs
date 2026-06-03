#!/usr/bin/env node
/**
 * /v2 用画像を Pexels API から一括取得して public/v2/ 配下に保存する。
 *
 * 使い方:
 *   1. .env.local に PEXELS_API_KEY=xxx を設定
 *   2. node scripts/fetch-v2-images.mjs           (全カテゴリ)
 *   3. node scripts/fetch-v2-images.mjs features  (1カテゴリのみ)
 *   4. node scripts/fetch-v2-images.mjs --force   (既存ファイルも上書き)
 *
 * 仕様:
 *   - landscape (1200x627) 規格で取得 → ほぼ 16:9
 *   - 既存ファイルはスキップ（API リクエスト節約）
 *   - 各画像の写真家クレジットを public/v2/_credits.json に書き出す
 *   - レート制限: 1秒に2リクエストに抑える
 */

import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MANIFEST } from './v2-image-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_BASE = path.join(ROOT, 'public', 'v2');
const CREDITS_PATH = path.join(OUT_BASE, '_credits.json');
const ENV_PATH = path.join(ROOT, '.env.local');

// .env.local を簡易パース（dotenv 依存を避けるため）
async function loadEnv() {
  try {
    const text = await fs.readFile(ENV_PATH, 'utf-8');
    for (const line of text.split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // ignore
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchOne(apiKey, query, attempt = 0) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query,
  )}&per_page=5&orientation=landscape&size=medium`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) {
    if (res.status === 429 && attempt < 3) {
      console.warn(`  rate limit, waiting 30s...`);
      await sleep(30000);
      return searchOne(apiKey, query, attempt + 1);
    }
    throw new Error(`Pexels API error ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (!json.photos || json.photos.length === 0) {
    return null;
  }
  // 最初の1枚を採用
  return json.photos[0];
}

async function downloadJpeg(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buf);
}

async function main() {
  await loadEnv();
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error('PEXELS_API_KEY is not set. Run: echo "PEXELS_API_KEY=xxx" >> .env.local');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const onlyCategory = args.find((a) => !a.startsWith('--'));

  await fs.mkdir(OUT_BASE, { recursive: true });

  // 既存クレジット読み込み
  let credits = {};
  try {
    credits = JSON.parse(await fs.readFile(CREDITS_PATH, 'utf-8'));
  } catch {
    credits = {};
  }

  const targets = onlyCategory
    ? MANIFEST.filter((c) => c.category === onlyCategory)
    : MANIFEST;

  let totalFetched = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const cat of targets) {
    const dir = path.join(OUT_BASE, cat.category);
    await fs.mkdir(dir, { recursive: true });
    console.log(`\n=== ${cat.category} (${cat.items.length} items) ===`);

    for (const item of cat.items) {
      const outPath = path.join(dir, `${item.key}.jpg`);
      const relPath = `/v2/${cat.category}/${item.key}.jpg`;

      if (!force && existsSync(outPath)) {
        console.log(`  skip  ${item.key}`);
        totalSkipped++;
        continue;
      }

      try {
        const photo = await searchOne(apiKey, item.query);
        if (!photo) {
          console.warn(`  ✗ no result: ${item.key} (${item.query})`);
          totalFailed++;
          continue;
        }
        await downloadJpeg(photo.src.landscape, outPath);
        credits[relPath] = {
          photographer: photo.photographer,
          photographer_url: photo.photographer_url,
          pexels_url: photo.url,
          query: item.query,
        };
        console.log(`  ✓ ${item.key}  by ${photo.photographer}`);
        totalFetched++;
        // レート制限対策: 約 500ms 待つ（200 req/h 制限内）
        await sleep(500);
      } catch (e) {
        console.error(`  ✗ ${item.key}: ${e.message}`);
        totalFailed++;
      }
    }
  }

  // クレジット保存
  await fs.writeFile(CREDITS_PATH, JSON.stringify(credits, null, 2), 'utf-8');

  console.log(`\n=== Done ===`);
  console.log(`  fetched: ${totalFetched}`);
  console.log(`  skipped: ${totalSkipped}`);
  console.log(`  failed:  ${totalFailed}`);
  console.log(`  credits saved to ${CREDITS_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
