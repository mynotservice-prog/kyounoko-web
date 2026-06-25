#!/usr/bin/env node
/**
 * 記事 全棚卸し監査：全 content/articles/*.md を GSC 実績と突き合わせ、
 * 勝ち/負けを分類し、良いものと悪いものの差を特徴量で出す。
 *
 * 使い方:
 *   node scripts/seo-article-audit.mjs                # 直近90日で監査
 *   node scripts/seo-article-audit.mjs --days=28
 *   node scripts/seo-article-audit.mjs --csv=/tmp/audit.csv   # 全件CSV出力
 *
 * 認証は credentials/google-indexing.json（GSC owner権限の読み取り専用SA）を流用。
 */
import { JWT } from 'google-auth-library';
import matter from 'gray-matter';
import { readFileSync, writeFileSync, readdirSync } from 'fs';

const arg = (k, d) => { const m = process.argv.find(a => a.startsWith(`--${k}=`)); return m ? m.split('=').slice(1).join('=') : d; };
const DAYS = Number(arg('days', '90'));
const LAG = Number(arg('lag', '3'));
const CSV = arg('csv', '');
const SITE = 'sc-domain:kyounoko.jp';

// ---- dates ----
const iso = d => d.toISOString().slice(0, 10);
const end = new Date(); end.setUTCDate(end.getUTCDate() - LAG);
const start = new Date(end); start.setUTCDate(start.getUTCDate() - (DAYS - 1));

