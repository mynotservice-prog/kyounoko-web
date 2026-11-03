#!/usr/bin/env node
/**
 * 駅ページの公式照合（PR #412 ほか）の公開前後を、ページ単位で比べる。
 * 変更対象は reports/station-chain-audit-2026-11-02/targets.csv、公開前の数字は baseline.csv。
 *
 * 使い方:
 *   node scripts/station-audit-gsc.mjs --start=2026-10-03 --end=2026-10-30 --out=/tmp/gsc.csv
 *   node scripts/station-audit-gsc.mjs --start=YYYY-MM-DD --end=YYYY-MM-DD --compare=reports/station-chain-audit-2026-11-02
 *
 * --compare は baseline.csv と同じ長さの窓を取り、変更の区分ごとに合計を比べる。
 * 掲載順位は表示回数で重みづけした平均。GSC の final だけを使う。
 * 認証情報は GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH か ./credentials/google-indexing.json。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const SITE = 'sc-domain:kyounoko.jp';
const START = arg('start');
const END = arg('end');
const OUT = arg('out', '');
const COMPARE = arg('compare', '');
if (!START || !END) {
  console.error('--start と --end が要ります');
  process.exit(2);
}

const cred = JSON.parse(
  readFileSync(process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH || './credentials/google-indexing.json', 'utf8'),
);
const jwt = new JWT({
  email: cred.client_email,
  key: cred.private_key,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

async function pull() {
  const rows = new Map();
  for (let startRow = 0; ; startRow += 25000) {
    const r = await jwt.request({
      url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
      method: 'POST',
      data: {
        startDate: START,
        endDate: END,
        dimensions: ['page'],
        type: 'web',
        dataState: 'final',
        dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'includingRegex', expression: '/station|/data/|/llms' }] }],
        rowLimit: 25000,
        startRow,
      },
    });
    const got = r.data.rows ?? [];
    for (const x of got) {
      // #付きURLは合算しない（memory: gsc-page-contains-fragment-inflation）
      if (x.keys[0].includes('#')) continue;
      rows.set(new URL(x.keys[0]).pathname, { clicks: x.clicks, imps: x.impressions, pos: x.position });
    }
    if (got.length < 25000) return rows;
  }
}

const parse = (file) => {
  const [head, ...lines] = readFileSync(file, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/).map((l) => l.split(','));
  return lines.map((l) => Object.fromEntries(head.map((h, i) => [h, l[i]])));
};

const after = await pull();
if (OUT) {
  const lines = ['path,clicks,impressions,position'];
  for (const [p, v] of [...after].sort()) lines.push(`${p},${v.clicks},${v.imps},${v.pos.toFixed(2)}`);
  writeFileSync(OUT, lines.join('\n') + '\n');
  console.log(`${after.size}ページ ${START}〜${END} → ${OUT}`);
}
if (COMPARE) {
  const before = new Map(parse(join(COMPARE, 'baseline.csv')).map((r) => [r.path, r]));
  const groups = new Map();
  const add = (g, side, c, i, p) => {
    const x = groups.get(g) ?? groups.set(g, { pages: 0, bc: 0, bi: 0, bw: 0, ac: 0, ai: 0, aw: 0 }).get(g);
    if (side === 'b') { x.pages++; x.bc += c; x.bi += i; x.bw += p * i; } else { x.ac += c; x.ai += i; x.aw += p * i; }
  };
  for (const t of parse(join(COMPARE, 'targets.csv'))) {
    const b = before.get(t.path);
    const a = after.get(t.path);
    for (const g of t.tags.split('|')) {
      add(g, 'b', Number(b?.clicks ?? 0), Number(b?.impressions ?? 0), Number(b?.position ?? 0));
      add(g, 'a', a?.clicks ?? 0, a?.imps ?? 0, a?.pos ?? 0);
    }
  }
  const pos = (w, i) => (i ? (w / i).toFixed(1) : '-');
  console.log('区分\tページ\tクリック 前→後\t表示 前→後\t順位 前→後');
  for (const [g, x] of [...groups].sort()) {
    console.log(`${g}\t${x.pages}\t${x.bc}→${x.ac}\t${x.bi}→${x.ai}\t${pos(x.bw, x.bi)}→${pos(x.aw, x.ai)}`);
  }
}
