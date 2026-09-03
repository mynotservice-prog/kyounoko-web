#!/usr/bin/env node
/**
 * 「表示0ページ」の母集団と原因内訳を出す。
 *
 * 【なぜこのスクリプトがあるか】
 * 2026-09-03 に「表示0のページを無くしたい」という課題を診断したとき、最初は
 * コンテンツ品質の問題だと想定していた。実測すると逆で、表示0だった663本のうち
 *   ・65%(431本) が「URL が Google に認識されていません」（未発見）
 *   ・19%(124本) が「クロール済み - インデックス未登録」
 *   ・3%(23本)  が古いクロール記録の404（本番は全て200）
 *   ・2%(12本)  が解除済みnoindexの残骸
 * ＝**86%が到達（発見・クロール）の問題**で、品質の問題は残り11%だけだった。
 * この切り分けをやらずに記事を書き足すと、届いていないページに労力を注ぐことになる。
 *
 * 真因は app/sitemap.ts が lastmod をビルド時刻で埋めていたこと（78%）で、GSCが
 * 52日間サイトマップを再取得していなかった。詳細は memory
 * `kyounoko-sitemap-lastmod-stall-2026-09-03` と scripts/check-sitemap-health.mjs。
 *
 * 使い方:
 *   node scripts/seo-zero-impression-audit.mjs                    # 表示0/クリック0の母集団だけ（速い）
 *   node scripts/seo-zero-impression-audit.mjs --inspect          # URL検査APIで原因内訳まで出す（低速・要クォータ）
 *   node scripts/seo-zero-impression-audit.mjs --inspect --max=200
 *   node scripts/seo-zero-impression-audit.mjs --days=90 --out=/tmp/zero
 *
 * URL検査APIのクォータは 1プロパティ 2,000件/日・600件/分。--inspect は
 * 検査結果を <out>/inspect.json にキャッシュするので、再実行は差分だけ検査する。
 *
 * 認証: credentials/google-indexing.json（GSC owner の読み取り専用SA）。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const has = (k) => process.argv.includes(`--${k}`);

const DAYS = Number(arg('days', '90'));
const LAG = Number(arg('lag', '3'));
const SITE = arg('site', 'sc-domain:kyounoko.jp');
const OUT = arg('out', '');
const INSPECT = has('inspect');
const MAX_INSPECT = Number(arg('max', '700'));
const BASE = 'https://kyounoko.jp';

const creds = JSON.parse(
  readFileSync(process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH || './credentials/google-indexing.json', 'utf8'),
);
const roJwt = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const rwJwt = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/webmasters'],
});

const iso = (d) => d.toISOString().slice(0, 10);
const norm = (u) => u.replace(/\/$/, '').split('#')[0];
const typeOf = (u) => {
  if (u.startsWith('https://www.')) return '(www: 旧ドメイン残骸)';
  const p = u.replace(BASE, '').split('?')[0];
  return p.split('/')[1] || '(top)';
};

if (OUT) mkdirSync(OUT, { recursive: true });

// ---- ① サイトマップの全URL ----
const xml = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
const sitemapUrls = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => norm(m[1]));
console.log(`サイトマップ: ${sitemapUrls.length} URL`);

// ---- ② GSC の page 次元（表示のあったURL全件） ----
const end = new Date(Date.now() - LAG * 864e5);
const start = new Date(end.getTime() - (DAYS - 1) * 864e5);
const gsc = new Map();
for (let s = 0; s < 100000; s += 25000) {
  const r = await roJwt.request({
    url: `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
    method: 'POST',
    data: { startDate: iso(start), endDate: iso(end), dimensions: ['page'], rowLimit: 25000, startRow: s, dataState: 'final' },
  });
  const rows = r.data.rows || [];
  for (const row of rows) {
    const u = norm(row.keys[0]);
    const p = gsc.get(u) || { i: 0, c: 0, pos: 0 };
    p.i += row.impressions;
    p.c += row.clicks;
    p.pos = row.position;
    gsc.set(u, p);
  }
  if (rows.length < 25000) break;
}
console.log(`GSC期間: ${iso(start)}〜${iso(end)}（表示のあったURL ${gsc.size}本）\n`);

// ---- ③ 種別ごとの表示0／クリック0 ----
const agg = {};
const zeroImp = [];
const zeroClk = [];
for (const u of sitemapUrls) {
  const t = typeOf(u);
  const a = (agg[t] ??= { n: 0, imp0: 0, clk0: 0, imp: 0, clk: 0 });
  a.n++;
  const d = gsc.get(u);
  if (!d || d.i === 0) {
    a.imp0++;
    zeroImp.push(u);
  } else {
    a.imp += d.i;
    a.clk += d.c;
    if (d.c === 0) zeroClk.push({ url: u, ...d });
  }
}
const pad = (v, n) => String(v).padStart(n);
console.log('=== サイトマップ内URLの表示0／クリック0 ===');
console.log('種別         総数   表示0  クリック0      総imp     総clk');
const tot = { n: 0, imp0: 0, clk0: 0, imp: 0, clk: 0 };
for (const [t, a] of Object.entries(agg).sort((x, y) => y[1].n - x[1].n)) {
  for (const k of Object.keys(tot)) tot[k] += a[k];
  if (a.n >= 3) console.log(t.padEnd(12), pad(a.n, 5), pad(a.imp0, 7), pad(a.clk0, 10), pad(a.imp, 10), pad(a.clk, 9));
}
console.log('ALL         ', pad(tot.n, 5), pad(tot.imp0, 7), pad(tot.clk0, 10), pad(tot.imp, 10), pad(tot.clk, 9));
console.log(`\n表示0: ${zeroImp.length}本 (${(zeroImp.length / sitemapUrls.length * 100).toFixed(1)}%)`);
console.log(`表示ありクリック0: ${zeroClk.length}本`);

// ---- ④ クリック0を「表示不足」と「本物のCTR/順位問題」に切り分ける ----
// 2026-09-03 実測: クリック0の706本のうち imp>=100 は54本だけ。
// 574本(81%)は90日でimp50未満＝期待クリックが1未満なので、クリック0は統計的に当然。
// つまり「クリック0撲滅」の大半は「表示を増やす」問題に還元される。
const buckets = [[1, 9], [10, 49], [50, 99], [100, 299], [300, 999], [1000, Infinity]];
console.log('\n=== クリック0の内訳（表示規模別）===');
for (const [lo, hi] of buckets) {
  const a = zeroClk.filter((x) => x.i >= lo && x.i <= hi);
  if (!a.length) continue;
  const avgPos = a.reduce((s, x) => s + x.pos, 0) / a.length;
  const note = hi < 50 ? '← 期待クリック<1。CTRでなく表示の問題' : '';
  console.log(`imp ${lo}-${hi === Infinity ? '∞' : hi}`.padEnd(14), pad(a.length, 4), '本  平均順位', avgPos.toFixed(1).padStart(5), note);
}
const real = zeroClk.filter((x) => x.i >= 100).sort((a, b) => b.i - a.i);
console.log(`\n=== 本物のCTR/順位問題（imp>=100 かつ clk=0）: ${real.length}本 ===`);
console.log('※ /spot/ の指名クエリ（施設名そのもの）は公式サイトに取られる構造なのでCTRは動かない。');
console.log('※ pos>=9 は順位起因。プレイブック §1 のとおりタイトルを触っても動かない。');
for (const x of real.slice(0, 40)) {
  const tag = x.pos >= 9 ? '順位起因' : x.url.includes('/spot/') ? '指名クエリ疑い' : 'CTR候補';
  console.log(pad(x.i, 5), 'imp pos', x.pos.toFixed(1).padStart(5), tag.padEnd(8), x.url.replace(BASE, ''));
}

// ---- ⑤ サイトマップ外だが表示があるURL ----
const outside = [...gsc].filter(([u]) => !sitemapUrls.includes(u) && gsc.get(u).i > 0);
const outAgg = {};
for (const [u, d] of outside) {
  const t = u.includes('?') ? `/${typeOf(u)}?（絞り込み変種）` : typeOf(u);
  const a = (outAgg[t] ??= { n: 0, i: 0, c: 0 });
  a.n++;
  a.i += d.i;
  a.c += d.c;
}
console.log(`\n=== サイトマップ外だが表示があるURL: ${outside.length}本 ===`);
for (const [t, a] of Object.entries(outAgg).sort((x, y) => y[1].i - x[1].i).slice(0, 12)) {
  console.log(t.padEnd(26), pad(a.n, 5), '本  imp', pad(a.i, 8), 'clk', pad(a.c, 6));
}

if (OUT) {
  writeFileSync(join(OUT, 'zero-impression.txt'), zeroImp.join('\n') + '\n');
  writeFileSync(join(OUT, 'zero-click.json'), JSON.stringify(zeroClk, null, 1));
  console.log(`\n表示0のURL一覧 → ${join(OUT, 'zero-impression.txt')}`);
}

// ---- ⑥ URL検査APIで表示0の原因を切り分ける ----
if (!INSPECT) {
  console.log('\n（--inspect を付けると、表示0の原因内訳＝未発見／未登録／404／noindex を出します）');
  process.exit(0);
}

const cacheFile = OUT ? join(OUT, 'inspect.json') : '/tmp/kyounoko-inspect.json';
const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {};
const todo = zeroImp.filter((u) => !cache[u]).slice(0, MAX_INSPECT);
console.log(`\nURL検査: ${todo.length}本を検査（キャッシュ済み ${zeroImp.length - todo.length}本）`);

let done = 0;
const CONC = 6;
const worker = async () => {
  for (;;) {
    const u = todo.shift();
    if (!u) return;
    for (let a = 0; a < 4; a++) {
      try {
        const r = await rwJwt.request({
          url: 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
          method: 'POST',
          data: { inspectionUrl: u, siteUrl: SITE, languageCode: 'ja' },
        });
        const s = r.data.inspectionResult.indexStatusResult || {};
        cache[u] = { verdict: s.verdict, cov: s.coverageState, robots: s.robotsTxtState, crawl: (s.lastCrawlTime || '').slice(0, 10) };
        break;
      } catch (e) {
        const code = e.response?.status;
        if (code === 429 || code === 503) {
          await new Promise((r) => setTimeout(r, 3000 * (a + 1)));
          continue;
        }
        cache[u] = { err: e.response?.data?.error?.message || e.message };
        break;
      }
    }
    if (++done % 50 === 0) {
      writeFileSync(cacheFile, JSON.stringify(cache));
      console.log(`  ${done}件`);
    }
  }
};
await Promise.all(Array.from({ length: CONC }, worker));
writeFileSync(cacheFile, JSON.stringify(cache));

const inspected = zeroImp.filter((u) => cache[u]);
const byCov = {};
const byTypeCov = {};
for (const u of inspected) {
  const c = cache[u].err ? 'ERR' : cache[u].cov || '(不明)';
  byCov[c] = (byCov[c] || 0) + 1;
  const t = typeOf(u);
  ((byTypeCov[t] ??= {})[c] ??= 0);
  byTypeCov[t][c]++;
}
console.log(`\n=== 表示0のインデックス状態（検査済み ${inspected.length}本）===`);
for (const [c, n] of Object.entries(byCov).sort((a, b) => b[1] - a[1])) {
  console.log(pad(n, 5), pad(`${(n / inspected.length * 100).toFixed(0)}%`, 5), c);
}
console.log('\n=== 種別ごと ===');
for (const [t, c] of Object.entries(byTypeCov).sort((a, b) => Object.values(b[1]).reduce((x, y) => x + y, 0) - Object.values(a[1]).reduce((x, y) => x + y, 0))) {
  const n = Object.values(c).reduce((x, y) => x + y, 0);
  console.log(t.padEnd(12), `計${pad(n, 4)}`, Object.entries(c).map(([k, v]) => `${k.slice(0, 16)}:${v}`).join('  '));
}

// 再クロール要請すべきURL（品質でなく到達の問題なもの）
const reindex = inspected.filter((u) => {
  const c = cache[u].cov || '';
  return c.includes('認識されていません') || c.includes('インデックス未登録') || c.includes('404') || c.includes('noindex');
});
console.log(`\n再クロール要請の対象（到達の問題）: ${reindex.length}本 / 表示0 ${zeroImp.length}本 = ${(reindex.length / zeroImp.length * 100).toFixed(0)}%`);
if (OUT) {
  writeFileSync(join(OUT, 'reindex.txt'), reindex.join('\n') + '\n');
  console.log(`→ ${join(OUT, 'reindex.txt')}`);
  console.log('  docs/indexing-queue.txt にコピーして `node scripts/request-indexing.mjs --max=180` で送る（1日200件上限）。');
}
