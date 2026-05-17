import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = 'content/articles';
const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
const imageUsage = {};
const articleImage = {};
for (const f of files) {
  const txt = readFileSync(path.join(dir, f), 'utf-8');
  const m = txt.match(/^hero:\s*(.+)$/m);
  if (!m) continue;
  const img = m[1].trim();
  imageUsage[img] = (imageUsage[img] || 0) + 1;
  articleImage[f.replace(/\.md$/, '')] = img;
}

// 重複画像 (3+)
const dup = Object.entries(imageUsage).filter(([_, n]) => n >= 3).sort((a, b) => b[1] - a[1]);
console.log('重複画像 (3+):');
dup.forEach(([img, n]) => console.log(`  ${n}x ${img}`));

// 使用中の画像セット
const usedSet = new Set(Object.keys(imageUsage));

// /public/hero-ai/ 配下の未使用 webp/jpg を列挙
const heroDir = 'public/hero-ai';
const heroFiles = readdirSync(heroDir).filter((f) => /\.(webp|jpg|jpeg|png)$/i.test(f));
const unused = [];
for (const hf of heroFiles) {
  const url = `/hero-ai/${hf}`;
  if (!usedSet.has(url)) unused.push(url);
}
console.log(`\n総hero-ai画像: ${heroFiles.length}`);
console.log(`記事で使用中: ${usedSet.size}`);
console.log(`未使用画像: ${unused.length}`);

// food/recipe系の未使用画像を絞り込み
const foodUnused = unused.filter((u) =>
  /food|recipe|kitchen|meal|cook|kodomo|nutrition|fruit|yasai|sweet/i.test(u)
);
console.log(`food/recipe系で未使用: ${foodUnused.length}`);
foodUnused.slice(0, 30).forEach((u) => console.log(`  ${u}`));

// 重複画像を使ってる記事をリスト
console.log('\n=== 重複画像 (3+) を使ってる記事 ===');
for (const [img, n] of dup) {
  const articles = Object.entries(articleImage).filter(([_, i]) => i === img).map(([s]) => s);
  console.log(`\n${img} (${n}記事):`);
  articles.forEach((a) => console.log(`  ${a}`));
}
