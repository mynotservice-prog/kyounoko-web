/**
 * ファイルベース記事（content/articles/*.md）の品質を実数監査する。
 * AdSense「有用性の低いコンテンツ」のもう一つの懸念＝AI量産記事の薄さ・重複を、
 * 生 markdown から機械計測してリスト化する（捏造ゼロ・純粋な計測）。
 *
 * 実行: npx tsx scripts/article-quality-audit.ts
 *   --json    要対応リストを JSON で標準出力
 *   --top=N   各リストの表示件数（既定20）
 *
 * 計測: 本文文字数 / FAQ有無 / 内部リンク数 / 画像数 / 監修者 / noindex、
 *       MinHash(Jaccard) による近似重複クラスタ。
 * 設計違反ではなく「改善候補」を返すツールなので exit は常に 0。
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const DIR = path.join(process.cwd(), 'content', 'articles');
const TOP = Number((process.argv.find((a) => a.startsWith('--top=')) ?? '').split('=')[1]) || 20;
const AS_JSON = process.argv.includes('--json');

// しきい値（AI記事の中央値は約8,000字なので、これ未満を要注視帯とする）
const THIN_CHARS = 1500; // これ未満は「薄い」
const VERY_THIN_CHARS = 800; // これ未満は「極薄」

type Row = {
  slug: string;
  title: string;
  category: string;
  noindex: boolean;
  chars: number;
  hasFaq: boolean;
  internalLinks: number;
  images: number;
  h2: number;
  supervisor: boolean;
  affiliate: boolean;
};

const faqHeadingRegex = /^##\s+(?:よくある質問|FAQ|Q&A|Q ?and ?A)/im;

/** markdown 本文を素のテキストに落として日本語文字数を数える（空白・記号除外）。 */
function plainChars(md: string): number {
  const t = md
    .replace(/```[\s\S]*?```/g, ' ') // code block
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 画像
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // リンクはテキストのみ
    .replace(/<[^>]+>/g, ' ') // html
    .replace(/[#>*_`~|>-]/g, ' ') // md記号
    .replace(/\s+/g, ''); // 空白除去（日本語は字数≒語数）
  return t.length;
}

/** 重複検出用の正規化シングル集合（4-gram）。 */
function shingles(md: string): Set<string> {
  const t = md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase();
  const s = new Set<string>();
  for (let i = 0; i + 4 <= t.length; i += 1) s.add(t.slice(i, i + 4));
  return s;
}

// FNV-1a + seed で k 個の minhash を作る
const K = 48;
const SEEDS = Array.from({ length: K }, (_, i) => 2166136261 ^ (i * 0x9e3779b1));
function minhash(sh: Set<string>): number[] {
  const mins = new Array(K).fill(0xffffffff);
  for (const g of sh) {
    for (let k = 0; k < K; k++) {
      let h = SEEDS[k];
      for (let c = 0; c < g.length; c++) {
        h ^= g.charCodeAt(c);
        h = Math.imul(h, 16777619) >>> 0;
      }
      if (h < mins[k]) mins[k] = h;
    }
  }
  return mins;
}
function jaccardEst(a: number[], b: number[]): number {
  let eq = 0;
  for (let i = 0; i < K; i++) if (a[i] === b[i]) eq++;
  return eq / K;
}

// ---- 読み込み＆計測 ----
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
const rows: Row[] = [];
const sigs: { slug: string; sig: number[]; chars: number; noindex: boolean }[] = [];

for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;
  const slug = typeof d.slug === 'string' ? d.slug : f.replace(/\.md$/, '');
  const internalLinks = (content.match(/\]\(\/[^)]*\)/g) ?? []).length;
  const images = (content.match(/!\[[^\]]*\]\([^)]*\)/g) ?? []).length;
  const h2 = (content.match(/^##\s+/gm) ?? []).length;
  const affiliate =
    /(amzn\.to|amazon\.co\.jp|item\.rakuten|hb\.afl\.rakuten|afl\.moshimo|a8\.net|px\.a8\.net|valuecommerce)/i.test(
      content,
    );
  const chars = plainChars(content);
  const noindex = d.noindex === true;
  rows.push({
    slug,
    title: typeof d.title === 'string' ? d.title : '',
    category: typeof d.category === 'string' ? d.category : '',
    noindex,
    chars,
    hasFaq: faqHeadingRegex.test(content),
    internalLinks,
    images,
    h2,
    supervisor: typeof d.supervisor === 'string',
    affiliate,
  });
  sigs.push({ slug, sig: minhash(shingles(content)), chars, noindex });
}

// ---- 近似重複クラスタ（index対象同士） ----
// 注意: テンプレ骨格（共通の定型文・見出し構造）を共有する正当な差別化記事も
// 0.7前後では誤検知する。実検証の結果、真の重複は 0.85 以上に絞るのが妥当。
const DUP_T = Number((process.argv.find((a) => a.startsWith('--dup=')) ?? '').split('=')[1]) || 0.85;
const indexableSigs = sigs.filter((s) => !s.noindex);
const parent = new Map<string, string>();
const find = (x: string): string => {
  let r = x;
  while (parent.get(r) && parent.get(r) !== r) r = parent.get(r)!;
  return r;
};
for (const s of indexableSigs) parent.set(s.slug, s.slug);
const dupPairs: Array<[string, string, number]> = [];
for (let i = 0; i < indexableSigs.length; i++) {
  for (let j = i + 1; j < indexableSigs.length; j++) {
    const sim = jaccardEst(indexableSigs[i].sig, indexableSigs[j].sig);
    if (sim >= DUP_T) {
      dupPairs.push([indexableSigs[i].slug, indexableSigs[j].slug, sim]);
      parent.set(find(indexableSigs[i].slug), find(indexableSigs[j].slug));
    }
  }
}
const clusters = new Map<string, string[]>();
for (const s of indexableSigs) {
  const r = find(s.slug);
  if (!clusters.has(r)) clusters.set(r, []);
  clusters.get(r)!.push(s.slug);
}
const dupClusters = [...clusters.values()].filter((c) => c.length >= 2).sort((a, b) => b.length - a.length);

// ---- 集計 ----
const indexable = rows.filter((r) => !r.noindex);
const byCharBucket = { '<800': 0, '800-1500': 0, '1500-3000': 0, '3000+': 0 };
for (const r of indexable) {
  if (r.chars < 800) byCharBucket['<800']++;
  else if (r.chars < 1500) byCharBucket['800-1500']++;
  else if (r.chars < 3000) byCharBucket['1500-3000']++;
  else byCharBucket['3000+']++;
}

const thin = indexable.filter((r) => r.chars < THIN_CHARS).sort((a, b) => a.chars - b.chars);
const noInternal = indexable.filter((r) => r.internalLinks === 0);
const noFaq = indexable.filter((r) => !r.hasFaq);
const noImage = indexable.filter((r) => r.images === 0);

if (AS_JSON) {
  const actionable = indexable
    .filter((r) => r.chars < THIN_CHARS || r.internalLinks === 0)
    .sort((a, b) => a.chars - b.chars)
    .map((r) => ({ slug: r.slug, chars: r.chars, internalLinks: r.internalLinks, hasFaq: r.hasFaq, title: r.title }));
  console.log(JSON.stringify({ actionable, dupClusters }, null, 2));
  process.exit(0);
}

console.log('===== 記事品質 実数監査 =====');
console.log(`総記事数: ${rows.length}（index対象 ${indexable.length} / noindex ${rows.length - indexable.length}）`);
const charsAll = indexable.map((r) => r.chars).sort((a, b) => a - b);
const median = charsAll[Math.floor(charsAll.length / 2)] ?? 0;
console.log(`本文文字数 中央値: ${median.toLocaleString()} / 最小: ${charsAll[0]?.toLocaleString()} / 最大: ${charsAll[charsAll.length - 1]?.toLocaleString()}`);
console.log('文字数分布(index対象):', byCharBucket);
console.log('');
console.log(`薄い記事(<${THIN_CHARS}字): ${thin.length}（うち極薄<${VERY_THIN_CHARS}字: ${thin.filter((r) => r.chars < VERY_THIN_CHARS).length}）`);
console.log(`内部リンク0の記事: ${noInternal.length}`);
console.log(`FAQ無しの記事: ${noFaq.length}`);
console.log(`画像0の記事: ${noImage.length}`);
console.log(`近似重複クラスタ(Jaccard>=${DUP_T}): ${dupClusters.length}グループ / 計${dupClusters.reduce((s, c) => s + c.length, 0)}本`);
console.log('');

console.log(`--- 薄い記事 worst ${TOP}（要底上げ/統合/noindex候補） ---`);
for (const r of thin.slice(0, TOP)) {
  console.log(`  ${r.chars}字 [${r.category}] /article/${r.slug}  link:${r.internalLinks} faq:${r.hasFaq ? 'Y' : 'N'}  ${r.title}`);
}
console.log('');

if (dupClusters.length > 0) {
  console.log(`--- 近似重複クラスタ 上位 ---`);
  for (const c of dupClusters.slice(0, 10)) {
    console.log(`  [${c.length}本] ${c.slice(0, 6).join(', ')}${c.length > 6 ? ' …' : ''}`);
  }
  console.log('');
}

if (noInternal.length > 0) {
  console.log(`--- 内部リンク0（回遊死/孤立リスク）サンプル ${Math.min(TOP, noInternal.length)} ---`);
  for (const r of noInternal.slice(0, TOP)) {
    console.log(`  [${r.category}] /article/${r.slug}  ${r.chars}字  ${r.title}`);
  }
}
