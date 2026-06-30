#!/usr/bin/env node
/**
 * 駅×条件ページの「需要実績 allowlist」を GSC 実データから再生成する。
 * 出力: lib/station-cond-demand.ts（STATION_COND_DEMAND: Set<"slug/condition">）。
 *
 * 薄ページ剪定の二段ゲート（lib/station-cond-index.ts）が、これを「需要実証済み＝無条件index」
 * の判定に使う。GSC 90日で表示回数 >0 だった station×条件 combo を収集する。
 *
 * 使い方: node scripts/gen-station-cond-demand.mjs [--days=90] [--lag=3]
 * 認証: scripts/gsc-report.mjs と同じ読み取り専用SA（credentials/google-indexing.json）。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, writeFileSync } from 'fs';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const DAYS = Number(arg('days', '90'));
const LAG = Number(arg('lag', '3'));
const SITE = 'sc-domain:kyounoko.jp';

function loadCreds() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  let path = './credentials/google-indexing.json';
  if (existsSync('.env.local')) {
    const line = readFileSync('.env.local', 'utf8')
      .split('\n')
      .find((l) => l.startsWith('GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH='));
    if (line)
      path = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '').replace(/^~/, process.env.HOME || '');
  }
  if (!existsSync(path)) {
    console.error('認証情報なし:', path);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

const iso = (d) => d.toISOString().slice(0, 10);
const short = (u) => u.replace(/^https?:\/\/(www\.)?kyounoko\.jp/, '').replace(/\/$/, '') || '/';

const end = new Date();
end.setUTCDate(end.getUTCDate() - LAG);
const start = new Date(end);
start.setUTCDate(start.getUTCDate() - (DAYS - 1));

const c = loadCreds();
const jwt = new JWT({
  email: c.client_email,
  key: c.private_key,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const tok = (await jwt.getAccessToken()).token;
const res = await fetch(
  `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: iso(start), endDate: iso(end), dimensions: ['page'], rowLimit: 25000 }),
  },
);
if (!res.ok) {
  console.error('GSC error', res.status, (await res.text()).slice(0, 300));
  process.exit(1);
}
const rows = (await res.json()).rows || [];
const demand = new Set();
for (const r of rows) {
  const seg = short(r.keys[0]).split('/').filter(Boolean);
  if (seg[0] === 'station' && seg.length === 3 && seg[1] !== 'line' && r.impressions > 0) {
    demand.add(`${seg[1]}/${seg[2]}`);
  }
}
const arr = [...demand].sort();
const body = `// 自動生成: node scripts/gen-station-cond-demand.mjs（最終更新は手動コミット日を参照）
// GSC 直近${DAYS}日(${iso(start)}〜${iso(end)})で表示回数>0 だった station×条件 combo（"slug/condition"）。
// 薄ページ剪定の二段ゲート(lib/station-cond-index.ts)で「需要実績あり=無条件index」に使う。
export const STATION_COND_DEMAND: ReadonlySet<string> = new Set([
${arr.map((s) => `  ${JSON.stringify(s)},`).join('\n')}
]);
`;
writeFileSync('lib/station-cond-demand.ts', body);
console.log(`lib/station-cond-demand.ts を更新: ${arr.length} combo（${iso(start)}〜${iso(end)}）`);
