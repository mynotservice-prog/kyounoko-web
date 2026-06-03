#!/usr/bin/env node
/**
 * Google Indexing API に URL の再インデックスを依頼する。
 *
 * 仕様メモ:
 *   - 1日 200 URL までが既定クォータ。上限拡張は申請ベース。
 *   - 公式には JobPosting / BroadcastEvent 用途とされているが、
 *     URL_UPDATED 通知は sitemap の lastmod を踏まえた再クロール促進に
 *     広く使われており、リメギフでは効果を確認済み。
 *
 * 使い方:
 *   # 1) docs/indexing-queue.txt を作る（1行1URL）
 *   node scripts/indexing-build-queue.mjs --max=180 --kind=articles
 *
 *   # 2) Indexing API に送信
 *   node scripts/request-indexing.mjs
 *
 *   # オプション
 *   node scripts/request-indexing.mjs --type=URL_UPDATED   # 既定
 *   node scripts/request-indexing.mjs --type=URL_DELETED   # 削除通知
 *   node scripts/request-indexing.mjs --max=200            # 1回の上限
 *   node scripts/request-indexing.mjs --dry                # 送信せず確認のみ
 *
 * 環境変数（どちらか必須）:
 *   GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON       … JSON文字列をそのまま
 *   GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH  … JSONファイルへの絶対パス
 *
 * 事前準備（docs/indexing-api-setup.md 参照）:
 *   1. Google Cloud で Indexing API 有効化
 *   2. Service Account 作成 → JSONキーをダウンロード
 *   3. Search Console の所有者として Service Account メールを追加
 */
import fs from 'node:fs';
import path from 'node:path';
import { JWT } from 'google-auth-library';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const QUEUE = args.queue || 'docs/indexing-queue.txt';
const LOG = 'docs/indexing-submitted.log';
const TYPE = args.type === 'URL_DELETED' ? 'URL_DELETED' : 'URL_UPDATED';
const MAX = Number(args.max ?? 180); // 安全側で1日200未満
const DRY = Boolean(args.dry);
const SLEEP_MS = Number(args.sleep ?? 250); // 1req/250ms ≒ 240/min < 600/min上限

function loadServiceAccount() {
  const raw = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON;
  if (raw && raw.trim().startsWith('{')) {
    return JSON.parse(raw);
  }
  const p = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH;
  if (p && fs.existsSync(p)) {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  console.error('❌ Service Account 認証情報が見つかりません。');
  console.error('   GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON または');
  console.error('   GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH を設定してください。');
  console.error('   セットアップ手順: docs/indexing-api-setup.md');
  process.exit(1);
}

function readQueue() {
  if (!fs.existsSync(QUEUE)) {
    console.log(`queue not found: ${QUEUE}`);
    return [];
  }
  const raw = fs.readFileSync(QUEUE, 'utf8');
  return [...new Set(raw.split('\n').map((l) => l.trim()).filter(Boolean))];
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const urls = readQueue();
  if (urls.length === 0) {
    console.log('queue is empty. nothing to submit.');
    return;
  }
  const target = urls.slice(0, MAX);
  console.log(`📋 queue: ${urls.length} URLs, 今回送信: ${target.length} (type=${TYPE})`);

  if (DRY) {
    console.log('💧 DRY RUN — 送信しません');
    target.slice(0, 5).forEach((u) => console.log('  •', u));
    if (target.length > 5) console.log(`  ... and ${target.length - 5} more`);
    return;
  }

  const sa = loadServiceAccount();
  const client = new JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const headers = await client.getRequestHeaders();
  const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

  let ok = 0;
  let fail = 0;
  const failedUrls = [];

  for (const url of target) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type: TYPE }),
      });
      if (res.ok) {
        ok++;
        if (ok % 25 === 0) console.log(`  進捗: ${ok}/${target.length}`);
      } else {
        const t = await res.text();
        fail++;
        failedUrls.push({ url, status: res.status, body: t.slice(0, 200) });
        if (fail <= 5) console.log(`  ⚠️  ${res.status} ${url} → ${t.slice(0, 120)}`);
        // 429: クォータ枯れ。早めに止める
        if (res.status === 429) {
          console.log('🛑 429 quota exceeded。中断します。');
          break;
        }
      }
    } catch (e) {
      fail++;
      failedUrls.push({ url, status: -1, body: String(e).slice(0, 200) });
    }
    await sleep(SLEEP_MS);
  }

  console.log(`\n✅ 成功: ${ok}`);
  console.log(`❌ 失敗: ${fail}`);

  // 成功分はキューから削除＋ログ
  const submitted = target.slice(0, ok);
  const remaining = urls.filter((u) => !submitted.includes(u));
  fs.writeFileSync(QUEUE, remaining.join('\n') + (remaining.length ? '\n' : ''));
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  const stamp = new Date().toISOString();
  const log = [
    `# submitted at ${stamp} (type=${TYPE}, ok=${ok}, fail=${fail})`,
    ...submitted,
    '',
  ].join('\n');
  fs.appendFileSync(LOG, log);
  console.log(`📝 logged ${ok} URLs → ${LOG}`);
  console.log(`📋 queue remaining: ${remaining.length}`);
}

main().catch((e) => {
  console.error('fatal:', e);
  process.exit(1);
});
