#!/usr/bin/env node
/**
 * 季節企画記事の自動IndexNow送信。
 *
 * 月初に実行 → 今月＋翌月の特集記事のスラッグを
 * docs/indexnow-queue.txt に投入して scripts/indexnow-submit.mjs を呼ぶ。
 *
 * 期待効果：
 * - 検索ボリュームピーク前にクロール促進
 * - 「6月実行→7月の自由研究・夏祭り記事を先取りインデックス」
 * - 月次ルーティンとしてcronで実行
 *
 * 使い方:
 *   node scripts/seasonal-indexnow.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const HOST = 'kyounoko.jp';
const QUEUE = 'docs/indexnow-queue.txt';

// lib/seasonal-calendar.ts は TS なので、ここでは独自に複製した最小限のマップを使う
// （詳細は lib/seasonal-calendar.ts と同期して保つ）
const SEASONAL = {
  '01': [
    'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
    'youchien-hoikuen-junbi-rakuten',
    'oshougatsu-kodomo-sugoshikata',
  ],
  '02': [
    'shougakkou-nyugaku-junbi-kanzen-list',
    'randoseru-erabikata-osusume-2026',
    'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
  ],
  '03': [
    'shougakkou-nyugaku-junbi-kanzen-list',
    'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
  ],
  '04': [
    'natsuyasumi-keikaku-2026-kodzure',
    'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
  ],
  '05': ['natsuyasumi-keikaku-2026-kodzure'],
  '06': [
    'katei-pool-osusume-ranking-2026',
    'kodomo-hiyakedome-osusume-2026',
    'kodomo-mushiyoke-3shurui-hikaku-real',
    'mizuasobi-omocha-osusume-2026',
    'kodomo-suitou-mugicha-pitcher-2026',
  ],
  '07': [
    'natsuyasumi-keikaku-2026-kodzure',
    'jiyukenkyu-kit-osusume-2026',
    'jiyukenkyu-1nichi-kodomo-30',
    'tanabata-kazari-tedukuri-0-6sai-7shurui',
    'natsumatsuri-kodzure-koryaku-2026',
    'yukata-jinbei-kodomo-osusume-2026',
    'katei-pool-osusume-ranking-2026',
    'natsuyasumi-hirugohan-mainichi-idea-20',
  ],
  '08': [
    'obon-kisei-shintetsu-baby',
    'natsumatsuri-kodzure-koryaku-2026',
    'tokyo-hanabi-taikai-kodzure-2026',
    'yukata-jinbei-kodomo-osusume-2026',
    'kodomo-netsuchusho-3sain-real-2026',
    'jiyukenkyu-1nichi-kodomo-30',
    'natsuyasumi-kazoku-ryokou-kodzure-2026',
  ],
  '09': [
    'undokai-bentou-mochimono-kamigata',
    'natsuyasumi-ake-hoikuen-guzu-taiou',
  ],
  '10': [
    'undokai-bentou-mochimono-kamigata',
    'shichigosan-nenrei-junbi',
  ],
  '11': [
    'shichigosan-nenrei-junbi',
    'shichigosan-fukusou-shashin-kanzen',
    'xmas-present-nenrei-0-6',
    'christmas-present-kodomo-nenrei-betsu',
    'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
  ],
  '12': [
    'xmas-present-nenrei-0-6',
    'christmas-present-kodomo-nenrei-betsu',
    'oshougatsu-kodomo-sugoshikata',
    'osechi-kodomo-kantan-menu',
  ],
};

function pad(n) {
  return String(n).padStart(2, '0');
}

const now = new Date();
const cur = pad(now.getMonth() + 1);
const next = pad((now.getMonth() + 1) % 12 + 1);

const slugs = new Set([...(SEASONAL[cur] ?? []), ...(SEASONAL[next] ?? [])]);
const urls = Array.from(slugs).map((s) => `https://${HOST}/article/${s}`);

if (urls.length === 0) {
  console.log('No seasonal slugs to submit this month');
  process.exit(0);
}

fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync(QUEUE, urls.join('\n') + '\n', 'utf8');
console.log(`queued ${urls.length} seasonal URLs for IndexNow:`);
urls.forEach((u) => console.log(`  - ${u}`));

// indexnow-submit.mjs を呼ぶ
const r = spawnSync('node', ['scripts/indexnow-submit.mjs'], { stdio: 'inherit' });
process.exit(r.status ?? 0);
