#!/usr/bin/env node
/**
 * GSC から「記事を作らない需要回収」と「新規面の候補」を毎週機械抽出する。
 *
 *   node scripts/gsc-opportunities.mjs                 直近28日
 *   node scripts/gsc-opportunities.mjs --days=90
 *   node scripts/gsc-opportunities.mjs --json=/tmp/opp.json
 *
 * ── なぜこの形なのか（2026-07-28 の実測にもとづく設計）──────────────────────
 *
 * ① **アンカー行を必ず統合する。**
 *    GSC は `/article/x#見出し` を別ページとして返し、本体と同じ表示を重複計上する。
 *    実測で全impの 30.7%（201,464imp）がこれ。統合しないと存在しない機会を追い続ける。
 *    クリックは実クリックなので本体に足し、**impは捨てる**（足すと母数が水増しされ、
 *    CTRが実際より低く見えて取りこぼしを過大評価する）。
 *
 * ② **CTR取りこぼしは「4位以内」だけを候補にする。**
 *    メニュー系クエリの順位帯別CTRを実測すると 1-2位49.94% / 3-4位24.68% /
 *    **5-6位1.94%** / 7-8位2.25%。3-4位→5-6位で12.7倍落ちる断崖がある。
 *    5位以下はタイトルを直してもCTRの天井が約2%なので、タイトル施策の候補にしない
 *    （順位施策の候補に回す）。
 *
 * ③ **ヘッドクエリ（「<チェーン> キッズメニュー」等）は公式サイトの面。**
 *    2026-07-28 に実SERPを確認: ココスは公式「おこさまメニュー」がサイトリンク展開で
 *    6項目を占めて1画面丸ごと、バーミヤンは skylark.co.jp が1〜3位を連取していた。
 *    ここは順位もCTRも取りに行けない。**公式が答えないのは「子連れ修飾つき」の
 *    クエリ**で、実測でもそちらは CTR 10〜56% 出ている。よって新規面の候補は
 *    「固有名詞 × 子連れ修飾」で専有ページが無いものを探す。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const DAYS = Number(arg('days', '28'));
const LAG = Number(arg('lag', '3'));
const SITE = arg('site', 'sc-domain:kyounoko.jp');
const JSON_OUT = arg('json', '');
const ARTICLES_DIR = 'content/articles';

// ───────────────── 認証 ─────────────────
function loadCreds() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  const envLocal = '.env.local';
  if (existsSync(envLocal)) {
    for (const line of readFileSync(envLocal, 'utf8').split('\n')) {
      const m = line.match(/^\s*GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH\s*=\s*(.*)\s*$/);
      if (m) {
        const p = m[1].replace(/^["']|["']$/g, '');
        if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'));
      }
    }
  }
  if (existsSync('./credentials/google-indexing.json')) return JSON.parse(readFileSync('./credentials/google-indexing.json', 'utf8'));
  console.error('✗ GSC の認証情報が見つかりません（credentials/google-indexing.json）。');
  process.exit(2);
}
const creds = loadCreds();
const jwt = new JWT({ email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });

const d = (o) => { const t = new Date(); t.setDate(t.getDate() - o); return t.toISOString().slice(0, 10); };
const startDate = d(LAG + DAYS - 1), endDate = d(LAG);

/** rowLimit は25,000上限。ページングしないと直近が黙って切り捨てられる（過去に踏んだ）。 */
async function fetchAll(dimensions) {
  const rows = [];
  for (let start = 0; ; start += 25000) {
    const res = await jwt.request({
      url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
      method: 'POST',
      data: { startDate, endDate, dimensions, rowLimit: 25000, startRow: start, dataState: 'final' },
    });
    const got = res.data.rows || [];
    rows.push(...got);
    if (got.length < 25000) break;
  }
  return rows;
}

// ───────────────── リポジトリ側の状態 ─────────────────
const slugMeta = new Map();
for (const f of readdirSync(ARTICLES_DIR)) {
  if (!f.endsWith('.md')) continue;
  const raw = readFileSync(join(ARTICLES_DIR, f), 'utf8');
  const slug = (raw.match(/^slug:\s*(.*)$/m)?.[1] || f.replace(/\.md$/, '')).trim();
  slugMeta.set(slug, { noindex: /^noindex:\s*true/m.test(raw) });
}

