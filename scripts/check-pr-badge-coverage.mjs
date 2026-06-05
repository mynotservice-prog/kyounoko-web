#!/usr/bin/env node
/**
 * PRBadge 網羅性チェッカー。
 *
 * 全 content/articles/*.md を走査し、本文中にアフィリエイト系URLパターンが
 * 含まれる記事を抽出。app/article/[slug]/page.tsx 内の自動判定ロジックと
 * 同じパターンで判定するので、サイト本番で PRBadge が表示される記事の集計と
 * 等価となる。
 *
 * 出力:
 *   - 検出された アフィリエイト含有記事一覧 + その提携先内訳
 *   - 「自動 PRBadge 表示対象」記事数の集計
 *
 * 手動実行: node scripts/check-pr-badge-coverage.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, 'content', 'articles');

// app/article/[slug]/page.tsx 内の bodyHasAffiliateUrl と同じパターン
const AFFILIATE_PATTERNS = [
  { provider: 'Amazon (amzn.to)', re: /amzn\.to/i },
  { provider: 'Amazon (tag=)', re: /amazon\.co\.jp\/[^\s"<]*tag=/i },
  { provider: 'Rakuten item', re: /item\.rakuten\.co\.jp/i },
  { provider: 'Rakuten search', re: /search\.rakuten\.co\.jp/i },
  { provider: 'Rakuten afl', re: /hb\.afl\.rakuten/i },
  { provider: 'もしもアフィリエイト', re: /afl\.moshimo\.com/i },
  { provider: 'A8.net', re: /(?:a8\.net|px\.a8\.net)/i },
  { provider: 'バリュコマ', re: /valuecommerce\.ne\.jp/i },
  { provider: 'tg socdm', re: /tg\.socdm\.com/i },
  { provider: 'Booking.com', re: /booking\.com/i },
];

const articles = fs
  .readdirSync(ARTICLES_DIR)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  .map((f) => f.replace(/\.md$/, ''));

const results = [];
const providerCount = {};

for (const slug of articles) {
  const content = fs.readFileSync(path.join(ARTICLES_DIR, `${slug}.md`), 'utf-8');
  const hits = [];
  for (const { provider, re } of AFFILIATE_PATTERNS) {
    if (re.test(content)) {
      hits.push(provider);
      providerCount[provider] = (providerCount[provider] || 0) + 1;
    }
  }
  if (hits.length > 0) {
    results.push({ slug, providers: hits });
  }
}

console.log(`\n=== PRBadge 自動表示対象 ===`);
console.log(`総記事数: ${articles.length}`);
console.log(`PRBadge 自動表示対象: ${results.length} 記事 (${((100 * results.length) / articles.length).toFixed(1)}%)`);
console.log('');
console.log('=== 提携先別 ===');
const sortedProviders = Object.entries(providerCount).sort((a, b) => b[1] - a[1]);
for (const [p, n] of sortedProviders) {
  console.log(`  ${p}: ${n} 記事`);
}

console.log('\n=== 含有記事 サンプル20件 ===');
for (const r of results.slice(0, 20)) {
  console.log(`  ${r.slug}  [${r.providers.join(', ')}]`);
}

if (results.length === 0) {
  console.log('\n⚠️  アフィリエイトURL検出ゼロ。affiliate-products.ts 経由のみで提供されている可能性。');
  console.log('   その場合は app/article/[slug]/page.tsx の getAffiliateProducts(slug) が並行検査するためカバーされている。');
}

console.log('\n[check-pr-badge-coverage] ✓ done');
