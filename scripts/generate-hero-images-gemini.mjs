#!/usr/bin/env node
/**
 * Google Gemini 2.5 Flash Image (nano-banana) で全記事のヒーロー画像を生成する。
 *
 * ★ 無料枠: 1日500枚まで完全無料（課金設定不要）
 * ★ レート制限: 約 2 req/min（Tier 1）
 *
 * 前提:
 *   - GEMINI_API_KEY 環境変数が設定されていること
 *     （https://aistudio.google.com/app/apikey で無料発行可能）
 *   - 事前に `node scripts/dry-run-prompts.mjs` で tmp/image-prompts.json を生成済み
 *
 * Usage:
 *   GEMINI_API_KEY=AIza... node scripts/generate-hero-images-gemini.mjs
 *   GEMINI_API_KEY=AIza... node scripts/generate-hero-images-gemini.mjs --limit=10
 *   GEMINI_API_KEY=AIza... node scripts/generate-hero-images-gemini.mjs --slug=babycar-ranking-2026
 *   GEMINI_API_KEY=AIza... node scripts/generate-hero-images-gemini.mjs --force    # 既存も再生成
 *   GEMINI_API_KEY=AIza... node scripts/generate-hero-images-gemini.mjs --delay=35 # ms間隔（デフォルト35秒=2req/min弱）
 *
 * 出力:
 *   public/hero-ai/<slug>.png
 *   public/hero-ai/manifest.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY 環境変数が未設定です。');
  console.error('   発行手順:');
  console.error('   1. https://aistudio.google.com/app/apikey にアクセス（Googleアカウント必要）');
  console.error('   2. "Create API key" をクリック');
  console.error('   3. キーをコピーして export GEMINI_API_KEY=AIza... で設定');
  console.error('   ※ 無料枠1日500枚、課金設定不要');
  process.exit(1);
}

const force = args.includes('--force');
const dryRun = args.includes('--dry-run');
const delayArg = args.find((a) => a.startsWith('--delay'));
const delayMs = delayArg ? parseInt(delayArg.split('=')[1], 10) * 1000 : 35000; // デフォルト35秒
const limitArg = args.find((a) => a.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const slugArg = args.find((a) => a.startsWith('--slug'));
const slugFilter = slugArg ? slugArg.split('=')[1] : null;

// プロンプト読み込み
const promptsFile = path.join(ROOT, 'tmp', 'image-prompts.json');
if (!fs.existsSync(promptsFile)) {
  console.error('❌ tmp/image-prompts.json が見つかりません。');
  console.error('   先に `node scripts/dry-run-prompts.mjs` を実行してください。');
  process.exit(1);
}
const allPrompts = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));

// 出力先準備
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

// 対象絞り込み
let targets = allPrompts;
if (slugFilter) targets = targets.filter((p) => p.slug === slugFilter);
if (!force) {
  targets = targets.filter((p) => {
    const dest = path.join(OUT_DIR, `${p.slug}.png`);
    return !fs.existsSync(dest);
  });
}
targets = targets.slice(0, limit);

if (targets.length === 0) {
  console.log('✓ 生成対象なし（全件生成済み or フィルタで0件）。 --force で強制再生成可。');
  process.exit(0);
}

// 1日500枚制限の警告
if (targets.length > 500) {
  console.log(`⚠ 対象 ${targets.length}本 > 1日500枚の無料枠`);
  console.log(`  500枚で一旦止めて、翌日に残りを実行する流れ推奨`);
}

const estMin = Math.ceil((targets.length * delayMs) / 1000 / 60);
console.log(`\n=== Gemini Image 生成バッチ（無料枠）===`);
console.log(`対象: ${targets.length}/${allPrompts.length}本`);
console.log(`モデル: gemini-2.5-flash-image (nano-banana)`);
console.log(`レート: ${(60 * 1000 / delayMs).toFixed(1)} req/分（${delayMs / 1000}秒間隔）`);
console.log(`想定所要: 約${estMin}分（${(estMin / 60).toFixed(1)}時間）`);
console.log(`コスト: ¥0（1日500枚まで完全無料）`);
if (dryRun) {
  console.log('\n--dry-run モードのため API 呼び出しなしで終了。');
  process.exit(0);
}
console.log('\n5秒後に開始（中断: Ctrl+C）...');
await sleep(5000);

// ---------- 1件生成 ----------
async function generateOne(item, index) {
  const dest = path.join(OUT_DIR, `${item.slug}.png`);
  const log = `[${index + 1}/${targets.length}] ${item.slug}`;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: item.prompt },
            ],
          },
        ],
        // 画像生成のみ（テキスト返答抑制）
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`  ✗ ${log}  HTTP ${res.status}: ${text.slice(0, 250)}`);
      // RATE LIMITならもう少し待って自然回復に任せる
      if (res.status === 429) {
        console.error('    → 429 RateLimit: 60秒待機');
        await sleep(60000);
      }
      return { slug: item.slug, ok: false, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    // response から inlineData (base64画像) を取り出す
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData || p.inline_data);
    if (!imagePart) {
      console.error(`  ✗ ${log}  画像なし(parts=${parts.length}): ${JSON.stringify(parts).slice(0, 200)}`);
      return { slug: item.slug, ok: false, error: 'no inline_data' };
    }
    const inlineData = imagePart.inlineData || imagePart.inline_data;
    const b64 = inlineData.data;
    const buf = Buffer.from(b64, 'base64');
    fs.writeFileSync(dest, buf);
    console.log(`  ✓ ${log}  → ${path.relative(ROOT, dest)} (${(buf.length / 1024).toFixed(0)}KB)`);

    return {
      slug: item.slug,
      ok: true,
      file: `/hero-ai/${item.slug}.png`,
      generatedAt: new Date().toISOString(),
      model: 'gemini-2.5-flash-image',
      mimeType: inlineData.mimeType || inlineData.mime_type,
    };
  } catch (err) {
    console.error(`  ✗ ${log}  ${err.message}`);
    return { slug: item.slug, ok: false, error: err.message };
  }
}

// ---------- シリアル実行 ----------
const results = [];
const startedAt = Date.now();
let dailyOk = 0;
const DAILY_LIMIT = 500;

for (let i = 0; i < targets.length; i++) {
  if (dailyOk >= DAILY_LIMIT) {
    console.log(`\n⚠ 1日500枚の上限に到達。${i}/${targets.length}本で停止。`);
    console.log(`  日付が変わってから再実行で続きから走ります（既存スキップ）。`);
    break;
  }
  const r = await generateOne(targets[i], i);
  results.push(r);
  if (r.ok) {
    manifest[targets[i].slug] = r;
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    dailyOk++;
  }
  // 最後でなければ delay（無料枠2req/min対策）
  if (i < targets.length - 1) await sleep(delayMs);
}

const elapsedMs = Date.now() - startedAt;
const okCount = results.filter((r) => r.ok).length;
const ngCount = results.filter((r) => !r.ok).length;

console.log(`\n=== 完了 ===`);
console.log(`成功: ${okCount}本 / 失敗: ${ngCount}本 / 経過: ${(elapsedMs / 1000 / 60).toFixed(1)}分`);
console.log(`manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
if (ngCount > 0) {
  console.log(`\n失敗一覧:`);
  results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.slug}: ${r.error}`));
}
console.log(`\n次のステップ: node scripts/apply-hero-ai.mjs で frontmatter 更新`);

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
