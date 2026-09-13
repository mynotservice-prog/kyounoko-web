#!/usr/bin/env node
/**
 * 週次トラフィック定点（GA4）— 毎週月曜に「横ばいか上向きか」を1枚で見る。
 *
 * 背景（2026-09-13）: 8/17〜9/6 の3週間、PVは1日3,220〜3,260でぴたりと横ばいだった
 * （検索クリックは伸びていたが、水遊び面の季節終了と相殺）。リニューアル後の9/7週で
 * PV/セッション 1.23→1.30、PV/日 +16% と動いたが、1週だけでは日々のぶれと区別できない。
 * 直近の完了週を「その前3週の平均」と比べ、±5%を超えたときだけ上向き/下向きと判定する。
 *
 * 使い方:
 *   node scripts/ga4-weekly.mjs                       # 直近9週を表示
 *   node scripts/ga4-weekly.mjs --md=reports/weekly-traffic/2026-09-15.md
 *
 * 認証は scripts/gsc-report.mjs と同じ読み取り専用SA（credentials/google-indexing.json）。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const arg = (k, d) => { const m = process.argv.find((a) => a.startsWith(`--${k}=`)); return m ? m.split('=').slice(1).join('=') : d; };
const MD_OUT = arg('md', '');
const WEEKS = Number(arg('weeks', '9'));
const PROPERTY = arg('property', '533628127');

function loadCreds() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  let path = './credentials/google-indexing.json';
  if (existsSync('.env.local')) {
    const line = readFileSync('.env.local', 'utf8').split('\n').find((l) => l.startsWith('GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH='));
    if (line) path = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '').replace(/^~/, process.env.HOME || '');
  }
  if (!existsSync(path)) { console.error(`認証情報が見つかりません: ${resolve(path)}`); process.exit(1); }
  return JSON.parse(readFileSync(path, 'utf8'));
}
const creds = loadCreds();
const jwt = new JWT({ email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/analytics.readonly'] });
const token = (await jwt.getAccessToken()).token;
async function ga4(body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) { console.error('GA4 API error', r.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
  return j.rows || [];
}

// 月曜始まりの週キー
const weekKey = (yyyymmdd) => {
  const d = new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}T00:00:00Z`);
  return new Date(d - ((d.getUTCDay() + 6) % 7) * 864e5).toISOString().slice(0, 10);
};
const start = new Date(); start.setUTCDate(start.getUTCDate() - 7 * WEEKS - 7);
const range = { startDate: start.toISOString().slice(0, 10), endDate: 'yesterday' };

async function weekly(filter) {
  const rows = await ga4({ dateRanges: [range], dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'engagedSessions' }, { name: 'averageSessionDuration' }], ...(filter ? { dimensionFilter: filter } : {}), limit: 400 });
  const W = {};
  for (const r of rows) {
    const k = weekKey(r.dimensionValues[0].value); const m = r.metricValues.map((v) => +v.value);
    W[k] = W[k] || { s: 0, pv: 0, eng: 0, durW: 0, days: 0 };
    W[k].s += m[0]; W[k].pv += m[1]; W[k].eng += m[2]; W[k].durW += m[3] * m[0]; W[k].days++;
  }
  return Object.entries(W).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ week: k, ...v, spd: v.s / v.days, pvpd: v.pv / v.days, pps: v.s ? v.pv / v.s : 0, engRate: v.s ? v.eng / v.s : 0, dur: v.s ? v.durW / v.s : 0 }));
}
const landing = (prefix) => ({ filter: { fieldName: 'landingPage', stringFilter: { matchType: 'BEGINS_WITH', value: prefix } } });
const [all, art, spot, station] = await Promise.all([weekly(null), weekly(landing('/article/')), weekly(landing('/spot/')), weekly(landing('/station/'))]);

const out = [];
const say = (s = '') => { console.log(s); out.push(s); };
const f0 = (n) => Math.round(n).toLocaleString('en-US');
const f2 = (n) => n.toFixed(2);
const pct = (n) => `${(n * 100).toFixed(1)}%`;

say(`# 週次トラフィック定点（GA4）${range.startDate}〜昨日`);
say('');
say('| 週(月曜〜) | 日数 | セッション/日 | PV/日 | PV/セッション | エンゲージ率 | 平均滞在 |');
say('|---|---:|---:|---:|---:|---:|---:|');
for (const w of all.slice(-WEEKS)) say(`| ${w.week} | ${w.days} | ${f0(w.spd)} | ${f0(w.pvpd)} | ${f2(w.pps)} | ${pct(w.engRate)} | ${Math.round(w.dur)}秒 |`);
say('');

// 判定: 直近の完了週（7日そろった最後の週）vs その前3週の平均
const full = all.filter((w) => w.days === 7);
const last = full[full.length - 1];
const prev = full.slice(-4, -1);
if (last && prev.length === 3) {
  const avg = (k) => prev.reduce((a, w) => a + w[k], 0) / prev.length;
  const d = (k) => (last[k] - avg(k)) / avg(k);
  const verdict = (x) => (x > 0.05 ? '上向き' : x < -0.05 ? '下向き' : '横ばい');
  say(`## 判定（${last.week}週 vs その前3週の平均）`);
  say('');
  say(`- PV/日: ${f0(last.pvpd)} vs ${f0(avg('pvpd'))} → **${verdict(d('pvpd'))}**（${(d('pvpd') * 100).toFixed(1)}%）`);
  say(`- セッション/日: ${f0(last.spd)} vs ${f0(avg('spd'))} → ${verdict(d('spd'))}（${(d('spd') * 100).toFixed(1)}%）`);
  say(`- 回遊（PV/セッション）: ${f2(last.pps)} vs ${f2(avg('pps'))} → ${verdict(d('pps'))}（${(d('pps') * 100).toFixed(1)}%）`);
  say('');
  say('±5%以内は「横ばい」。1週だけの上下は日々のぶれと区別がつかないので、2週続いて初めて傾向と読む。');
  say('');
}

say('## 着地面別（PV/セッション＝回遊）');
say('');
say('| 週 | 記事着地 セッション/日 | 記事 PV/セッション | スポット着地 セッション/日 | スポット PV/セッション | 駅ページ着地 セッション/日 | 駅 PV/セッション |');
say('|---|---:|---:|---:|---:|---:|---:|');
const byWeek = (arr) => Object.fromEntries(arr.map((w) => [w.week, w]));
const A = byWeek(art), S = byWeek(spot), T = byWeek(station);
for (const w of all.slice(-WEEKS)) {
  const a = A[w.week], s = S[w.week], t = T[w.week];
  say(`| ${w.week} | ${a ? f0(a.spd) : '—'} | ${a ? f2(a.pps) : '—'} | ${s ? f0(s.spd) : '—'} | ${s ? f2(s.pps) : '—'} | ${t ? f0(t.spd) : '—'} | ${t ? f2(t.pps) : '—'} |`);
}
say('');
say('読み方: PVを動かすのは流入（セッション/日）、回遊はその掛け算の係数。スポット着地は季節（水遊び）で夏に膨らむ。');

if (MD_OUT) { mkdirSync(dirname(resolve(MD_OUT)), { recursive: true }); writeFileSync(MD_OUT, out.join('\n') + '\n'); console.error(`md: ${MD_OUT}`); }
