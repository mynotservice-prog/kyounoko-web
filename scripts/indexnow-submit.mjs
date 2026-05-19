#!/usr/bin/env node
/**
 * IndexNow API で Bing / Yandex / Naver に新規/更新URLを通知する。
 *
 * 使い方:
 *   node scripts/indexnow-submit.mjs [optionsfile]
 *
 *   既定では docs/indexnow-queue.txt（1行1URL）を読み、空なら何もしない。
 *   実行後はキューを docs/indexnow-submitted.log に追記してクリアする。
 *
 * 1日10,000URLまで送信可能（Bing公式仕様）。1リクエストあたり最大10,000URL。
 *
 * Google は IndexNow非対応。sitemap.xml の更新で検知される運用。
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const HOST = 'kyounoko.jp';
const KEY = 'c68e60e8f4b025a51c97f20076ce5c09';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const QUEUE = process.argv[2] ?? 'docs/indexnow-queue.txt';
const LOG = 'docs/indexnow-submitted.log';
const MAX_URLS = 9000; // 安全側で1リクエスト9,000まで

function readQueue() {
  if (!fs.existsSync(QUEUE)) {
    console.log(`queue not found: ${QUEUE}`);
    return [];
  }
  const raw = fs.readFileSync(QUEUE, 'utf8');
  const urls = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  return [...new Set(urls)];
}

function postJson(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(endpoint);
    const req = https.request({
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function submitToEndpoint(endpoint, urls) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };
  const res = await postJson(endpoint, body);
  console.log(`${endpoint} → status ${res.status}`);
  if (res.status >= 400) console.log('  body:', res.body.slice(0, 200));
  return res;
}

async function main() {
  const all = readQueue();
  if (all.length === 0) {
    console.log('queue is empty. nothing to submit.');
    return;
  }
  // 重複除去 + URLバリデーション
  const valid = all.filter((u) => /^https:\/\/kyounoko\.jp\//.test(u));
  console.log(`submitting ${valid.length} URLs (skipped ${all.length - valid.length} invalid)`);

  // バッチ分割
  for (let i = 0; i < valid.length; i += MAX_URLS) {
    const batch = valid.slice(i, i + MAX_URLS);
    console.log(`  batch ${i / MAX_URLS + 1}: ${batch.length} URLs`);
    // Bing 経由が最も普及 (Yandex/Naver にも一括配信される)
    await submitToEndpoint('https://api.indexnow.org/IndexNow', batch);
    // Yandex は別途送るとカバー率UP
    await submitToEndpoint('https://yandex.com/indexnow', batch);
  }

  // ログに追記してキューを空に
  const stamp = new Date().toISOString();
  const logLines = [
    `# submitted at ${stamp} (${valid.length} URLs)`,
    ...valid,
    '',
  ].join('\n');
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, logLines);
  fs.writeFileSync(QUEUE, '');
  console.log(`logged to ${LOG}, cleared ${QUEUE}`);
}

main().catch((e) => {
  console.error('error:', e);
  process.exit(1);
});
