// 薄ページ剪定監査（パフォーマンス層）。
// サイトマップ(=index対象の全URL) × GSC 90日実績 を突き合わせ、
// 「indexされているが90日間ほぼ獲得ゼロ」のページを種別ごとに洗い出す。
// 既存の seo-thin-page-audit.ts は「コンテンツの薄さ(matched>=3)」を監査するが、
// これは「需要ゼロ(実データ)」を監査する補完版。剪定(noindex/統合)の意思決定材料。
//
// 実行: node scripts/seo-prune-audit.mjs [--days=90] [--json=/tmp/prune.json]
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const DAYS = Number(arg('days', '90'));
const LAG = Number(arg('lag', '3'));
const SITE = 'sc-domain:kyounoko.jp';
const JSON_OUT = arg('json', '');

function loadCreds() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  let path = './credentials/google-indexing.json';
  if (existsSync('.env.local')) {
    const line = readFileSync('.env.local', 'utf8')
      .split('\n')
      .find((l) => l.startsWith('GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH='));
    if (line) path = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '').replace(/^~/, process.env.HOME || '');
  }
  if (!existsSync(path)) { console.error('認証情報なし:', resolve(path)); process.exit(1); }
  return JSON.parse(readFileSync(path, 'utf8'));
}

const iso = (d) => d.toISOString().slice(0, 10);
function range() {
  const end = new Date(); end.setUTCDate(end.getUTCDate() - LAG);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - (DAYS - 1));
  return { start: iso(start), end: iso(end) };
}
const short = (u) => u.replace(/^https?:\/\/(www\.)?kyounoko\.jp/, '').replace(/\/$/, '') || '/';

// URL → 種別カテゴリ
function categorize(path) {
  if (path === '/') return 'home';
  const seg = path.split('/').filter(Boolean);
  const top = seg[0];
  if (top === 'station') return seg.length >= 3 ? 'station×条件' : 'station(駅トップ)';
  if (top === 'article') return 'article(記事)';
  if (top === 'spot') return 'spot(スポット)';
  if (top === 'category') return 'category';
  if (top === 'area') return 'area(エリア)';
  if (top === 'event' || top === 'events') return 'event';
  if (top === 'feature') return 'feature(特集)';
  if (top === 'plan') return 'plan';
  if (top === 'tag') return 'tag';
  if (top === 'recipes') return 'recipes';
  if (top === 'items') return 'items';
  if (['ranking', 'reports', 'kid-reports', 'search', 'spots', 'authors', 'supervisors'].includes(top)) return top;
  return `その他(${top})`;
}

async function main() {
  // 1) GSC 90日 ページ別実績（高rowLimit）
  const c = loadCreds();
  const jwt = new JWT({ email: c.client_email, key: c.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
  const tok = (await jwt.getAccessToken()).token;
  const r = range();
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: r.start, endDate: r.end, dimensions: ['page'], rowLimit: 25000 }),
  });
  if (!res.ok) { console.error('GSC error', res.status, (await res.text()).slice(0, 300)); process.exit(1); }
  const rows = (await res.json()).rows || [];
  // path → {clicks, impressions}（www/非wwwを正規化して合算）
  const gsc = new Map();
  for (const row of rows) {
    const p = short(row.keys[0]);
    const cur = gsc.get(p) || { clicks: 0, impressions: 0 };
    cur.clicks += row.clicks; cur.impressions += row.impressions;
    gsc.set(p, cur);
  }

  // 2) サイトマップ（index対象の全URL）
  const xml = await (await fetch('https://kyounoko.jp/sitemap.xml')).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => short(m[1]));

  // 3) 種別ごとに集計
  const cats = new Map();
  for (const path of urls) {
    const cat = categorize(path);
    const g = gsc.get(path) || { clicks: 0, impressions: 0 };
    const o = cats.get(cat) || { total: 0, withImp: 0, withClick: 0, dead: 0, clicks: 0, imp: 0, deadSamples: [] };
    o.total++;
    o.clicks += g.clicks; o.imp += g.impressions;
    if (g.impressions > 0) o.withImp++; else { o.dead++; if (o.deadSamples.length < 5) o.deadSamples.push(path); }
    if (g.clicks > 0) o.withClick++;
    cats.set(cat, o);
  }

  console.log(`\n=== 薄ページ剪定監査（直近${DAYS}日, GSC実績 × サイトマップ${urls.length}URL）===\n`);
  console.log('種別'.padEnd(20), 'index数'.padStart(8), '表示有'.padStart(8), 'click有'.padStart(8), '死蔵(0表示)'.padStart(10), '総click'.padStart(8), '総imp'.padStart(9));
  const sorted = [...cats.entries()].sort((a, b) => b[1].total - a[1].total);
  let tDead = 0, tTotal = 0;
  for (const [cat, o] of sorted) {
    tDead += o.dead; tTotal += o.total;
    console.log(
      cat.padEnd(20),
      String(o.total).padStart(8),
      String(o.withImp).padStart(8),
      String(o.withClick).padStart(8),
      `${o.dead}(${Math.round((o.dead / o.total) * 100)}%)`.padStart(10),
      String(Math.round(o.clicks)).padStart(8),
      String(Math.round(o.imp)).padStart(9),
    );
  }
  console.log('-'.repeat(80));
  console.log('合計'.padEnd(20), String(tTotal).padStart(8), '', '', `${tDead}(${Math.round((tDead / tTotal) * 100)}%)`.padStart(10));
  console.log('\n※「死蔵(0表示)」= サイトマップにあるが90日間GSC表示0回 = 剪定(noindex/統合)候補');
  console.log('\n--- 死蔵サンプル(種別ごと) ---');
  for (const [cat, o] of sorted) {
    if (o.dead > 0 && o.deadSamples.length) console.log(`  [${cat}] ${o.deadSamples.slice(0, 3).join('  ')}`);
  }

  if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify({ range: r, urls: urls.length, cats: Object.fromEntries(cats) }, null, 2));
    console.log('\nJSON:', JSON_OUT);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
