#!/usr/bin/env node
/**
 * GEO（生成AI検索）経由流入レポート — GA4 実測
 *
 * ChatGPT / Perplexity / Copilot / Gemini / Claude 等のリファラ流入を
 * GA4 Data API から引く。週次オペ（geo-max スキル手順1）用。
 *
 * 使い方:
 *   node scripts/geo-ai-report.mjs                    # 直近28日
 *   node scripts/geo-ai-report.mjs --days=90          # 期間変更
 *   node scripts/geo-ai-report.mjs --property=533628127
 *
 * 認証は scripts/ga4-report.mjs と同じ読み取り専用SA
 * (credentials/google-indexing.json = kyounoko-readonly@…) を流用。
 * 初出: reports/geo-audit-2026-09-02.md 改善案1（2026-09-02 動作確認済みクエリの常設化）
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync } from 'fs';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const DAYS = Number(arg('days', '28'));
const PROPERTY = arg('property', '533628127');

function loadCreds() {
  let path = './credentials/google-indexing.json';
  if (existsSync('.env.local')) {
    const line = readFileSync('.env.local', 'utf8').split('\n')
      .find((l) => l.startsWith('GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH='));
    if (line) {
      const raw = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      path = raw.replace(/^~/, process.env.HOME || '');
    }
  }
  if (!existsSync(path)) { console.error('creds not found:', path); process.exit(1); }
  return JSON.parse(readFileSync(path, 'utf8'));
}

const c = loadCreds();
const jwt = new JWT({ email: c.client_email, key: c.private_key, scopes: ['https://www.googleapis.com/auth/analytics.readonly'] });
const tok = (await jwt.getAccessToken()).token;
const url = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`;

async function run(body) {
  const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) { console.error(r.status, JSON.stringify(j).slice(0, 400)); process.exit(1); }
  return j;
}

// AI検索・アシスタントの主要リファラドメイン（増えたらここに足す）
const AI_SOURCES = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'copilot.microsoft.com', 'gemini.google.com', 'claude.ai', 'you.com', 'phind.com'];
const range = [{ startDate: `${DAYS}daysAgo`, endDate: 'today' }];
const aiFilter = { filter: { fieldName: 'sessionSource', inListFilter: { values: AI_SOURCES, caseSensitive: false } } };

// 1) AI系 sessionSource の内訳
const j1 = await run({
  dateRanges: range,
  dimensions: [{ name: 'sessionSource' }],
  metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
  dimensionFilter: aiFilter,
  orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
});
let totalSess = 0;
console.log(`=== AI sessionSource 内訳（直近${DAYS}日） ===`);
for (const r of j1.rows || []) {
  totalSess += Number(r.metricValues[0].value);
  console.log(r.dimensionValues[0].value.padEnd(26), r.metricValues[0].value + 'sess', r.metricValues[1].value + 'pv');
}
console.log('AI合計:', totalSess + 'sess');

// 2) AI流入の着地ページTop20
const j2 = await run({
  dateRanges: range,
  dimensions: [{ name: 'landingPagePlusQueryString' }],
  metrics: [{ name: 'sessions' }],
  dimensionFilter: aiFilter,
  orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  limit: 20,
});
console.log(`\n=== AI流入の着地ページTop20（直近${DAYS}日） ===`);
for (const r of j2.rows || []) console.log(String(r.metricValues[0].value).padStart(5) + 'sess ', r.dimensionValues[0].value);

// 3) 週次推移（GA4標準「AI Assistant」チャネルグループ）
const j3 = await run({
  dateRanges: [{ startDate: `${Math.max(DAYS * 2, 56)}daysAgo`, endDate: 'today' }],
  dimensions: [{ name: 'week' }, { name: 'sessionDefaultChannelGroup' }],
  metrics: [{ name: 'sessions' }],
  dimensionFilter: { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'AI Assistant' } } },
  orderBys: [{ dimension: { dimensionName: 'week' } }],
});
console.log('\n=== AI Assistantチャネル 週次sessions ===');
for (const r of j3.rows || []) console.log('week', r.dimensionValues[0].value, r.metricValues[0].value + 'sess');
