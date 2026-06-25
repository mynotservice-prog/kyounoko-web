#!/usr/bin/env node
/**
 * GSC Discover 分析レポート（実データ）
 *
 * Google Discover は検索クエリ起点ではないため、GSC API では type:"discover" で
 * 別系統のデータとして取得する（dimension に query は使えない。date/page/device/country のみ）。
 * 認証は gsc-report.mjs と同じ読み取り専用サービスアカウント（kyounoko-readonly@…, siteOwner）を流用。
 *
 * 使い方:
 *   node scripts/gsc-discover.mjs                 # 直近28日 vs 前28日
 *   node scripts/gsc-discover.mjs --days=90        # 期間長を変更（Discoverは母数が小さいので長め推奨）
 *   node scripts/gsc-discover.mjs --lag=3          # GSC データ遅延（既定3日）
 *   node scripts/gsc-discover.mjs --json=/tmp/discover.json   # 生データを JSON 保存
 *   node scripts/gsc-discover.mjs --site=sc-domain:kyounoko.jp
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// ---- args ----
const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const DAYS = Number(arg('days', '28'));
const LAG = Number(arg('lag', '3'));
const SITE = arg('site', 'sc-domain:kyounoko.jp');
const JSON_OUT = arg('json', '');

// ---- credentials（gsc-report.mjs と同一ロジック）----
function loadCreds() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  }
  let path = './credentials/google-indexing.json';
  if (existsSync('.env.local')) {
    const line = readFileSync('.env.local', 'utf8')
      .split('\n')
      .find((l) => l.startsWith('GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH='));
    if (line) {
      const raw = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      path = raw.replace(/^~/, process.env.HOME || '');
    }
  }
  if (!existsSync(path)) {
    console.error(`認証情報が見つかりません: ${resolve(path)}`);
    console.error('GOOGLE_APPLICATION_CREDENTIALS_JSON か credentials/google-indexing.json を用意してください。');
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

// ---- date helpers ----
const iso = (d) => d.toISOString().slice(0, 10);
function dateRanges() {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - LAG);
  const recEnd = new Date(end);
  const recStart = new Date(end);
  recStart.setUTCDate(recStart.getUTCDate() - (DAYS - 1));
  const prevEnd = new Date(recStart);
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setUTCDate(prevStart.getUTCDate() - (DAYS - 1));
  return {
    rec: { start: iso(recStart), end: iso(recEnd) },
    prev: { start: iso(prevStart), end: iso(prevEnd) },
  };
}

// ---- GSC client ----
async function makeQuery() {
  const c = loadCreds();
  const jwt = new JWT({
    email: c.client_email,
    key: c.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const tok = (await jwt.getAccessToken()).token;
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  return async (body) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      console.error('GSC API error', r.status, (await r.text()).slice(0, 300));
      return [];
    }
    return (await r.json()).rows || [];
  };
}

// ---- formatting ----
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const pad = (s, n) => String(s).padStart(n);
const pct = (a, b) => (b === 0 ? '—' : `${(((a - b) / b) * 100).toFixed(0)}%`);
const sum = (rows) => rows.reduce((a, r) => ({ c: a.c + r.clicks, i: a.i + r.impressions }), { c: 0, i: 0 });
const short = (u) => u.replace(/^https?:\/\/(www\.)?kyounoko\.jp/, '').replace(/\/$/, '') || '/';
const h = (t) => console.log(`\n\x1b[1m=== ${t} ===\x1b[0m`);

async function main() {
  const q = await makeQuery();
  const { rec, prev } = dateRanges();
  console.log(`\x1b[1mGSC Discover レポート\x1b[0m  site=${SITE}`);
  console.log(`直近 ${DAYS}日: ${rec.start} 〜 ${rec.end}　/　比較: ${prev.start} 〜 ${prev.end}（GSC遅延 ${LAG}日）`);

  const dscv = (body) => q({ ...body, type: 'discover' });
  const web = (body) => q({ ...body, type: 'web' });

  // 注: Discover は device 次元でのグルーピング不可（API 仕様）。date/page/country のみ。
  const [recDate, recPage, prevPage, webRec] = await Promise.all([
    dscv({ startDate: prev.start, endDate: rec.end, dimensions: ['date'] }),
    dscv({ startDate: rec.start, endDate: rec.end, dimensions: ['page'], rowLimit: 500 }),
    dscv({ startDate: prev.start, endDate: prev.end, dimensions: ['page'], rowLimit: 500 }),
    web({ startDate: rec.start, endDate: rec.end, dimensions: ['date'] }),
  ]);

  if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify({ rec, prev, recDate, recPage, prevPage, webRec }));
    console.log(`生データを ${JSON_OUT} に保存`);
  }

  // Discover にデータが無い場合（未発生 or 閾値未満）
  const allDscv = sum(recDate);
  if (allDscv.i === 0 && allDscv.c === 0) {
    h('Discover データなし');
    console.log('この期間、Discover の表示・クリックは記録されていません。');
    console.log('考えられる理由:');
    console.log('  1) まだ Discover に拾われていない（記事の鮮度/画像/E-E-A-T が要件未達）');
    console.log('  2) 発生はしているがプライバシー閾値未満で非表示');
    console.log('  3) --days を 90 に伸ばすと出ることがある（母数が小さいため）');
    return;
  }

  // 期間を rec / prev に分割
  const split = (rows) => {
    const r = { c: 0, i: 0 }, p = { c: 0, i: 0 };
    for (const x of rows) {
      const d = x.keys[0];
      const t = d >= rec.start ? r : p;
      t.c += x.clicks; t.i += x.impressions;
    }
    return { r, p };
  };
  const { r: dr, p: dp } = split(recDate);

  // --- totals: Discover vs 前期 ---
  h('Discover TOTALS（直近 vs 前期）');
  console.log(`clicks      ${fmt(dr.c)}  vs ${fmt(dp.c)}  (${pct(dr.c, dp.c)})`);
  console.log(`impressions ${fmt(dr.i)}  vs ${fmt(dp.i)}  (${pct(dr.i, dp.i)})`);
  console.log(`CTR         ${(dr.i ? (dr.c / dr.i) * 100 : 0).toFixed(2)}% vs ${(dp.i ? (dp.c / dp.i) * 100 : 0).toFixed(2)}%`);

  // --- Discover が全流入に占める割合 ---
  const wsum = sum(webRec);
  const totalClk = dr.c + wsum.c;
  h('チャネル構成（直近）');
  console.log(`Web検索   ${pad(fmt(wsum.c), 6)}clk ${pad(fmt(wsum.i), 7)}imp`);
  console.log(`Discover  ${pad(fmt(dr.c), 6)}clk ${pad(fmt(dr.i), 7)}imp`);
  console.log(`→ Discover はクリック全体の ${totalClk ? ((dr.c / totalClk) * 100).toFixed(1) : '0'}%`);

  // --- 週次トレンド（Discover）---
  h('Discover 週次トレンド');
  const series = [...recDate].sort((a, b) => (a.keys[0] < b.keys[0] ? -1 : 1));
  console.log('week                       clicks    impr   CTR');
  for (let i = 0; i < series.length; i += 7) {
    const w = series.slice(i, i + 7);
    const c = w.reduce((s, x) => s + x.clicks, 0);
    const im = w.reduce((s, x) => s + x.impressions, 0);
    console.log(`${w[0].keys[0]}~${w[w.length - 1].keys[0]}  ${pad(c, 6)}  ${pad(fmt(im), 6)}  ${(im ? (c / im) * 100 : 0).toFixed(1)}%`);
  }

  // --- Discover で拾われたページ TOP（何が効くか）---
  h('Discover TOP30 ページ（クリック順）— 何が拾われているか');
  const ppm = new Map(prevPage.map((x) => [x.keys[0], x]));
  [...recPage].sort((a, b) => b.clicks - a.clicks).slice(0, 30).forEach((x) => {
    const pr = ppm.get(x.keys[0]);
    console.log(`${pad(x.clicks, 5)}clk ${pad(fmt(x.impressions), 7)}imp CTR${pad((x.ctr * 100).toFixed(1), 5)}%  ${short(x.keys[0])} (${pr ? `was ${pr.clicks}` : 'NEW'})`);
  });

  // --- 高インプレ低CTR（Discover の表紙画像/タイトルが弱い）---
  h('Discover 表示多いがCTR低い（imp>=500, CTR<2%）— サムネ画像/タイトル要改善');
  recPage.filter((x) => x.impressions >= 500 && x.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions).slice(0, 15)
    .forEach((x) => console.log(`${pad(fmt(x.impressions), 7)}imp CTR${pad((x.ctr * 100).toFixed(1), 5)}% ${x.clicks}clk  ${short(x.keys[0])}`));
}

main().catch((e) => { console.error(e); process.exit(1); });
