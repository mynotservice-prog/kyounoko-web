#!/usr/bin/env node
/**
 * 判定用: 対象URL群を GSC の page 次元でまとめて集計する（読み取り専用）。
 *
 * 本体チェックアウトのルートから実行する（credentials/google-indexing.json を読む）:
 *   node reports/verdicts-prep-2026-10/gsc-pages.mjs --set=okuizome --start=2026-09-13 --end=2026-09-30
 *
 * オプション:
 *   --set=<name>            targets.json のセット名（okuizome / cohort137 / winpages6 / exp3 / exp4 / titles15）
 *   --start / --end         測る窓（YYYY-MM-DD・両端含む）
 *   --cmp-start / --cmp-end 比較窓（任意）。ページ別に前後を並べる
 *   --state=final|all       既定 final（判定は final のみ。all は速報値）
 *   --exclude=d1,d2         集計から外す日（例: デスクトップbotの 2026-09-07,2026-09-08,2026-09-09）
 *   --device=MOBILE         デバイスで絞る（page×device は行が欠ける罠あり。参考値）
 *   --daily                 群合計の日次を出す
 *   --daily-pages           ページ別の日次（順位つき）を出す
 *   --split=YYYY-MM-DD      変化点の前後で1日あたりを比べる（その日以降を「後」）
 *   --posbands              page×query を順位帯に分けて CTR を出す（--cmp-* と併用。匿名化クエリは落ちる）
 *   --json=<path>           生の行を保存
 *
 * 計器の罠への対応:
 *   - query 次元の総数は使わない。総数は date×page で取り、自分で足す。
 *   - rowLimit 打ち切りを避けるため startRow でページングする。
 *   - dataState は既定 final。窓の終端に final が届いていなければ警告を出す。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const has = (k) => process.argv.includes(`--${k}`);

const SITE = arg('site', 'sc-domain:kyounoko.jp');
const SET = arg('set', '');
const START = arg('start', '');
const END = arg('end', '');
const CMP_START = arg('cmp-start', '');
const CMP_END = arg('cmp-end', '');
const STATE = arg('state', 'final');
const EXCLUDE = new Set(arg('exclude', '').split(',').filter(Boolean));
const DEVICE = arg('device', '');
const SPLIT = arg('split', '');
const JSON_OUT = arg('json', '');

const targets = JSON.parse(readFileSync(join(HERE, 'targets.json'), 'utf8'));
if (!SET || !targets[SET] || !START || !END) {
  console.error('使い方: --set=<' + Object.keys(targets).filter((k) => !k.startsWith('_')).join('|') + '> --start=YYYY-MM-DD --end=YYYY-MM-DD');
  process.exit(1);
}
const groups = targets[SET].groups;
const slugGroup = new Map();
for (const [g, slugs] of Object.entries(groups)) for (const s of slugs) slugGroup.set(s, g);
const allSlugs = [...slugGroup.keys()];

function loadCreds() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  const p = './credentials/google-indexing.json';
  if (!existsSync(p)) {
    console.error('認証情報が見つかりません（本体チェックアウトのルートから実行してください）: ' + p);
    process.exit(1);
  }
  return JSON.parse(readFileSync(p, 'utf8'));
}
const c = loadCreds();
const jwt = new JWT({ email: c.client_email, key: c.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
const tok = (await jwt.getAccessToken()).token;
const API = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;

async function call(body) {
  const r = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) {
    console.error('GSC API error', r.status, (await r.text()).slice(0, 400));
    process.exit(2); // 黙って空を返さない（偽の「表示0」を防ぐ）
  }
  return (await r.json()).rows || [];
}

const slugOf = (url) => {
  const m = url.match(/\/article\/([^/?#]+)\/?(?:[?#].*)?$/);
  return m ? m[1] : null;
};

/** 対象slugだけを page 正規表現で絞って取得（30本ずつ・startRow でページング） */
async function fetchRows(start, end, dims) {
  const out = [];
  for (let i = 0; i < allSlugs.length; i += 30) {
    const chunk = allSlugs.slice(i, i + 30);
    const filters = [{ dimension: 'page', operator: 'includingRegex', expression: `/article/(${chunk.join('|')})/?$` }];
    if (DEVICE) filters.push({ dimension: 'device', operator: 'equals', expression: DEVICE });
    for (let startRow = 0; ; startRow += 25000) {
      const rows = await call({ startDate: start, endDate: end, dimensions: dims, dimensionFilterGroups: [{ filters }], rowLimit: 25000, startRow, dataState: STATE });
      out.push(...rows);
      if (rows.length < 25000) break;
    }
  }
  return out;
}

