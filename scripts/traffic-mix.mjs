#!/usr/bin/env node
/**
 * 流入ミックスの突合レポート（GSC × GA4 を同一期間で並べる）
 *
 * 目的: 「GSCクリック 22,830 に対し GA4セッション 74,736（3.3倍）」の内訳を確定する。
 * 100万PVの設計は「今どこから来ているか」が分からないと組めない。ここを最初に潰す。
 *
 * 既存の gsc-report.mjs / ga4-report.mjs と同じ読み取り専用SA
 * （credentials/google-indexing.json = kyounoko-readonly@…）を流用する。
 * GA4 は Analytics Data API の有効化と、GA4プロパティへの「閲覧者」追加が前提
 * （詳細は scripts/ga4-report.mjs のヘッダ参照）。
 *
 * 使い方:
 *   node scripts/traffic-mix.mjs                          # 直近28日（GSC遅延3日に合わせる）
 *   node scripts/traffic-mix.mjs --days=90
 *   node scripts/traffic-mix.mjs --property=533628127     # GA4プロパティID（既定値あり）
 *   node scripts/traffic-mix.mjs --json=/tmp/mix.json --md=reports/traffic-mix-2026-09-11.md
 *
 * ⚠️ 期間を必ず揃えること。GA4の "28daysAgo〜yesterday" と GSCの遅延3日窓は別物で、
 *    揃えずに比べると乖離の数字そのものが狂う。このスクリプトは GSC 側の窓
 *    （end = 今日 - lag, start = end - (days-1)）に GA4 を合わせる。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

// ---- args ----
const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const DAYS = Number(arg('days', '28'));
const LAG = Number(arg('lag', '3'));
const SITE = arg('site', 'sc-domain:kyounoko.jp');
const PROPERTY = arg('property', '533628127');
const JSON_OUT = arg('json', '');
const MD_OUT = arg('md', '');

// ---- credentials（gsc-report.mjs と同じ探索順）----
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
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

// ---- 期間（GSCの窓にGA4を合わせる）----
const iso = (d) => d.toISOString().slice(0, 10);
const end = new Date();
end.setUTCDate(end.getUTCDate() - LAG);
const start = new Date(end);
start.setUTCDate(start.getUTCDate() - (DAYS - 1));
const RANGE = { start: iso(start), end: iso(end) };

// ---- clients ----
const creds = loadCreds();
const jwt = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
  ],
});
const token = (await jwt.getAccessToken()).token;

async function gsc(body) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: RANGE.start, endDate: RANGE.end, ...body }),
  });
  if (!r.ok) {
    console.error('GSC API error', r.status, (await r.text()).slice(0, 300));
    return [];
  }
  return (await r.json()).rows || [];
}

async function ga4(body) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ dateRanges: [{ startDate: RANGE.start, endDate: RANGE.end }], ...body }),
  });
  if (!r.ok) {
    console.error('GA4 API error', r.status, (await r.text()).slice(0, 300));
    return null;
  }
  return r.json();
}

// ---- helpers ----
const num = (n) => Math.round(Number(n) || 0);
const fmt = (n) => num(n).toLocaleString('en-US');
const pad = (s, n) => String(s).padStart(n);
const rows2 = (j) => (j?.rows || []).map((r) => ({
  key: r.dimensionValues.map((d) => d.value),
  m: r.metricValues.map((v) => Number(v.value) || 0),
}));
const AI_HOSTS = /chatgpt|openai|perplexity|copilot|gemini|bard|claude|poe\.com|felo|genspark/i;
const SEARCH_HOSTS = /google|yahoo|bing|duckduckgo|ecosia|baidu|naver/i;
const SOCIAL_HOSTS = /line\.me|t\.co|twitter|x\.com|instagram|facebook|pinterest|threads|tiktok|note\.com|hatena/i;

const out = [];
const say = (s = '') => { console.log(s); out.push(s); };

// ---- 1) GSC 実数 ----
const gscDaily = await gsc({ dimensions: ['date'], rowLimit: 1000 });
const gscTotal = gscDaily.reduce(
  (a, r) => ({ clicks: a.clicks + r.clicks, imp: a.imp + r.impressions }),
  { clicks: 0, imp: 0 },
);

// ---- 2) GA4 実数 ----
const totals = await ga4({
  metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'totalUsers' }, { name: 'engagedSessions' }],
});
const t = rows2(totals)[0]?.m || [0, 0, 0, 0];
const [sessions, pv, users, engaged] = t;

const chan = await ga4({
  dimensions: [{ name: 'sessionDefaultChannelGroup' }],
  metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
  orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  limit: 30,
});

const srcMed = await ga4({
  dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
  metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
  orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  limit: 40,
});

const directLanding = await ga4({
  dimensions: [{ name: 'landingPagePlusQueryString' }],
  metrics: [{ name: 'sessions' }],
  dimensionFilter: {
    filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { matchType: 'EXACT', value: 'Direct' } },
  },
  orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  limit: 20,
});

// ---- 出力 ----
say(`# 流入ミックス突合 ${RANGE.start} 〜 ${RANGE.end}（${DAYS}日・GSC遅延${LAG}日に合わせて同一期間）`);
say('');
say(`GSC site=${SITE} / GA4 property=${PROPERTY} / SA=${creds.client_email}`);
say('');

say('## 1. 突合（ここが本題）');
say('');
const organic = rows2(chan).find((r) => /Organic Search/i.test(r.key[0]));
const organicSess = organic?.m[0] || 0;
say('| 指標 | 実数 |');
say('|---|---:|');
say(`| GSC クリック | ${fmt(gscTotal.clicks)} |`);
say(`| GSC 表示 | ${fmt(gscTotal.imp)} |`);
say(`| GA4 セッション（全体） | ${fmt(sessions)} |`);
say(`| GA4 うち Organic Search | ${fmt(organicSess)} |`);
say(`| GA4 PV | ${fmt(pv)} |`);
say(`| PV / セッション | ${sessions ? (pv / sessions).toFixed(2) : '—'} |`);
say('');
say(`- **GA4全体 ÷ GSCクリック = ${gscTotal.clicks ? (sessions / gscTotal.clicks).toFixed(2) : '—'}倍**`);
say(`- **Organic Search ÷ GSCクリック = ${gscTotal.clicks ? (organicSess / gscTotal.clicks).toFixed(2) : '—'}倍**`);
say('');
say('読み方: 後者が 1.0〜1.3 に収まっていれば、乖離の主因は「検索以外のチャネル」で健全。');
say('後者が 2倍以上なら Organic Search の中身（Google以外の検索・自己参照・計測仕様）を疑う。');
say('');

say('## 2. チャネル別');
say('');
say('| チャネル | セッション | 構成比 | PV | PV/セッション |');
say('|---|---:|---:|---:|---:|');
for (const r of rows2(chan)) {
  const share = sessions ? ((r.m[0] / sessions) * 100).toFixed(1) + '%' : '—';
  const pps = r.m[0] ? (r.m[1] / r.m[0]).toFixed(2) : '—';
  say(`| ${r.key[0]} | ${fmt(r.m[0])} | ${share} | ${fmt(r.m[1])} | ${pps} |`);
}
say('');

say('## 3. source / medium（上位40）');
say('');
say('| source | medium | 種別 | セッション | PV/セッション |');
say('|---|---|---|---:|---:|');
const buckets = { AI: 0, 検索: 0, SNS: 0, 直接: 0, その他: 0 };
for (const r of rows2(srcMed)) {
  const [s, m] = r.key;
  let kind = 'その他';
  if (AI_HOSTS.test(s)) kind = 'AI';
  else if (s === '(direct)') kind = '直接';
  else if (SEARCH_HOSTS.test(s)) kind = '検索';
  else if (SOCIAL_HOSTS.test(s)) kind = 'SNS';
  buckets[kind] += r.m[0];
  const pps = r.m[0] ? (r.m[1] / r.m[0]).toFixed(2) : '—';
  say(`| ${s} | ${m} | ${kind} | ${fmt(r.m[0])} | ${pps} |`);
}
say('');
say('### 種別の合計（上位40行の範囲）');
say('');
say('| 種別 | セッション |');
say('|---|---:|');
for (const [k, v] of Object.entries(buckets)) say(`| ${k} | ${fmt(v)} |`);
say('');

say('## 4. Direct の着地ページ（上位20）');
say('');
say('Direct が多い場合、本当に指名で来ているのか、計測漏れ（リファラ落ち）か、');
say('内部遷移の計上かをここで見分ける。記事URLが並ぶなら「リファラ落ちした検索/AI流入」の可能性が高い。');
say('');
say('| 着地ページ | セッション |');
say('|---|---:|');
for (const r of rows2(directLanding)) say(`| ${r.key[0]} | ${fmt(r.m[0])} |`);
say('');

say('## 5. 次の判断');
say('');
say('- Organic Search ≒ GSCクリック なら、伸ばす対象は「検索クリック」で正しい（戦略どおり）');
say('- AI が数千セッション規模なら、GEO（llms.txt・構造化・一次データ）の優先度を上げる');
say('- Direct が過半で着地が記事URLなら、まず計測を直す（施策の効果測定が全部ずれる）');

// ---- 保存 ----
if (JSON_OUT) {
  const payload = {
    range: RANGE, site: SITE, property: PROPERTY,
    gsc: { clicks: gscTotal.clicks, impressions: gscTotal.imp, daily: gscDaily },
    ga4: {
      sessions, pageViews: pv, users, engagedSessions: engaged,
      channels: rows2(chan), sourceMedium: rows2(srcMed), directLanding: rows2(directLanding),
    },
  };
  mkdirSync(dirname(resolve(JSON_OUT)), { recursive: true });
  writeFileSync(JSON_OUT, JSON.stringify(payload, null, 2));
  console.error(`\njson: ${JSON_OUT}`);
}
if (MD_OUT) {
  mkdirSync(dirname(resolve(MD_OUT)), { recursive: true });
  writeFileSync(MD_OUT, out.join('\n') + '\n');
  console.error(`md:   ${MD_OUT}`);
}
