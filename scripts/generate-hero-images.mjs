#!/usr/bin/env node
/**
 * OpenAI DALL-E 3 で全記事のヒーロー画像を生成する。
 *
 * 前提:
 *   - OPENAI_API_KEY 環境変数が設定されていること
 *   - 事前に `node scripts/dry-run-prompts.mjs` で tmp/image-prompts.json を生成済み
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs
 *   OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --quality=hd
 *   OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --concurrency=2
 *   OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --limit=10
 *   OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --slug=babycar-ranking-2026
 *   OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --resume   # 既存スキップ（デフォルトON）
 *   OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --force    # 既存も再生成
 *
 * 出力:
 *   public/hero-ai/<slug>.png  (DALL-E 3 オリジナル)
 *   public/hero-ai/manifest.json  (生成記録)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ------------ args ------------
const args = process.argv.slice(2);
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ OPENAI_API_KEY 環境変数が未設定です。');
  console.error('   export OPENAI_API_KEY=sk-... を設定してから再実行してください。');
  process.exit(1);
}

const quality = args.includes('--quality=hd') ? 'hd' : 'standard';
const force = args.includes('--force');
const dryRun = args.includes('--dry-run');
const concArg = args.find((a) => a.startsWith('--concurrency'));
const concurrency = concArg ? parseInt(concArg.split('=')[1], 10) : 2;
const limitArg = args.find((a) => a.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const slugArg = args.find((a) => a.startsWith('--slug'));
const slugFilter = slugArg ? slugArg.split('=')[1] : null;

// ------------ load prompts ------------
const promptsFile = path.join(ROOT, 'tmp', 'image-prompts.json');
if (!fs.existsSync(promptsFile)) {
  console.error('❌ tmp/image-prompts.json が見つかりません。');
  console.error('   先に `node scripts/dry-run-prompts.mjs` を実行してください。');
  process.exit(1);
}
const allPrompts = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));

// ------------ output dir & manifest ------------
const OUT_DIR = path.join(ROOT, 'public', 'hero-ai');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');
fs.mkdirSync(OUT_DIR, { recursive: true });

let manifest = {};
if (fs.existsSync(MANIFEST_PATH)) {
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    manifest = {};
  }
}

// ------------ filter targets ------------
let targets = allPrompts;
if (slugFilter) targets = targets.filter((p) => p.slug === slugFilter);
if (!force) {
  // 既存ファイルがあるものはスキップ
  targets = targets.filter((p) => {
    const dest = path.join(OUT_DIR, `${p.slug}.png`);
    return !fs.existsSync(dest);
  });
}
targets = targets.slice(0, limit);

if (targets.length === 0) {
  console.log('✓ 生成対象なし（全件生成済み or フィルタで0件）。 --force で強制再生成。');
  process.exit(0);
}

// ------------ cost confirm ------------
const PER = quality === 'hd' ? 0.08 : 0.04;
const totalUsd = targets.length * PER;
console.log(`\n=== Hero Image 生成バッチ ===`);
console.log(`対象: ${targets.length}/${allPrompts.length}本`);
console.log(`モデル: dall-e-3 / 1792x1024 / quality=${quality}`);
console.log(`並列: ${concurrency} / 既存スキップ: ${force ? 'OFF' : 'ON'}`);
console.log(`想定コスト: $${totalUsd.toFixed(2)} (¥${Math.round(totalUsd * 158).toLocaleString()})`);
if (dryRun) {
  console.log('\n--dry-run モードのため API 呼び出しなしで終了。');
  process.exit(0);
}
console.log('\n5秒後に開始（中断: Ctrl+C）...');
await sleep(5000);

// ------------ generate function ------------
async function generateOne(item, index) {
  const dest = path.join(OUT_DIR, `${item.slug}.png`);
  const log = `[${index + 1}/${targets.length}] ${item.slug}`;
  try {
    // OpenAI Image Generation API
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: item.prompt,
        n: 1,
        size: '1792x1024',
        quality,
        response_format: 'url',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`  ✗ ${log}  HTTP ${res.status}: ${text.slice(0, 200)}`);
      return { slug: item.slug, ok: false, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) {
      console.error(`  ✗ ${log}  imageUrl 取得失敗`);
      return { slug: item.slug, ok: false, error: 'no url' };
    }

    // ダウンロード
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      console.error(`  ✗ ${log}  画像DL失敗 ${imgRes.status}`);
      return { slug: item.slug, ok: false, error: `download ${imgRes.status}` };
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`  ✓ ${log}  → ${path.relative(ROOT, dest)} (${(buf.length / 1024).toFixed(0)}KB)`);

    return {
      slug: item.slug,
      ok: true,
      file: `/hero-ai/${item.slug}.png`,
      generatedAt: new Date().toISOString(),
      revisedPrompt: data?.data?.[0]?.revised_prompt,
      quality,
    };
  } catch (err) {
    console.error(`  ✗ ${log}  ${err.message}`);
    return { slug: item.slug, ok: false, error: err.message };
  }
}

// ------------ run with concurrency limit ------------
const results = [];
let cursor = 0;

async function worker() {
  while (cursor < targets.length) {
    const i = cursor++;
    const item = targets[i];
    const r = await generateOne(item, i);
    results.push(r);
    if (r.ok) {
      manifest[item.slug] = r;
      // 1件ずつmanifest保存（途中で止まっても再開可能）
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    }
    // RATE LIMIT 対策: 1秒待機
    await sleep(1000);
  }
}

const startedAt = Date.now();
await Promise.all(Array.from({ length: concurrency }, () => worker()));
const elapsedMs = Date.now() - startedAt;

const okCount = results.filter((r) => r.ok).length;
const ngCount = results.filter((r) => !r.ok).length;
console.log(`\n=== 完了 ===`);
console.log(`成功: ${okCount}本 / 失敗: ${ngCount}本 / 経過: ${(elapsedMs / 1000).toFixed(0)}秒`);
console.log(`manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
if (ngCount > 0) {
  console.log(`\n失敗一覧:`);
  results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.slug}: ${r.error}`));
}
console.log(`\n次のステップ: node scripts/apply-hero-ai.mjs で frontmatter 更新`);

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