// ---- GSC: paginate all pages ----
const c = JSON.parse(readFileSync('./credentials/google-indexing.json', 'utf8'));
const jwt = new JWT({ email: c.client_email, key: c.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
const tok = (await jwt.getAccessToken()).token;
const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
async function q(body) {
  const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { console.error('GSC err', r.status, (await r.text()).slice(0, 200)); return []; }
  return (await r.json()).rows || [];
}
const gsc = new Map(); // slug -> {clicks,impressions,ctr,position}
const slugOf = u => { const m = u.replace(/^https?:\/\/(www\.)?kyounoko\.jp/, '').match(/^\/article\/([^/#?]+)/); return m ? decodeURIComponent(m[1]) : null; };
let startRow = 0;
for (;;) {
  const rows = await q({ startDate: iso(start), endDate: iso(end), dimensions: ['page'], rowLimit: 5000, startRow });
  for (const r of rows) {
    const s = slugOf(r.keys[0]); if (!s) continue;
    const g = gsc.get(s) || { clicks: 0, impressions: 0, posW: 0 };
    g.clicks += r.clicks; g.impressions += r.impressions; g.posW += r.position * r.impressions;
    gsc.set(s, g);
  }
  if (rows.length < 5000) break;
  startRow += 5000;
}
for (const g of gsc.values()) { g.ctr = g.impressions ? g.clicks / g.impressions : 0; g.position = g.impressions ? g.posW / g.impressions : 0; }

// ---- articles + features ----
const files = readdirSync('content/articles').filter(f => f.endsWith('.md'));
const arts = files.map(f => {
  const g = matter(readFileSync(`content/articles/${f}`, 'utf8'));
  const slug = g.data.slug || f.replace(/\.md$/, '');
  const title = String(g.data.title || '');
  const body = g.content || '';
  const m = gsc.get(slug) || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  return {
    slug, file: f, category: g.data.category || '?', noindex: !!g.data.noindex,
    publishedAt: String(g.data.publishedAt || '').slice(0, 10),
    titleLen: [...title].length,
    hasQ: /[？?]/.test(title),
    hasYear: /【\s*20\d\d/.test(title),
    topics: (title.match(/[・｜|]/g) || []).length,
    bodyLen: [...body.replace(/\s+/g, '')].length,
    kind: (slug.match(/kids-menu|kodzure-koryaku|itsukara|morning|baby-chair|stroller|rinyushoku|omutsu|ranking|hikaku/) || ['other'])[0],
    ...m,
  };
});

// ---- classify (priority order) ----
function bucket(a) {
  if (a.noindex) return 'noindex(意図的)';
  if (a.clicks >= 30) return '①勝ち(30clk+)';
  if (a.clicks >= 5) return '②そこそこ(5-29clk)';
  if (a.impressions >= 200 && a.position <= 10 && a.ctr < 0.03) return '③CTR取りこぼし(上位&無クリック)';
  if (a.impressions >= 100 && a.position > 10 && a.position <= 20) return '④あと一歩(pos10-20)';
  if (a.impressions >= 50 && a.position > 20) return '⑤埋没(pos20+)';
  if (a.impressions >= 10) return '⑥低需要(imp少)';
  return '⑦ほぼ無表示(死蔵)';
}
arts.forEach(a => a.bucket = bucket(a));

// ---- report ----
const fmt = n => Math.round(n).toLocaleString('en-US');
const pad = (s, n) => String(s).padStart(n);
console.log(`記事監査  期間 ${iso(start)}〜${iso(end)}（${DAYS}日）  総記事 ${arts.length}本  GSC計測ページ ${gsc.size}`);
const totC = arts.reduce((s, a) => s + a.clicks, 0), totI = arts.reduce((s, a) => s + a.impressions, 0);
console.log(`合計 clicks ${fmt(totC)} / impr ${fmt(totI)}`);

const order = ['①勝ち(30clk+)', '②そこそこ(5-29clk)', '③CTR取りこぼし(上位&無クリック)', '④あと一歩(pos10-20)', '⑤埋没(pos20+)', '⑥低需要(imp少)', '⑦ほぼ無表示(死蔵)', 'noindex(意図的)'];
console.log('\n=== 分類別の記事数・クリック・表示 ===');
console.log('bucket                              本数   clicks   impr   占clicks%');
for (const b of order) {
  const g = arts.filter(a => a.bucket === b);
  const c2 = g.reduce((s, a) => s + a.clicks, 0), i2 = g.reduce((s, a) => s + a.impressions, 0);
  console.log(`${b.padEnd(34)} ${pad(g.length, 4)} ${pad(fmt(c2), 7)} ${pad(fmt(i2), 7)}  ${(totC ? c2 / totC * 100 : 0).toFixed(0)}%`);
}

console.log('\n=== 良い(①②) vs 死蔵(⑦) の特徴差 ===');
const grp = bs => arts.filter(a => bs.includes(a.bucket));
const avg = (g, f) => g.length ? g.reduce((s, a) => s + f(a), 0) / g.length : 0;
const good = grp(['①勝ち(30clk+)', '②そこそこ(5-29clk)']), dead = grp(['⑦ほぼ無表示(死蔵)']);
const rows = [
  ['本数', good.length, dead.length],
  ['平均タイトル長(字)', avg(good, a => a.titleLen).toFixed(1), avg(dead, a => a.titleLen).toFixed(1)],
  ['疑問形フック率', (avg(good, a => a.hasQ ? 1 : 0) * 100).toFixed(0) + '%', (avg(dead, a => a.hasQ ? 1 : 0) * 100).toFixed(0) + '%'],
  ['年号【20xx】率', (avg(good, a => a.hasYear ? 1 : 0) * 100).toFixed(0) + '%', (avg(dead, a => a.hasYear ? 1 : 0) * 100).toFixed(0) + '%'],
  ['平均本文長(字)', fmt(avg(good, a => a.bodyLen)), fmt(avg(dead, a => a.bodyLen))],
];
console.log('指標                  良い(①②)   死蔵(⑦)');
rows.forEach(r => console.log(`${String(r[0]).padEnd(20)} ${String(r[1]).padStart(8)}  ${String(r[2]).padStart(8)}`));

console.log('\n=== カテゴリ別の勝率（①②の割合）===');
const cats = [...new Set(arts.map(a => a.category))];
console.log('category        総数  勝ち①②  CTR取りこぼし③  死蔵⑦  勝率');
cats.map(cat => {
  const g = arts.filter(a => a.category === cat);
  const w = g.filter(a => ['①勝ち(30clk+)', '②そこそこ(5-29clk)'].includes(a.bucket)).length;
  const leak = g.filter(a => a.bucket === '③CTR取りこぼし(上位&無クリック)').length;
  const d = g.filter(a => a.bucket === '⑦ほぼ無表示(死蔵)').length;
  return { cat, n: g.length, w, leak, d, rate: w / g.length };
}).sort((a, b) => b.rate - a.rate).forEach(x => console.log(`${x.cat.padEnd(14)} ${pad(x.n, 4)}  ${pad(x.w, 6)}  ${pad(x.leak, 12)}  ${pad(x.d, 5)}  ${(x.rate * 100).toFixed(0)}%`));

console.log('\n=== 記事タイプ別 ===');
const kinds = [...new Set(arts.map(a => a.kind))];
console.log('type              総数  clicks  平均CTR(計測分)  勝ち率');
kinds.map(k => {
  const g = arts.filter(a => a.kind === k);
  const meas = g.filter(a => a.impressions > 0);
  return { k, n: g.length, c: g.reduce((s, a) => s + a.clicks, 0), ctr: meas.length ? avg(meas, a => a.ctr) : 0, w: g.filter(a => a.clicks >= 5).length / g.length };
}).sort((a, b) => b.c - a.c).forEach(x => console.log(`${x.k.padEnd(16)} ${pad(x.n, 4)} ${pad(fmt(x.c), 6)}  ${pad((x.ctr * 100).toFixed(1) + '%', 12)}  ${(x.w * 100).toFixed(0)}%`));

console.log('\n=== TOP15 勝ち記事 ===');
[...arts].sort((a, b) => b.clicks - a.clicks).slice(0, 15).forEach(a => console.log(`${pad(a.clicks, 4)}clk ${pad(fmt(a.impressions), 6)}imp CTR${pad((a.ctr * 100).toFixed(1), 5)}% pos${pad(a.position.toFixed(1), 4)}  ${a.slug}`));

console.log('\n=== ③CTR取りこぼし TOP15（上位なのにクリック薄＝タイトル即効）===');
arts.filter(a => a.bucket === '③CTR取りこぼし(上位&無クリック)').sort((a, b) => b.impressions - a.impressions).slice(0, 15)
  .forEach(a => console.log(`${pad(fmt(a.impressions), 6)}imp CTR${pad((a.ctr * 100).toFixed(1), 5)}% pos${pad(a.position.toFixed(1), 4)} ${a.clicks}clk  ${a.slug}`));

console.log('\n=== 死蔵サンプル（noindex化 or 統合 or 強化の検討対象）15本 ===');
arts.filter(a => a.bucket === '⑦ほぼ無表示(死蔵)').slice(0, 15).forEach(a => console.log(`${pad(fmt(a.impressions), 4)}imp ${a.category.padEnd(13)} ${a.slug}`));

if (CSV) {
  const head = 'slug,category,kind,bucket,clicks,impressions,ctr,position,titleLen,hasQ,hasYear,bodyLen,noindex,publishedAt';
  const lines = arts.sort((a, b) => b.clicks - a.clicks).map(a => [a.slug, a.category, a.kind, a.bucket, a.clicks, Math.round(a.impressions), (a.ctr * 100).toFixed(2), a.position.toFixed(1), a.titleLen, a.hasQ, a.hasYear, a.bodyLen, a.noindex, a.publishedAt].join(','));
  writeFileSync(CSV, [head, ...lines].join('\n'));
  console.log(`\n全${arts.length}件CSV → ${CSV}`);
}