const fmt = (n) => Math.round(n).toLocaleString('en-US');
const pad = (s, n) => String(s).padStart(n);
const ctr = (c2, i) => (i ? ((c2 / i) * 100).toFixed(2) + '%' : '—');
const posf = (ps, i) => (i ? (ps / i).toFixed(1) : '—');
const h = (t) => console.log(`\n=== ${t} ===`);
const dayCount = (s, e) => Math.round((new Date(e) - new Date(s)) / 86400000) + 1;

function aggregate(rows) {
  // rows: keys=[date, page]
  const byPage = new Map(allSlugs.map((s) => [s, { c: 0, i: 0, ps: 0, days: 0 }]));
  const byDate = new Map();
  const byDatePage = new Map();
  let lastDate = '';
  for (const r of rows) {
    const [d, page] = r.keys;
    const slug = slugOf(page);
    if (!slug || !slugGroup.has(slug)) continue;
    if (d > lastDate) lastDate = d;
    if (EXCLUDE.has(d)) continue;
    const p = byPage.get(slug);
    p.c += r.clicks; p.i += r.impressions; p.ps += r.position * r.impressions; p.days += 1;
    const g = slugGroup.get(slug);
    const key = `${d}|${g}`;
    const x = byDate.get(key) || { c: 0, i: 0, ps: 0, pages: 0 };
    x.c += r.clicks; x.i += r.impressions; x.ps += r.position * r.impressions; x.pages += 1;
    byDate.set(key, x);
    const k2 = `${d}|${slug}`;
    const y = byDatePage.get(k2) || { c: 0, i: 0, ps: 0 };
    y.c += r.clicks; y.i += r.impressions; y.ps += r.position * r.impressions;
    byDatePage.set(k2, y);
  }
  return { byPage, byDate, byDatePage, lastDate };
}

function printPages(label, agg, start, end) {
  h(`${label}  ${start} 〜 ${end}（${dayCount(start, end)}日${EXCLUDE.size ? `・除外 ${[...EXCLUDE].join(',')}` : ''}・dataState=${STATE}${DEVICE ? `・device=${DEVICE}` : ''}）`);
  console.log(`データのある最終日: ${agg.lastDate || 'なし'}${agg.lastDate && agg.lastDate < end ? `  ⚠️ 窓の終端 ${end} まで ${STATE} が届いていない（判定に使わない／窓を詰める）` : ''}`);
  for (const [g, slugs] of Object.entries(groups)) {
    let tc = 0, ti = 0, tps = 0, withImp = 0;
    const per = [];
    console.log(`\n[${g}] ${slugs.length}本`);
    console.log('   clk     imp     CTR    pos  日数  slug');
    const sorted = [...slugs].sort((a, b) => agg.byPage.get(b).c - agg.byPage.get(a).c || agg.byPage.get(b).i - agg.byPage.get(a).i);
    for (const s of sorted) {
      const p = agg.byPage.get(s);
      tc += p.c; ti += p.i; tps += p.ps; if (p.i > 0) withImp++;
      per.push(p.c);
      if (slugs.length <= 40 || p.i > 0) console.log(`${pad(p.c, 6)} ${pad(fmt(p.i), 7)} ${pad(ctr(p.c, p.i), 7)} ${pad(posf(p.ps, p.i), 6)} ${pad(p.days, 5)}  ${s}`);
    }
    if (slugs.length > 40) console.log(`   （表示0の ${slugs.length - withImp}本は省略）`);
    per.sort((a, b) => a - b);
    const med = per.length ? (per.length % 2 ? per[(per.length - 1) / 2] : (per[per.length / 2 - 1] + per[per.length / 2]) / 2) : 0;
    const days = dayCount(start, end) - [...EXCLUDE].filter((d) => d >= start && d <= end).length;
    console.log(`合計 ${fmt(tc)}clk / ${fmt(ti)}imp / CTR ${ctr(tc, ti)} / 加重順位 ${posf(tps, ti)} ｜ 表示のある本数 ${withImp}/${slugs.length} ｜ 1本あたりclk中央値 ${med} ｜ ${(tc / days).toFixed(1)}clk/日 ｜ ${((tc / days) * 7 / slugs.length).toFixed(1)}clk/本/週`);
  }
}

