#!/usr/bin/env node
/**
 * GSC ローカル分析レポート（実データ）
 *
 * Vercel の本番 env（GOOGLE_APPLICATION_CREDENTIALS_JSON / SEARCH_CONSOLE_SITE_URL）は
 * Encrypted で pull できないが、IndexNow 用に置いてある読み取り専用サービスアカウント
 * （credentials/google-indexing.json = kyounoko-readonly@…）が Search Console に
 * siteOwner 権限を持っているため、これを流用してローカルから実データを引ける。
 *
 * 使い方:
 *   node scripts/gsc-report.mjs                 # 直近28日 vs 前28日
 *   node scripts/gsc-report.mjs --days=28        # 期間長を変更
 *   node scripts/gsc-report.mjs --lag=3          # GSC データ遅延（既定3日）
 *   node scripts/gsc-report.mjs --json=/tmp/gsc.json   # 生データを JSON 保存
 *   node scripts/gsc-report.mjs --site=https://kyounoko.jp/   # サイト指定
 *
 * 認証情報の探索順:
 *   1) 環境変数 GOOGLE_APPLICATION_CREDENTIALS_JSON（JSON 文字列）
 *   2) .env.local の GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH が指すファイル
 *   3) ./credentials/google-indexing.json
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

// ---- credentials ----
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
const wpos = (rows) => {
  const ti = rows.reduce((s, r) => s + r.impressions, 0);
  return ti ? rows.reduce((s, r) => s + r.position * r.impressions, 0) / ti : 0;
};
const short = (u) => u.replace(/^https?:\/\/(www\.)?kyounoko\.jp/, '').replace(/\/$/, '') || '/';
const h = (t) => console.log(`\n\x1b[1m=== ${t} ===\x1b[0m`);

// ---- chains for coverage report ----
const CHAINS = [
  'サイゼ', '王将', 'ガスト', 'やよい軒', 'ココス', 'バーミヤン', 'ジョナサン',
  'はま寿司', 'スシロー', 'くら寿司', 'かっぱ寿司', '丸亀', '吉野家', 'すき家',
  'ジョイフル', 'デニーズ', 'ロイヤルホスト', 'ビッグボーイ', '牛角', '焼肉キング',
  'しゃぶ葉', '大戸屋', '日高屋', 'てんや', '幸楽苑', 'リンガーハット', 'びっくりドンキー',
  'ココイチ', 'マクドナルド', 'ケンタッキー', 'モス', 'なか卯', '松屋', 'デニーズ',
];

async function main() {
  const q = await makeQuery();
  const { rec, prev } = dateRanges();
  console.log(`\x1b[1mGSC レポート\x1b[0m  site=${SITE}`);
  console.log(`直近 ${DAYS}日: ${rec.start} 〜 ${rec.end}　/　比較: ${prev.start} 〜 ${prev.end}（GSC遅延 ${LAG}日）`);

  const [recTotals, prevTotals, recQ, prevQ, recP, prevP, device] = await Promise.all([
    q({ startDate: prev.start, endDate: rec.end, dimensions: ['date'] }),
    q({ startDate: prev.start, endDate: prev.end, dimensions: ['date'] }), // unused placeholder
    q({ startDate: rec.start, endDate: rec.end, dimensions: ['query'], rowLimit: 1000 }),
    q({ startDate: prev.start, endDate: prev.end, dimensions: ['query'], rowLimit: 1000 }),
    q({ startDate: rec.start, endDate: rec.end, dimensions: ['page'], rowLimit: 500 }),
    q({ startDate: prev.start, endDate: prev.end, dimensions: ['page'], rowLimit: 500 }),
    q({ startDate: rec.start, endDate: rec.end, dimensions: ['device'] }),
  ]);

  if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify({ rec, prev, recTotals, recQ, prevQ, recP, prevP, device }));
    console.log(`生データを ${JSON_OUT} に保存`);
  }

  // --- totals（device 集計が最も実数に近い。query 集計はプライバシー閾値で過小）---
  h('TOTALS（query集計・直近 vs 前期）');
  const r = sum(recQ), p = sum(prevQ);
  console.log(`clicks      ${fmt(r.c)}  vs ${fmt(p.c)}  (${pct(r.c, p.c)})`);
  console.log(`impressions ${fmt(r.i)}  vs ${fmt(p.i)}  (${pct(r.i, p.i)})`);
  console.log(`CTR         ${(r.i ? (r.c / r.i) * 100 : 0).toFixed(2)}% vs ${(p.i ? (p.c / p.i) * 100 : 0).toFixed(2)}%`);
  console.log(`avg pos     ${wpos(recQ).toFixed(1)} vs ${wpos(prevQ).toFixed(1)}`);
  console.log(`#queries    ${recQ.length}${recQ.length === 1000 ? '(上限)' : ''} vs ${prevQ.length}`);

  // --- weekly trend ---
  h('週次トレンド');
  const series = [...recTotals].sort((a, b) => (a.keys[0] < b.keys[0] ? -1 : 1));
  console.log('week                       clicks    impr   CTR');
  for (let i = 0; i < series.length; i += 7) {
    const w = series.slice(i, i + 7);
    const c = w.reduce((s, x) => s + x.clicks, 0);
    const im = w.reduce((s, x) => s + x.impressions, 0);
    console.log(`${w[0].keys[0]}~${w[w.length - 1].keys[0]}  ${pad(c, 6)}  ${pad(fmt(im), 6)}  ${(im ? (c / im) * 100 : 0).toFixed(1)}%`);
  }

  // --- device ---
  h('デバイス別');
  device.forEach((x) =>
    console.log(`${x.keys[0].padEnd(8)} ${pad(fmt(x.clicks), 5)}clk ${pad(fmt(x.impressions), 6)}imp CTR${(x.ctr * 100).toFixed(1)}% pos${x.position.toFixed(1)}`),
  );

  const pm = new Map(prevQ.map((x) => [x.keys[0], x]));

  // --- top queries ---
  h('TOP20 クエリ（クリック順）');
  [...recQ].sort((a, b) => b.clicks - a.clicks).slice(0, 20).forEach((x) => {
    const pr = pm.get(x.keys[0]);
    const w = pr ? `was ${pr.clicks}clk pos${pr.position.toFixed(1)}` : 'NEW';
    console.log(`${pad(x.clicks, 4)}clk ${pad(fmt(x.impressions), 6)}imp CTR${pad((x.ctr * 100).toFixed(1), 5)}% pos${pad(x.position.toFixed(1), 5)}  ${x.keys[0]} (${w})`);
  });

  // --- gainers ---
  h('クリック増加 TOP20（前期比）');
  recQ
    .map((x) => { const pr = pm.get(x.keys[0]); return { q: x.keys[0], c: x.clicks, pc: pr ? pr.clicks : 0, pos: x.position, ppos: pr ? pr.position : null }; })
    .map((x) => ({ ...x, d: x.c - x.pc }))
    .sort((a, b) => b.d - a.d).slice(0, 20)
    .forEach((x) => console.log(`+${pad(x.d, 4)}  ${x.c}clk(was ${x.pc}) pos${x.pos.toFixed(1)}${x.ppos ? `(was ${x.ppos.toFixed(1)})` : ''}  ${x.q}`));

  // --- CTR opportunities (query) ---
  h('CTR取りこぼし（pos<=10, imp>=200, CTR<3%）— 順位は良いがスニペットが弱い');
  recQ.filter((x) => x.position <= 10 && x.impressions >= 200 && x.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions).slice(0, 25)
    .forEach((x) => console.log(`${pad(fmt(x.impressions), 6)}imp CTR${pad((x.ctr * 100).toFixed(1), 5)}% pos${pad(x.position.toFixed(1), 4)} ${x.clicks}clk  ${x.keys[0]}`));

  // --- striking distance ---
  h('あと一歩（pos 8-20, imp>=150）— 押し上げ候補');
  recQ.filter((x) => x.position >= 8 && x.position <= 20 && x.impressions >= 150)
    .sort((a, b) => b.impressions - a.impressions).slice(0, 30)
    .forEach((x) => console.log(`${pad(fmt(x.impressions), 6)}imp pos${pad(x.position.toFixed(1), 5)} CTR${(x.ctr * 100).toFixed(1)}% ${x.clicks}clk  ${x.keys[0]}`));

  // --- top pages ---
  h('TOP20 ページ（クリック順）');
  const ppm = new Map(prevP.map((x) => [x.keys[0], x]));
  [...recP].sort((a, b) => b.clicks - a.clicks).slice(0, 20).forEach((x) => {
    const pr = ppm.get(x.keys[0]);
    console.log(`${pad(x.clicks, 4)}clk ${pad(fmt(x.impressions), 6)}imp CTR${pad((x.ctr * 100).toFixed(1), 5)}% pos${pad(x.position.toFixed(1), 4)}  ${short(x.keys[0])} (${pr ? `was ${pr.clicks}` : 'NEW'})`);
  });

  // --- page CTR rewrite targets ---
  h('ページCTR改善対象（pos<=12, imp>=300, CTR<3%）— タイトル/メタ書き換え');
  recP.filter((x) => x.position <= 12 && x.impressions >= 300 && x.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions).slice(0, 20)
    .forEach((x) => console.log(`${pad(fmt(x.impressions), 6)}imp CTR${pad((x.ctr * 100).toFixed(1), 5)}% pos${pad(x.position.toFixed(1), 4)} ${x.clicks}clk  ${short(x.keys[0])}`));

  // --- content gaps ---
  h('コンテンツギャップ（pos>=12, imp>=150）— 需要はあるが取れていない');
  const gaps = recQ.filter((x) => x.position >= 12 && x.impressions >= 150).sort((a, b) => b.impressions - a.impressions).slice(0, 30);
  if (gaps.length === 0) console.log('該当なし（記事のある領域は全て上位）');
  gaps.forEach((x) => console.log(`${pad(fmt(x.impressions), 6)}imp pos${pad(x.position.toFixed(1), 5)} CTR${(x.ctr * 100).toFixed(1)}% ${x.clicks}clk  ${x.keys[0]}`));

  // --- chain coverage ---
  h('チェーン別カバレッジ（表示順）');
  const agg = {};
  for (const x of recQ) for (const ch of CHAINS) if (x.keys[0].includes(ch)) {
    agg[ch] = agg[ch] || { c: 0, i: 0, n: 0 };
    agg[ch].c += x.clicks; agg[ch].i += x.impressions; agg[ch].n++;
  }
  Object.entries(agg).sort((a, b) => b[1].i - a[1].i)
    .forEach(([k, v]) => console.log(`${k.padEnd(8)} ${pad(v.c, 4)}clk ${pad(fmt(v.i), 6)}imp  ${v.n}q`));
}

main().catch((e) => { console.error(e); process.exit(1); });
