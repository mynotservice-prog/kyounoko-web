#!/usr/bin/env node
/**
 * 記事から Amazon リンク行を一括削除。
 * 対象パターン: `- [Amazon...](https://www.amazon.co.jp/...)` または amzn.to/amzn.asia
 * 楽天リンクは残す。直接アソシエイトを再申請する将来に備えコード側のwrap関数は残置。
 */
import fs from 'node:fs';
import path from 'node:path';

const articlesDir = path.resolve('content/articles');
const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));

const AMAZON_LINE_RE =
  /^\s*-\s*\[[^\]]*Amazon[^\]]*\]\(https?:\/\/[^)]*(?:amazon\.co\.jp|amazon\.com|amzn\.to|amzn\.asia)[^)]*\)\s*$/i;

let totalRemoved = 0;
let filesChanged = 0;

for (const file of files) {
  const filePath = path.join(articlesDir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');
  const filtered = lines.filter((line) => !AMAZON_LINE_RE.test(line));
  const removed = lines.length - filtered.length;
  if (removed > 0) {
    fs.writeFileSync(filePath, filtered.join('\n'), 'utf8');
    totalRemoved += removed;
    filesChanged++;
    console.log(`  ${file}: -${removed}行`);
  }
}

console.log(`\n完了: ${filesChanged}記事から計${totalRemoved}行のAmazonリンクを削除`);
