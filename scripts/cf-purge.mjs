#!/usr/bin/env node
/**
 * Cloudflare エッジHTMLキャッシュを URL 単位でパージするスクリプト。
 *
 * 背景:
 *   - 記事は content/articles/*.md（ビルド時バンドル）。ファイルベース md は
 *     フルビルドしないと本番に出ず、on-demand revalidate も効かない。
 *     → md 編集の本番反映には `vercel --prod --force` が必要。
 *   - さらに kyounoko.jp は Cloudflare 経由で、記事HTMLが cf-cache-status:HIT /
 *     TTL 3600s でエッジキャッシュされる。デプロイ後も最大1時間ほど古いHTMLが
 *     配信されるため、デプロイ後にこのスクリプトで該当URLを明示パージする。
 *
 * 必要な環境変数（トークンは絶対に直書きしない・env 経由のみ）:
 *   - CLOUDFLARE_API_TOKEN  … Zone > Cache Purge 権限を持つ API トークン
 *   - CLOUDFLARE_ZONE_ID    … kyounoko.jp のゾーンID
 *
 * 使い方:
 *   # 1) 明示的に URL / パス / slug を渡す（引数は混在OK）
 *   node scripts/cf-purge.mjs /article/foo bar https://kyounoko.jp/article/baz
 *
 *   # 2) 引数なし → デプロイ差分（git で変わった content/articles/*.md）を
 *   #    自動算出して該当の /article/<slug> をパージ（既定レンジ HEAD^..HEAD）
 *   node scripts/cf-purge.mjs
 *   node scripts/cf-purge.mjs --auto
 *
 *   # レンジ指定（例: push 前のローカルから）
 *   node scripts/cf-purge.mjs --range origin/main..HEAD
 *   CF_PURGE_RANGE=origin/main..HEAD node scripts/cf-purge.mjs
 *
 *   # ドライラン（パージ対象URLを表示するだけ・API は叩かない）
 *   node scripts/cf-purge.mjs --dry-run
 *
 * 確認:
 *   curl -sI https://kyounoko.jp/article/<slug> | grep -i cf-cache-status
 *   → MISS / EXPIRED になり、本文に新しい内容が出れば成功。
 */

import { execSync } from 'node:child_process';

const SITE = 'https://kyounoko.jp';
const ARTICLE_BASE = '/article/';
const PURGE_BATCH = 30; // Cloudflare purge_cache は1リクエスト最大30 files

// 引数を1パスで解釈する。`--range <値>` は次の引数を値として消費し、
// その値は positional には含めない（含めると purge 対象URL に化けてしまう）。
const rawArgs = process.argv.slice(2);
const flags = new Set();
const positional = [];
let rangeArg = null;

for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i];
  if (a === '--range') {
    rangeArg = rawArgs[i + 1] ?? null; // 次の引数を値として消費
    i++;
    continue;
  }
  if (a.startsWith('--range=')) {
    rangeArg = a.slice('--range='.length);
    continue;
  }
  if (a.startsWith('--') || a === '-n') {
    flags.add(a);
    continue;
  }
  positional.push(a);
}

const dryRun = flags.has('--dry-run') || flags.has('-n');
const range = rangeArg || process.env.CF_PURGE_RANGE || 'HEAD^ HEAD';

/**
 * 入力（フルURL / パス / slug）を絶対URLへ正規化する。
 * - "https://kyounoko.jp/..." はそのまま
 * - "/article/foo" などのパスは SITE を前置
 * - "foo"（slug だけ）は /article/foo として扱う
 * - "content/articles/foo.md" は slug=foo を抽出
 */
function toAbsoluteUrl(input) {
  let s = String(input).trim();
  if (!s) return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;

  // content/articles/<slug>.md → slug
  const mdMatch = s.match(/content\/articles\/([^/]+)\.md$/);
  if (mdMatch) s = `${ARTICLE_BASE}${mdMatch[1]}`;
  else if (s.startsWith('/')) {
    // パスはそのまま
  } else if (s.endsWith('.md')) {
    s = `${ARTICLE_BASE}${s.replace(/\.md$/, '')}`;
  } else {
    // 裸の slug
    s = `${ARTICLE_BASE}${s}`;
  }
  return `${SITE}${s}`;
}

/** git 差分から変更された content/articles/*.md の slug→URL を算出 */
function urlsFromGitDiff() {
  let out = '';
  try {
    out = execSync(`git diff --name-only ${range} -- content/articles/`, {
      encoding: 'utf8',
    });
  } catch (e) {
    console.error(`[cf-purge] git diff 失敗（range=${range}）: ${e.message}`);
    return [];
  }
  return out
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.endsWith('.md'))
    .map(toAbsoluteUrl)
    .filter(Boolean);
}

async function purge(urls) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!token || !zoneId) {
    console.error('[cf-purge] CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID が未設定です。');
    console.error('  例: export CLOUDFLARE_API_TOKEN=xxxx');
    console.error('      export CLOUDFLARE_ZONE_ID=xxxx');
    console.error('  権限: Zone > Cache Purge（取得手順は README 参照）');
    process.exit(1);
  }

  const endpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;
  let ok = true;

  for (let i = 0; i < urls.length; i += PURGE_BATCH) {
    const batch = urls.slice(i, i + PURGE_BATCH);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: batch }),
    });

    let json;
    try {
      json = await res.json();
    } catch {
      json = { success: false, errors: [{ message: `非JSON応答 (HTTP ${res.status})` }] };
    }

    if (res.ok && json.success) {
      console.log(`[cf-purge] ✅ パージ成功 (${batch.length}件)`);
      batch.forEach((u) => console.log(`    - ${u}`));
    } else {
      ok = false;
      const msg = (json.errors || []).map((e) => e.message).join('; ') || `HTTP ${res.status}`;
      console.error(`[cf-purge] ❌ パージ失敗 (${batch.length}件): ${msg}`);
      batch.forEach((u) => console.error(`    - ${u}`));
    }
  }

  return ok;
}

async function main() {
  let urls;
  if (positional.length > 0) {
    urls = positional.map(toAbsoluteUrl).filter(Boolean);
  } else {
    urls = urlsFromGitDiff();
  }

  // 重複除去
  urls = [...new Set(urls)];

  if (urls.length === 0) {
    console.log('[cf-purge] パージ対象URLがありません（差分なし or 引数なし）。何もしません。');
    return;
  }

  console.log(`[cf-purge] 対象 ${urls.length} URL${dryRun ? '（dry-run）' : ''}:`);
  urls.forEach((u) => console.log(`  - ${u}`));

  if (dryRun) {
    console.log('[cf-purge] dry-run のため API は呼びません。');
    return;
  }

  const ok = await purge(urls);
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(`[cf-purge] 予期せぬエラー: ${e.stack || e.message}`);
  process.exit(1);
});
