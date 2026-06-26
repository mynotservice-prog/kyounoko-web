// 攻めの地図づくり監査。
// A3: 公式写真の営業優先リスト（GSC表示が多い /spot/ ＝写真をもらえば即効果）。
// B1: 外食クラスター監査（外食記事のGSC実績＋内部リンク構造で ピラー/孤児/穴 を可視化）。
// 実行: node scripts/seo-offense-audit.mjs
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// ---- GSC ----
function loadCreds() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  const path = './credentials/google-indexing.json';
  if (!existsSync(path)) { console.error('認証情報なし'); process.exit(1); }
  return JSON.parse(readFileSync(path, 'utf8'));
}
const short = (u) => u.replace(/^https?:\/\/(www\.)?kyounoko\.jp/, '').replace(/\/$/, '') || '/';
async function gscPages() {
  const c = loadCreds();
  const jwt = new JWT({ email: c.client_email, key: c.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
  const tok = (await jwt.getAccessToken()).token;
  const end = new Date(); end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 89);
  const iso = (d) => d.toISOString().slice(0, 10);
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:kyounoko.jp')}/searchAnalytics/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: iso(start), endDate: iso(end), dimensions: ['page'], rowLimit: 25000 }),
  });
  const rows = (await res.json()).rows || [];
  const m = new Map();
  for (const r of rows) { const p = short(r.keys[0]); const o = m.get(p) || { c: 0, i: 0 }; o.c += r.clicks; o.i += r.impressions; m.set(p, o); }
  return m;
}

// ---- 記事パース ----
const DIR = 'content/articles';
function parseArticles() {
  const arts = [];
  for (const f of readdirSync(DIR)) {
    if (!f.endsWith('.md') || f.startsWith('_')) continue;
    const t = readFileSync(join(DIR, f), 'utf8');
    const slug = (t.match(/^slug:\s*(.+)$/m) || [])[1]?.trim() || f.replace(/\.md$/, '');
    const title = (t.match(/^title:\s*(.+)$/m) || [])[1]?.trim() || '';
    const category = (t.match(/^category:\s*(.+)$/m) || [])[1]?.trim() || '';
    const noindex = /^noindex:\s*true/m.test(t);
    const links = [...t.matchAll(/\]\(\/article\/([a-z0-9-]+)\)/g)].map((m) => m[1]);
    arts.push({ slug, title, category, noindex, outLinks: [...new Set(links)] });
  }
  return arts;
}

// 外食判定（slug/titleキーワード or category）
const GAISHOKU_KW = /kids-menu|baby-chair|stroller|kodzure-(lunch|washoku|chain)|famiresu|kaiten|sushi|yakiniku|ramen|udon|cafe-chain|burger|gaishoku|chain-kodzure|座敷|個室|ファミレス|キッズメニュー|外食|王将|サイゼ|ガスト|くら寿司|スシロー|はま寿司|ココス|ジョナサン|バーミヤン|デニーズ|大戸屋|やよい軒/i;
const isGaishoku = (a) => GAISHOKU_KW.test(a.slug) || GAISHOKU_KW.test(a.title) || a.category === 'today-taberu';