// ---- main ----
console.log(`set=${SET}（${targets[SET].source}）  site=${SITE}`);
const rows = await fetchRows(START, END, ['date', 'page']);
const agg = aggregate(rows);
printPages('測る窓', agg, START, END);

let cmpAgg = null;
if (CMP_START && CMP_END) {
  const cmpRows = await fetchRows(CMP_START, CMP_END, ['date', 'page']);
  cmpAgg = aggregate(cmpRows);
  printPages('比較窓', cmpAgg, CMP_START, CMP_END);
  h('ページ別 前後比較（比較窓 → 測る窓）');
  console.log('  CTR前    CTR後    差pt   pos前  pos後   imp前    imp後   slug');
  let bc = 0, bi = 0, bps = 0, ac = 0, ai = 0, aps = 0;
  for (const s of allSlugs) {
    const b = cmpAgg.byPage.get(s), a = agg.byPage.get(s);
    bc += b.c; bi += b.i; bps += b.ps; ac += a.c; ai += a.i; aps += a.ps;
    const d = b.i && a.i ? ((a.c / a.i - b.c / b.i) * 100).toFixed(2) : '—';
    console.log(`${pad(ctr(b.c, b.i), 7)}  ${pad(ctr(a.c, a.i), 7)}  ${pad(d, 6)}  ${pad(posf(b.ps, b.i), 5)}  ${pad(posf(a.ps, a.i), 5)}  ${pad(fmt(b.i), 6)}  ${pad(fmt(a.i), 7)}   ${s} [${slugGroup.get(s)}]`);
  }
  console.log(`全体（全群の単純合算）: CTR ${ctr(bc, bi)} → ${ctr(ac, ai)} ／ 加重順位 ${posf(bps, bi)} → ${posf(aps, ai)} ／ clk ${fmt(bc)} → ${fmt(ac)} ／ imp ${fmt(bi)} → ${fmt(ai)}`);
}

if (has('daily')) {
  h('群合計の日次');
  const dates = [...new Set([...agg.byDate.keys()].map((k) => k.split('|')[0]))].sort();
  const wd = ['日', '月', '火', '水', '木', '金', '土'];
  for (const g of Object.keys(groups)) {
    console.log(`\n[${g}]  date        曜   clk    imp    CTR    pos  表示のあるページ数`);
    for (const d of dates) {
      const x = agg.byDate.get(`${d}|${g}`) || { c: 0, i: 0, ps: 0, pages: 0 };
      console.log(`      ${d}  ${wd[new Date(d).getUTCDay()]}  ${pad(x.c, 5)} ${pad(fmt(x.i), 6)} ${pad(ctr(x.c, x.i), 7)} ${pad(posf(x.ps, x.i), 5)}  ${x.pages}`);
    }
  }
}

if (has('daily-pages')) {
  h('ページ別の日次（clk / imp / pos）');
  const dates = [...new Set([...agg.byDatePage.keys()].map((k) => k.split('|')[0]))].sort();
  for (const s of allSlugs) {
    console.log(`\n${s} [${slugGroup.get(s)}]`);
    for (const d of dates) {
      const y = agg.byDatePage.get(`${d}|${s}`);
      console.log(`  ${d}  ${y ? `${pad(y.c, 4)}clk ${pad(fmt(y.i), 6)}imp pos${pad(posf(y.ps, y.i), 5)}` : '   （行なし）'}`);
    }
  }
}

