#!/usr/bin/env node
/**
 * 薄記事の監査スクリプト。
 * - 文字数（frontmatter除外）
 * - 見出し数（##/###）
 * - 段落数（空行で区切り）
 * - 関連リンクの有無
 * - noindexフラグ
 * を集計し、しきい値以下の記事を優先度付きで出力する。
 */
import fs from 'node:fs';
import path from 'node:path';

const articlesDir = path.resolve('content/articles');
const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));

// しきい値（AdSense審査で "薄い" と判定されないライン）
const MIN_CHARS = 2500; // 日本語2,500字 = だいたい4-5分の読了
const MIN_HEADINGS = 5;

function analyze(raw) {
  // frontmatter剥がし
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const body = fmMatch ? fmMatch[2] : raw;
  const front = fmMatch ? fmMatch[1] : '';

  const noindex = /^noindex:\s*true\s*$/m.test(front);
  const charCount = body.replace(/\s/g, '').length;
  const headings = (body.match(/^#{2,3}\s/gm) || []).length;
  const hasFaq = /^##\s*FAQ|よくある質問/m.test(body);
  const hasRelated = /関連記事|seoRelated/.test(raw);

  return { charCount, headings, noindex, hasFaq, hasRelated };
}

const rows = files.map((file) => {
  const raw = fs.readFileSync(path.join(articlesDir, file), 'utf8');
  const a = analyze(raw);
  return { file, ...a };
});

// noindex は審査対象外なので除外
const visible = rows.filter((r) => !r.noindex);

// 優先度: 文字数低い順 + 見出し数低い
const thin = visible
  .filter((r) => r.charCount < MIN_CHARS || r.headings < MIN_HEADINGS)
  .sort((a, b) => a.charCount - b.charCount);

console.log('=== サマリー ===');
console.log(`全記事: ${rows.length}本`);
console.log(`noindex除外: ${rows.length - visible.length}本`);
console.log(`公開対象: ${visible.length}本`);
console.log(`薄記事候補（${MIN_CHARS}字未満 or 見出し${MIN_HEADINGS}未満）: ${thin.length}本`);
console.log('');
console.log('=== 上位30件（要肉付け候補） ===');
console.log('文字数  見出し  FAQ  関連  ファイル');
for (const r of thin.slice(0, 30)) {
  console.log(
    `${String(r.charCount).padStart(5)}  ${String(r.headings).padStart(4)}  ${
      r.hasFaq ? ' ○ ' : ' - '
    }  ${r.hasRelated ? ' ○ ' : ' - '}  ${r.file}`,
  );
}

// 文字数別ヒストグラム
console.log('');
console.log('=== 文字数分布 ===');
const buckets = { '<1000': 0, '1000-2000': 0, '2000-2500': 0, '2500-4000': 0, '4000+': 0 };
for (const r of visible) {
  if (r.charCount < 1000) buckets['<1000']++;
  else if (r.charCount < 2000) buckets['1000-2000']++;
  else if (r.charCount < 2500) buckets['2000-2500']++;
  else if (r.charCount < 4000) buckets['2500-4000']++;
  else buckets['4000+']++;
}
for (const [k, v] of Object.entries(buckets)) {
  console.log(`  ${k.padEnd(12)} ${v}本  ${'■'.repeat(Math.round(v / 5))}`);
}
