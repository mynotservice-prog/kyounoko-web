#!/usr/bin/env node
/**
 * lib/spot-overrides.json → 本番KV の反映（明示的に指定したslugだけ）。
 *
 * ── なぜ必要か ──────────────────────────────────────────
 * 本番は KV が正で、JSONを直してコミットしても表示は変わらない
 * （lib/spot-overrides.ts の getRuntimeSpotOverrides がKVを優先する）。
 * そのため「JSONで文章を直す → このスクリプトで本番へ送る」の2手順にする。
 *
 * ── 画像の扱い ──────────────────────────────────────────
 * **images / image は既定で送らない。** 管理画面からアップロードされた画像はKV側が新しく、
 * JSON側が古いことがあるため（2026-08-19時点で7件がその状態）、うっかり上書きすると
 * アップロード済みの写真が消える。画像も送りたいときだけ --with-images を付ける。
 *
 * ── 注意 ────────────────────────────────────────────
 * facilities と faq は **オブジェクト/配列ごと置換**される（APIの仕様）。
 * 部分的に直したいときも、JSON側にその slug の完全な値がある状態で送ること。
 * 先に sync-spot-overrides-from-kv.mjs でKVと揃えてから編集すれば安全。
 *
 * 使い方:
 *   node scripts/push-spot-overrides-to-kv.mjs -irhu --dry
 *   node scripts/push-spot-overrides-to-kv.mjs -irhu -fl27
 *   node scripts/push-spot-overrides-to-kv.mjs -irhu --fields=note,hiddenTip
 *   node scripts/push-spot-overrides-to-kv.mjs -irhu --with-images
 */
import { readFileSync } from 'node:fs';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const DRY = process.argv.includes('--dry');
const WITH_IMAGES = process.argv.includes('--with-images');
const SITE = arg('site', 'https://kyounoko.jp');
const ONLY = arg('fields', '') ? arg('fields', '').split(',').map((s) => s.trim()).filter(Boolean) : null;
const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));

if (slugs.length === 0) {
  console.error('slugを1つ以上指定してください。例: node scripts/push-spot-overrides-to-kv.mjs -irhu --dry');
  process.exit(1);
}

const local = JSON.parse(readFileSync('lib/spot-overrides.json', 'utf8'));
let failed = 0;

for (const slug of slugs) {
  const ov = local[slug];
  if (!ov) {
    console.error(`✗ ${slug}: lib/spot-overrides.json に存在しません`);
    failed++;
    continue;
  }
  const patch = {};
  for (const [k, v] of Object.entries(ov)) {
    if (!WITH_IMAGES && (k === 'images' || k === 'image')) continue;
    if (ONLY && !ONLY.includes(k)) continue;
    patch[k] = v;
  }
  const keys = Object.keys(patch);
  if (keys.length === 0) {
    console.log(`- ${slug}: 送る項目がありません（スキップ）`);
    continue;
  }
  console.log(`${DRY ? '[dry] ' : ''}${slug} → ${keys.join(', ')}${WITH_IMAGES ? '' : '（画像は送らない）'}`);
  if (DRY) continue;

  const res = await fetch(`${SITE}/api/admin/spot-overrides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: `${SITE}/admin/spots/edit` },
    body: JSON.stringify({ slug, patch }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`  ✗ HTTP ${res.status} ${body.slice(0, 200)}`);
    failed++;
  } else {
    console.log(`  ✓ ${body.slice(0, 120)}`);
  }
}

if (failed > 0) process.exit(1);
