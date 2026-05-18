#!/usr/bin/env node
/**
 * Pollinations.ai (flux model) で hero画像を生成する暫定スクリプト。
 *
 * ⚠️ 2026-05時点で Pollinations.ai は有料化(HTTP 402 Payment Required)。
 * このスクリプトは記録として残すが、現状動作しない。
 * 代替: scripts/generate-hero-images-cloudflare.mjs (Cloudflare Workers AI, 無料tier)
 *
 * 入力: tmp/new-20-prompts.json (slug -> prompt)
 * 出力: public/hero-ai/<slug>.jpg
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const prompts = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tmp', 'new-20-prompts.json'), 'utf8'),
);
const OUT = path.join(ROOT, 'public', 'hero-ai');
fs.mkdirSync(OUT, { recursive: true });

const entries = Object.entries(prompts);
console.log(`▶ Pollinations.ai 生成開始: ${entries.length}件`);

let okCount = 0;
let failCount = 0;

// 並列度2(レート制限対策)
const CONC = 2;
const queue = [...entries];

async function worker(workerId) {
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const [slug, prompt] = item;
    const outPath = path.join(OUT, `${slug}.jpg`);
    if (fs.existsSync(outPath)) {
      console.log(`  [${workerId}] skip(exists): ${slug}`);
      continue;
    }
    // seed を slug ハッシュで決定的に
    const seed = Math.abs(
      [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0),
    );
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt.slice(0, 700),
    )}?width=1216&height=832&model=flux&seed=${seed}&nologo=true&enhance=true`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'kyounoko/1.0' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) {
        throw new Error(`too small: ${buf.length}B`);
      }
      fs.writeFileSync(outPath, buf);
      okCount++;
      console.log(
        `  [${workerId}] ✓ ${slug} (${(buf.length / 1024).toFixed(0)}KB)`,
      );
      // 1秒 sleep でレート制限緩和
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      failCount++;
      console.warn(`  [${workerId}] ✗ ${slug}: ${e.message}`);
    }
  }
}

await Promise.all(Array.from({ length: CONC }, (_, i) => worker(i + 1)));

console.log(`\n=== 完了 ===`);
console.log(`成功: ${okCount}, 失敗: ${failCount}`);
