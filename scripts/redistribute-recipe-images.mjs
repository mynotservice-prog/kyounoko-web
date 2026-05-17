import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = 'content/articles';
const files = readdirSync(dir).filter((f) => f.endsWith('.md'));

// 未使用food画像プール（topical keywords付き）
const POOL = [
  { url: '/hero-ai/cat-food-fruit-01.jpg', topics: ['fruit', 'banana', 'apple', 'jelly', 'yogurt'] },
  { url: '/hero-ai/cat-food-fruit-02.jpg', topics: ['fruit', 'banana', 'apple', 'jelly', 'yogurt'] },
  { url: '/hero-ai/cat-food-fruit-03.jpg', topics: ['fruit', 'banana', 'apple', 'jelly', 'yogurt'] },
  { url: '/hero-ai/cat-food-japan-01.jpg', topics: ['washoku', 'onigiri', 'gohan', 'udon', 'rice'] },
  { url: '/hero-ai/cat-food-japan-02.jpg', topics: ['washoku', 'onigiri', 'gohan', 'udon', 'rice'] },
  { url: '/hero-ai/cat-food-japan-03.jpg', topics: ['washoku', 'onigiri', 'gohan', 'udon', 'rice'] },
  { url: '/hero-ai/cat-food-kitchen-01.jpg', topics: ['kitchen', 'frypan', 'cook', 'recipe'] },
  { url: '/hero-ai/cat-food-kitchen-02.jpg', topics: ['kitchen', 'frypan', 'cook', 'recipe'] },
  { url: '/hero-ai/cat-food-kitchen-03.jpg', topics: ['kitchen', 'frypan', 'cook', 'recipe'] },
  { url: '/hero-ai/cat-food-kitchen-03.webp', topics: ['kitchen', 'frypan', 'cook', 'recipe'] },
  { url: '/hero-ai/cat-food-sweet-01.jpg', topics: ['sweet', 'dessert', 'mushipan', 'pudding', 'cake', 'donut', 'oyatsu', 'marshmallow'] },
  { url: '/hero-ai/cat-food-sweet-02.jpg', topics: ['sweet', 'dessert', 'mushipan', 'pudding', 'cake', 'donut', 'oyatsu'] },
  { url: '/hero-ai/cat-food-sweet-03.jpg', topics: ['sweet', 'dessert', 'mushipan', 'pudding', 'cake', 'donut', 'oyatsu'] },
  { url: '/hero-ai/cat-food-sweet-03.webp', topics: ['sweet', 'dessert', 'mushipan', 'pudding', 'cake', 'donut', 'oyatsu'] },
  { url: '/hero-ai/chicken-kodomo-10pattern.webp', topics: ['chicken', 'toriniku', 'tori-momo'] },
  { url: '/hero-ai/dessert-kodomo-tezukuri-5.webp', topics: ['dessert', 'sweet', 'oyatsu', 'fruit'] },
  { url: '/hero-ai/gyuuniku-ryouri-kodomo-okiniiri.webp', topics: ['meat', 'butaniku', 'kimchi', 'yangnyom'] },
];

// 重複画像を使う記事を再割り当て対象に
const DUPS = [
  '/hero-ai/cat-food-japan-01.webp',
  '/hero-ai/cat-food-japan-02.webp',
  '/hero-ai/cat-food-japan-03.webp',
  '/hero-ai/cat-food-sweet-01.webp',
  '/hero-ai/cat-food-kitchen-02.webp',
  '/hero-ai/cat-family-dinner-01.webp',
];

const usage = new Map(); // url -> count in current state
const fileToImg = new Map();
for (const f of files) {
  const txt = readFileSync(path.join(dir, f), 'utf-8');
  const m = txt.match(/^hero:\s*(.+)$/m);
  if (m) {
    const img = m[1].trim();
    usage.set(img, (usage.get(img) || 0) + 1);
    fileToImg.set(f, img);
  }
}

// 各重複画像について、最初の1記事は残してそれ以降を再割り当て
function scoreImageForSlug(slug, imgUrl) {
  const pool = POOL.find((p) => p.url === imgUrl);
  if (!pool) return 0;
  let score = 0;
  for (const topic of pool.topics) {
    if (slug.includes(topic)) score += 10;
  }
  // 全く未使用の画像を優先
  if ((usage.get(imgUrl) || 0) === 0) score += 5;
  // 重複が増えるほど減点
  score -= (usage.get(imgUrl) || 0) * 2;
  return score;
}

let changeCount = 0;
const log = [];

for (const dupImg of DUPS) {
  const articlesUsing = [...fileToImg.entries()].filter(([_, i]) => i === dupImg).map(([f]) => f);
  // 先頭1記事は残す（最も汎用的に見えるもの＝最初のもの）
  const keep = articlesUsing.shift();
  log.push(`\n=== ${dupImg} (${articlesUsing.length + 1}記事 → 1 keep / ${articlesUsing.length} reassign) ===`);
  log.push(`  KEEP: ${keep}`);
  for (const fname of articlesUsing) {
    const slug = fname.replace(/\.md$/, '');
    // 最適画像をスコアで選ぶ
    const scored = POOL.map((p) => ({ url: p.url, score: scoreImageForSlug(slug, p.url) }));
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (!best || best.url === dupImg) {
      log.push(`  SKIP: ${fname} (no good match)`);
      continue;
    }
    const newImg = best.url;
    // ファイル書き換え
    const fp = path.join(dir, fname);
    let src = readFileSync(fp, 'utf-8');
    src = src.replace(/^hero:\s*.+$/m, `hero: ${newImg}`);
    writeFileSync(fp, src);
    usage.set(dupImg, usage.get(dupImg) - 1);
    usage.set(newImg, (usage.get(newImg) || 0) + 1);
    log.push(`  RE: ${fname}\n      ${dupImg}  →  ${newImg}`);
    changeCount++;
  }
}

console.log(log.join('\n'));
console.log(`\n=== 完了: ${changeCount}件再割り当て ===`);