/** 子連れ修飾語＝「うちの子が使えるか」を聞いている軸。公式サイトはここに答えない。 */
const AXES = [
  { key: 'age', label: '年齢', re: /(何歳|なんさい|[0-9０-９]\s*歳|一歳|二歳|三歳|何ヶ月)/ },
  { key: 'rinyushoku', label: '離乳食', re: /(離乳食|ベビーフード|温め)/ },
  { key: 'stroller', label: 'ベビーカー', re: /(ベビーカー|バギー)/ },
  { key: 'babychair', label: 'ベビーチェア', re: /(ベビーチェア|子供椅子|こども椅子|キッズチェア|ハイチェア)/ },
  { key: 'kodzure', label: '子連れ', re: /(子連れ|こども連れ|赤ちゃん)/ },
  { key: 'babyroom', label: '授乳室', re: /(授乳|おむつ替え|ベビールーム)/ },
  { key: 'toriwake', label: '取り分け', re: /(取り分け|とりわけ)/ },
  { key: 'allergen', label: 'アレルゲン', re: /(アレル|低アレルゲン)/ },
  { key: 'koshitsu', label: '個室', re: /(個室|半個室)/ },
];
const axisOf = (q) => AXES.filter((a) => a.re.test(q)).map((a) => a.label);

const canon = (u) => u.split('#')[0].replace(/\/$/, '');
const slugOf = (u) => (u.includes('/article/') ? canon(u).replace(/.*\/article\//, '') : null);

// ───────────────── 集計 ─────────────────
const pageRows = await fetchAll(['page']);
const pages = new Map();
let anchorImp = 0, rawImp = 0;
for (const r of pageRows) {
  const u = r.keys[0];
  rawImp += r.impressions;
  const isAnchor = u.includes('#');
  if (isAnchor) anchorImp += r.impressions;
  const k = canon(u);
  const m = pages.get(k) || { url: k, slug: slugOf(u), clicks: 0, impressions: 0, posSum: 0 };
  m.clicks += r.clicks;
  if (!isAnchor) { m.impressions += r.impressions; m.posSum += r.position * r.impressions; }
  pages.set(k, m);
}
const pageList = [...pages.values()]
  .filter((p) => p.impressions > 0)
  .map((p) => ({ ...p, ctr: p.clicks / p.impressions, pos: p.posSum / p.impressions }));
const siteClicks = pageList.reduce((a, p) => a + p.clicks, 0);
const siteImp = pageList.reduce((a, p) => a + p.impressions, 0);
const siteCtr = siteClicks / siteImp;

const qpRows = (await fetchAll(['query', 'page'])).filter((r) => !r.keys[1].includes('#'));

console.log(`GSC 機会抽出  ${startDate} 〜 ${endDate}（${DAYS}日）`);
console.log(`アンカー行の重複imp ${anchorImp.toLocaleString()} / 生imp ${rawImp.toLocaleString()} = ${((anchorImp / rawImp) * 100).toFixed(1)}% を除外`);
console.log(`統合後サイト平均CTR ${(siteCtr * 100).toFixed(2)}%（${siteClicks.toLocaleString()}clk / ${siteImp.toLocaleString()}imp）\n`);

const out = { startDate, endDate, siteCtr, ctrLoss: [], rankPush: [], newSurface: [], cannibal: [] };

// ── ① CTR取りこぼし（4位以内だけ。5位以下は断崖の下でタイトルでは動かない）
out.ctrLoss = pageList
  .filter((p) => p.slug && !slugMeta.get(p.slug)?.noindex && p.pos <= 4 && p.impressions >= 500 && p.ctr < siteCtr)
  .map((p) => ({ slug: p.slug, clicks: p.clicks, impressions: p.impressions, ctr: +(p.ctr * 100).toFixed(2), pos: +p.pos.toFixed(1), gainPerWeek: Math.round((p.impressions * (siteCtr - p.ctr)) / (DAYS / 7)) }))
  .sort((a, b) => b.gainPerWeek - a.gainPerWeek);

// ── ② 順位押上げ候補（5〜8位・断崖のすぐ下。4位以内に入ればCTRが跳ねる）
out.rankPush = pageList
  .filter((p) => p.slug && !slugMeta.get(p.slug)?.noindex && p.pos > 4 && p.pos <= 8 && p.impressions >= 1000)
  .map((p) => ({ slug: p.slug, clicks: p.clicks, impressions: p.impressions, ctr: +(p.ctr * 100).toFixed(2), pos: +p.pos.toFixed(1) }))
  .sort((a, b) => b.impressions - a.impressions);

// ── ③ 新規面の候補（子連れ修飾つきクエリ × 専有ページ無し）
//    公式サイトが答えない軸なので、専有ページを作れば取れる可能性がある空白。
const byAxis = new Map();
for (const r of qpRows) {
  const [q, p] = r.keys;
  const axes = axisOf(q);
  if (!axes.length) continue;
  const slug = slugOf(p);
  if (!slug) continue;
  const key = `${axes.join('+')}|${slug}`;
  const m = byAxis.get(key) || { axes: axes.join('+'), slug, clicks: 0, impressions: 0, posSum: 0, queries: [] };
  m.clicks += r.clicks; m.impressions += r.impressions; m.posSum += r.position * r.impressions;
  m.queries.push({ q, clicks: r.clicks, impressions: r.impressions, pos: +r.position.toFixed(1) });
  byAxis.set(key, m);
}
out.newSurface = [...byAxis.values()]
  .filter((m) => m.impressions >= 300 && !slugMeta.get(m.slug)?.noindex)
  .map((m) => ({
    axes: m.axes, hostSlug: m.slug, clicks: m.clicks, impressions: m.impressions,
    ctr: +((m.clicks / m.impressions) * 100).toFixed(2), pos: +(m.posSum / m.impressions).toFixed(1),
    topQueries: m.queries.sort((a, b) => b.impressions - a.impressions).slice(0, 5),
  }))
  .sort((a, b) => b.impressions - a.impressions);

// ── ④ カニバリ（同一クエリを自社2ページ以上で分けている）
const byQuery = new Map();
for (const r of qpRows) {
  const [q, p] = r.keys;
  const slug = slugOf(p);
  if (!slug) continue;
  const m = byQuery.get(q) || [];
  m.push({ slug, clicks: r.clicks, impressions: r.impressions, pos: +r.position.toFixed(1) });
  byQuery.set(q, m);
}
out.cannibal = [...byQuery.entries()]
  .filter(([, a]) => a.length > 1)
  .map(([q, a]) => ({ query: q, impressions: a.reduce((s, x) => s + x.impressions, 0), clicks: a.reduce((s, x) => s + x.clicks, 0), pages: a.sort((x, y) => y.impressions - x.impressions) }))
  .filter((x) => x.impressions >= 500)
  .map((x) => ({ ...x, ctr: +((x.clicks / x.impressions) * 100).toFixed(2) }))
  .sort((a, b) => b.impressions - a.impressions);

// ───────────────── 出力 ─────────────────
const show = (title, rows, fmt, n = 12) => {
  console.log(`\n■ ${title}（${rows.length}件）`);
  for (const r of rows.slice(0, n)) console.log('  ' + fmt(r));
};
show('① タイトル/メタで取りに行ける取りこぼし（pos≤4のみ）', out.ctrLoss,
  (r) => `${r.slug.slice(0, 34).padEnd(36)}${String(r.impressions).padStart(7)}imp CTR${String(r.ctr).padStart(6)}% pos${String(r.pos).padStart(4)}  週+${r.gainPerWeek}clk見込み`);
show('② 順位押上げ候補（pos4〜8・4位以内に入ればCTRが跳ねる帯）', out.rankPush,
  (r) => `${r.slug.slice(0, 34).padEnd(36)}${String(r.impressions).padStart(7)}imp CTR${String(r.ctr).padStart(6)}% pos${String(r.pos).padStart(4)}`);
show('③ 新規面の候補（子連れ修飾軸＝公式サイトが答えない空白）', out.newSurface,
  (r) => `${r.axes.padEnd(18)}${String(r.impressions).padStart(6)}imp CTR${String(r.ctr).padStart(6)}% pos${String(r.pos).padStart(4)}  受け皿:${r.hostSlug.slice(0, 30)}`);
show('④ カニバリ（自社2ページ以上で分けているクエリ）', out.cannibal,
  (r) => `${String(r.impressions).padStart(6)}imp ${String(r.clicks).padStart(4)}clk CTR${String(r.ctr).padStart(6)}%  ${r.query}\n      → ${r.pages.map((p) => `${p.slug}(${p.impressions}imp/pos${p.pos})`).join(' ／ ')}`);

if (JSON_OUT) {
  writeFileSync(JSON_OUT, JSON.stringify(out, null, 1));
  console.log(`\n生データ: ${JSON_OUT}`);
}