async function main() {
  const gsc = await gscPages();
  const arts = parseArticles();
  const bySlug = new Map(arts.map((a) => [a.slug, a]));

  // ===== A3: 営業優先リスト（/spot/ GSC表示順、写真有無フラグ） =====
  const KNOWN_PHOTO = new Set(['りんどう湖ファミリー牧場', 'タオル美術館', '花巻おもちゃ美術館', '府中市郷土の森博物館', '東京国立博物館']);
  const spotRows = [...gsc.entries()].filter(([p]) => p.startsWith('/spot/')).map(([p, g]) => ({ p, ...g }));
  spotRows.sort((a, b) => b.i - a.i);
  console.log('\n========== A3: 公式写真 営業優先リスト（GSC表示が多い順 /spot/）==========');
  console.log('（表示は多いが写真が無い＝写真をもらえば即CTR改善。上位ほど優先）\n');
  console.log('順 表示 click  CTR%   URL');
  spotRows.slice(0, 30).forEach((r, i) => {
    const ctr = r.i ? ((r.c / r.i) * 100).toFixed(1) : '0';
    console.log(`${String(i + 1).padStart(2)} ${String(Math.round(r.i)).padStart(5)} ${String(Math.round(r.c)).padStart(4)} ${ctr.padStart(5)}  ${r.p}`);
  });
  console.log(`\n/spot/で表示のあるページ計: ${spotRows.length} / 既知の写真提供5件は別途優先表示中`);

  // ===== B1: 外食クラスター監査 =====
  const gais = arts.filter(isGaishoku);
  // 内部リンクの被リンク数（外食内に限定）
  const gaisSlugs = new Set(gais.map((a) => a.slug));
  const inDeg = new Map();
  for (const a of gais) for (const l of a.outLinks) if (gaisSlugs.has(l)) inDeg.set(l, (inDeg.get(l) || 0) + 1);
  const withGsc = (slug) => gsc.get(`/article/${slug}`) || { c: 0, i: 0 };
  const totalClk = gais.reduce((s, a) => s + withGsc(a.slug).c, 0);
  const totalImp = gais.reduce((s, a) => s + withGsc(a.slug).i, 0);
  const indexed = gais.filter((a) => !a.noindex);

  console.log('\n\n========== B1: 外食クラスター監査 ==========');
  console.log(`外食記事: ${gais.length}本（index ${indexed.length} / noindex ${gais.length - indexed.length}）`);
  console.log(`クラスター合計: ${Math.round(totalClk)}クリック / ${Math.round(totalImp)}表示`);

  console.log('\n--- 稼ぎ頭TOP12（クリック順）---');
  console.log('click 表示  被link out  slug');
  [...gais].sort((a, b) => withGsc(b.slug).c - withGsc(a.slug).c).slice(0, 12).forEach((a) => {
    const g = withGsc(a.slug);
    console.log(`${String(Math.round(g.c)).padStart(5)} ${String(Math.round(g.i)).padStart(5)} ${String(inDeg.get(a.slug) || 0).padStart(5)} ${String(a.outLinks.filter((l) => gaisSlugs.has(l)).length).padStart(4)}  ${a.slug}`);
  });

  console.log('\n--- ピラー候補（被リンク多い＝ハブ）---');
  [...inDeg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([slug, n]) => {
    const g = withGsc(slug); console.log(`  被link${String(n).padStart(2)} / ${Math.round(g.c)}clk ${Math.round(g.i)}imp  ${slug}`);
  });

  console.log('\n--- 孤児（外食内で被リンク0＝クラスターから孤立。稼いでるのに繋がってない=要内部リンク）---');
  const orphans = indexed.filter((a) => !(inDeg.get(a.slug) > 0)).sort((a, b) => withGsc(b.slug).i - withGsc(a.slug).i);
  orphans.slice(0, 15).forEach((a) => { const g = withGsc(a.slug); console.log(`  ${Math.round(g.c)}clk ${String(Math.round(g.i)).padStart(5)}imp  ${a.slug}`); });
  console.log(`  （孤児 計${orphans.length}本。表示があるのに孤立＝内部リンクで束ねる伸びしろ）`);

  console.log('\n--- 内部リンクが少ない稼ぎ頭（out<2＝外食内への発リンク不足）---');
  indexed.filter((a) => withGsc(a.slug).c >= 5 && a.outLinks.filter((l) => gaisSlugs.has(l)).length < 2)
    .sort((a, b) => withGsc(b.slug).c - withGsc(a.slug).c).slice(0, 10)
    .forEach((a) => { const g = withGsc(a.slug); console.log(`  ${Math.round(g.c)}clk out${a.outLinks.filter((l) => gaisSlugs.has(l)).length}  ${a.slug}`); });
}
main().catch((e) => { console.error(e); process.exit(1); });
