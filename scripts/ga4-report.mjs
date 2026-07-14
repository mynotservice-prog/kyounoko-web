#!/usr/bin/env node
/**
 * GA4 実測レポート（月間PV/セッション/流入チャネル）
 *
 * GSC と同じ読み取り専用SA(credentials/google-indexing.json = kyounoko-readonly@…)を流用。
 * 実行前に社長側で2つの準備が必要（どちらも数分）:
 *   1) GCPプロジェクト kyounoko-website(908452757281) で以下のAPIを有効化
 *        - Analytics Data API   : https://console.developers.google.com/apis/api/analyticsdata.googleapis.com/overview?project=908452757281
 *        - Analytics Admin API  : https://console.developers.google.com/apis/api/analyticsadmin.googleapis.com/overview?project=908452757281
 *          （--property を手で渡すなら Admin API は不要。プロパティ自動検出に使うだけ）
 *   2) GA4 管理 → プロパティのアクセス管理 → 「閲覧者」で追加:
 *        kyounoko-readonly@kyounoko-website.iam.gserviceaccount.com
 *
 * 使い方:
 *   node scripts/ga4-report.mjs                       # Admin APIでプロパティ自動検出
 *   node scripts/ga4-report.mjs --property=123456789  # 数字のプロパティIDを直接指定（Admin API不要）
 *
 * キーは直書きせず、既存のSAファイル経由でのみ読む。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync } from 'fs';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};

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
console.log('SA:', c.client_email);

let propertyId = arg('property', '');

if (!propertyId) {
  const r = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200', { headers: { Authorization: `Bearer ${tok}` } });
  const j = await r.json();
  if (!r.ok) {
    console.error('\naccountSummaries', r.status, JSON.stringify(j).slice(0, 300));
    console.error('\n→ Admin APIが無効かSA未権限。--property=<数字ID> を渡すか、上記の準備を実施。');
    console.error('   Viewer追加が必要なSA:', c.client_email);
    process.exit(1);
  }
  const props = [];
  for (const acc of j.accountSummaries || []) for (const p of acc.propertySummaries || []) props.push(p);
  if (!props.length) { console.error('アクセス可能プロパティ0。Viewer追加:', c.client_email); process.exit(1); }
  const t = props.find((p) => /kyounoko|きょうのこ/i.test(p.displayName)) || props[0];
  propertyId = t.property.split('/')[1];
  console.log('property:', t.displayName, propertyId);
}

const dataUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
async function run(body) {
  const r = await fetch(dataUrl, { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) { console.error('Data API', r.status, JSON.stringify(j).slice(0, 300)); return null; }
  return j;
}

const totals = await run({
  dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }, { startDate: '56daysAgo', endDate: '29daysAgo' }],
  metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }, { name: 'totalUsers' }, { name: 'engagementRate' }],
});
console.log('\n=== 直近28日 vs 前28日 ===');
if (totals?.rows) {
  const m = totals.rows.map((r) => r.metricValues.map((x) => x.value));
  ['screenPageViews', 'sessions', 'totalUsers', 'engagementRate'].forEach((n, i) =>
    console.log(`${n.padEnd(16)} ${String(m[0]?.[i] ?? '-').padStart(10)} ${String(m[1]?.[i] ?? '-').padStart(10)}`));
}

const chan = await run({
  dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
  dimensions: [{ name: 'sessionDefaultChannelGroup' }],
  metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
  orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
});
console.log('\n=== 流入チャネル（直近28日） ===');
for (const row of chan?.rows || []) console.log(`${row.dimensionValues[0].value.padEnd(20)} ${String(row.metricValues[0].value).padStart(8)}sess ${String(row.metricValues[1].value).padStart(8)}pv`);

const monthly = await run({
  dateRanges: [{ startDate: '180daysAgo', endDate: 'yesterday' }],
  dimensions: [{ name: 'yearMonth' }],
  metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
  orderBys: [{ dimension: { dimensionName: 'yearMonth' } }],
});
console.log('\n=== 月次PV（直近6ヶ月） ===');
for (const row of monthly?.rows || []) console.log(`${row.dimensionValues[0].value}  ${String(row.metricValues[0].value).padStart(8)}pv ${String(row.metricValues[1].value).padStart(8)}sess`);
