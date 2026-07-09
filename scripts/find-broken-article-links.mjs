// 全 content/articles/*.md 内の [text](/article/SLUG) を集め、
// content/articles/SLUG.md が無く lib/article-redirects.ts の from にも無いものを列挙する。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'content/articles');
const REDIRECTS_TS = path.join(ROOT, 'lib/article-redirects.ts');

// 実在slug集合
const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
const existing = new Set(files.map((f) => f.replace(/\.md$/, '')));

// リダイレクト from集合
const redirectsSrc = fs.readFileSync(REDIRECTS_TS, 'utf8');
const redirectFrom = new Set();
for (const m of redirectsSrc.matchAll(/from:\s*'([^']+)'/g)) {
  redirectFrom.add(m[1]);
}

// /article/SLUG 参照を全収集（クエリ/アンカー付きも吸収）
const linkRe = /\]\(\/article\/([a-z0-9][a-z0-9-]*)(?:[)#?])/gi;
const broken = new Map(); // slug -> Set<file>

for (const f of files) {
  const src = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
  for (const m of src.matchAll(linkRe)) {
    const slug = m[1];
    if (existing.has(slug) || redirectFrom.has(slug)) continue;
    if (!broken.has(slug)) broken.set(slug, new Set());
    broken.get(slug).add(f);
  }
}

const entries = [...broken.entries()].sort((a, b) => b[1].size - a[1].size);
let total = 0;
for (const [slug, set] of entries) {
  total += set.size;
  console.log(`\n[${set.size}] /article/${slug}`);
  for (const f of [...set].sort()) console.log(`    ${f}`);
}
console.log(`\n=== 壊れslug ${entries.length}種 / のべ被リンク ${total}件 ===`);
