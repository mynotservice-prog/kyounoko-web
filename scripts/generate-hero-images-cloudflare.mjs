#!/usr/bin/env node
/**
 * Cloudflare Workers AI (flux-1-schnell) で全記事のヒーロー画像を生成する。
 *
 * ★ 課金登録不要・無料tier 1日10,000 neuron相当（320枚なら確実に無料枠内）
 * ★ FLUX.1 [schnell] 12B パラメータ rectified flow transformer
 *
 * 前提:
 *   - CLOUDFLARE_ACCOUNT_ID 環境変数（Cloudflareダッシュボードで確認）
 *   - CLOUDFLARE_API_TOKEN  環境変数（Workers AI: Read権限）
 *   - 事前に `node scripts/dry-run-prompts.mjs` で tmp/image-prompts.json を生成済み
 *
 * Usage:
 *   CLOUDFLARE_ACCOUNT_ID=xxx CLOUDFLARE_API_TOKEN=xxx node scripts/generate-hero-images-cloudflare.mjs
 *   ... --slug=babycar-ranking-2026   # 1本テスト
 *   ... --limit=10                    # 最初の10本だけ
 *   ... --steps=8                     # 品質向上（max 8、デフォルト4）
 *   ... --concurrency=2               # 並列数（デフォルト2）
 *   ... --force                       # 既存も再生成
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
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !apiToken) {
  console.error('❌ Cloudflare認証情報が未設定です。');
  console.error('');
  console.error('手順:');
  console.error('  1. https://dash.cloudflare.com/sign-up で無料アカウント作成（クレカ不要）');
  console.error('  2. ダッシュボード右下の "Account ID" をコピー');
  console.error('  3. https://dash.cloudflare.com/profile/api-tokens で API Token 発行');
  console.error('     - "Create Token" → "Custom token"');
  console.error('     - Permissions: Account → Workers AI → Read');
  console.error('  4. 環境変数を設定:');
  console.error('       export CLOUDFLARE_ACCOUNT_ID=xxxxxx');
  console.error('       export CLOUDFLARE_API_TOKEN=xxxxxx');
  console.error('');
  console.error('  ※ 無料tier 1日10,000 neuron相当、320枚なら確実に無料枠内');
  process.exit(1);
}

const force = args.includes('--force');
const dryRun = args.includes('--dry-run');
const stepsArg = args.find((a) => a.startsWith('--steps'));
const steps = stepsArg ? Math.min(8, Math.max(1, parseInt(stepsArg.split('=')[1], 10))) : 4;
const concArg = args.find((a) => a.startsWith('--concurrency'));
const concurrency = concArg ? Math.max(1, parseInt(concArg.split('=')[1], 10)) : 2;
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

console.log(`\n=== Cloudflare Workers AI 生成バッチ ===`);
console.log(`対象: ${targets.length}/${allPrompts.length}本`);
console.log(`モデル: @cf/black-forest-labs/flux-1-schnell`);
console.log(`steps: ${steps} (max 8、高いほど品質UP)`);
console.log(`並列: ${concurrency}`);
console.log(`コスト: ¥0（無料tier 10,000 neuron/日内）`);
if (dryRun) {
  console.log('\n--dry-run モードのため API 呼び出しなしで終了。');
  process.exit(0);
}
console.log('\n3秒後に開始（中断: Ctrl+C）...');
await sleep(3000);

const ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

async function generateOne(item, index) {
  const dest = path.join(OUT_DIR, `${item.slug}.png`);
  const log = `[${index + 1}/${targets.length}] ${item.slug}`;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        prompt: item.prompt.slice(0, 2048), // max 2048 chars
        steps,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`  ✗ ${log}  HTTP ${res.status}: ${text.slice(0, 250)}`);
      if (res.status === 429) {
        console.error('    → RateLimit: 30秒待機');
        await sleep(30000);
      }
      return { slug: item.slug, ok: false, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    if (!data.success) {
      console.error(`  ✗ ${log}  success=false: ${JSON.stringify(data.errors).slice(0, 200)}`);
      return { slug: item.slug, ok: false, error: 'api error' };
    }

    const b64 = data?.result?.image;
    if (!b64) {
      console.error(`  ✗ ${log}  result.image が空: ${JSON.stringify(data).slice(0, 200)}`);
      return { slug: item.slug, ok: false, error: 'no image' };
    }
    const buf = Buffer.from(b64, 'base64');
    fs.writeFileSync(dest, buf);
    console.log(`  ✓ ${log}  → ${path.relative(ROOT, dest)} (${(buf.length / 1024).toFixed(0)}KB)`);

    return {
      slug: item.slug,
      ok: true,
      file: `/hero-ai/${item.slug}.png`,
      generatedAt: new Date().toISOString(),
      model: 'flux-1-schnell',
      steps,
    };
  } catch (err) {
    console.error(`  ✗ ${log}  ${err.message}`);
    return { slug: item.slug, ok: false, error: err.message };
  }
}

// 並列ワーカー
const results = [];
let cursor = 0;

async function worker() {
  while (cursor < targets.length) {
    const i = cursor++;
    const r = await generateOne(targets[i], i);
    results.push(r);
    if (r.ok) {
      manifest[targets[i].slug] = r;
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    }
    // 軽い間隔（連投防止）
    await sleep(500);
  }
}

const startedAt = Date.now();
await Promise.all(Array.from({ length: concurrency }, () => worker()));
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