if (SPLIT) {
  h(`変化点 ${SPLIT} の前後（1日あたり。「後」は ${SPLIT} 当日を含む）`);
  console.log('  clk/日 前→後      imp/日 前→後        CTR 前→後          pos 前→後     slug');
  for (const s of allSlugs) {
    const b = { c: 0, i: 0, ps: 0, n: 0 }, a = { c: 0, i: 0, ps: 0, n: 0 };
    for (let t = new Date(START); t <= new Date(END); t.setUTCDate(t.getUTCDate() + 1)) {
      const d = t.toISOString().slice(0, 10);
      if (EXCLUDE.has(d) || (agg.lastDate && d > agg.lastDate)) continue;
      const y = agg.byDatePage.get(`${d}|${s}`) || { c: 0, i: 0, ps: 0 };
      const z = d < SPLIT ? b : a;
      z.c += y.c; z.i += y.i; z.ps += y.ps; z.n += 1;
    }
    const per = (v, n) => (n ? (v / n).toFixed(1) : '—');
    console.log(`${pad(per(b.c, b.n), 6)} → ${pad(per(a.c, a.n), 6)}   ${pad(per(b.i, b.n), 7)} → ${pad(per(a.i, a.n), 7)}   ${pad(ctr(b.c, b.i), 7)} → ${pad(ctr(a.c, a.i), 7)}   ${pad(posf(b.ps, b.i), 5)} → ${pad(posf(a.ps, a.i), 5)}   ${s} [${slugGroup.get(s)}]（前${b.n}日・後${a.n}日）`);
  }
}

if (has('posbands')) {
  // page×query を順位帯に分けて CTR を比べる。匿名化クエリは落ちるので、page 合計に対する捕捉率を併記する。
  const bands = [[1, 3], [3, 5], [5, 7], [7, 10], [10, 1000]];
  const bandOf = (p) => bands.findIndex(([lo, hi]) => p >= lo && p < hi);
  const run = async (label, s, e, pageAgg) => {
    const qrows = (await fetchRows(s, e, ['date', 'page', 'query'])).filter((r) => !EXCLUDE.has(r.keys[0]) && slugGroup.has(slugOf(r.keys[1]) || ''));
    const acc = bands.map(() => ({ c: 0, i: 0 }));
    let qc = 0, qi = 0;
    for (const r of qrows) {
      const b = bandOf(r.position);
      if (b < 0) continue;
      acc[b].c += r.clicks; acc[b].i += r.impressions; qc += r.clicks; qi += r.impressions;
    }
    let pc = 0, pi = 0;
    for (const p of pageAgg.byPage.values()) { pc += p.c; pi += p.i; }
    console.log(`\n${label} ${s}〜${e}  捕捉率（query行 ÷ page合計）: clk ${pc ? ((qc / pc) * 100).toFixed(0) : '—'}% / imp ${pi ? ((qi / pi) * 100).toFixed(0) : '—'}%`);
    bands.forEach(([lo, hi], k) => console.log(`  pos ${pad(lo, 2)}〜${hi === 1000 ? '  ' : pad(hi, 2)}未満  ${pad(fmt(acc[k].i), 7)}imp ${pad(acc[k].c, 5)}clk  CTR ${ctr(acc[k].c, acc[k].i)}`));
    return acc;
  };
  h('順位帯別CTR（日×ページ×クエリの行を順位で帯分け。帯の区切りは集計上の選択で、合否の閾値ではない）');
  if (cmpAgg) await run('比較窓', CMP_START, CMP_END, cmpAgg);
  await run('測る窓', START, END, agg);
}

if (JSON_OUT) {
  writeFileSync(JSON_OUT, JSON.stringify({ set: SET, start: START, end: END, state: STATE, rows }));
  console.log(`\n生データを ${JSON_OUT} に保存`);
}
