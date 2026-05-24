#!/usr/bin/env node
/**
 * AdSense審査対策（2026-05）: 子連れ需要の低いマイナー/業態違いチェーンの単独記事を
 * noindex 化して、インデックス集合のユニーク記事比率を上げる。
 *
 * 残す: 主要チェーン（検索需要大）＋季節イベント＋比較ランキング記事
 * noindex: 居酒屋系・サブブランド・マイナーカフェ・低需要チェーン
 *
 * frontmatter に `noindex: true` を追記する（article ページが対応済み）。
 * 承認後に外して再indexする想定。
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'content/articles';

// noindex 対象（kodzure-koryaku 単独記事のうち低需要・業態違い）
const TARGETS = [
  'anrakutei',
  'bronco-billy',
  'freshness-burger',
  'ikea-restaurant',
  'kagonoya',
  'maido-ookini-shokudo',
  'musashinomori-coffee',
  'onyasai',
  'origin-bento',
  'steak-gusto',
  'torikizoku',
  'ueshima-coffee',
  'uotami',
  'veloce',
  'yumean',
  'yuzuan',
  'zetteria',
].map((s) => `${s}-kodzure-koryaku`);

let done = 0;
const missing = [];

for (const slug of TARGETS) {
  const fp = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(fp)) { missing.push(slug); continue; }
  let raw = fs.readFileSync(fp, 'utf8');
  if (/^noindex:\s*true/m.test(raw)) { done++; continue; } // 既にある
  // frontmatter の最初の `slug:` 行の直後に noindex: true を挿入
  const m = raw.match(/^---\n/);
  if (!m) { missing.push(slug + ' (no frontmatter)'); continue; }
  // 先頭の `---\n` の直後に noindex を入れる
  raw = raw.replace(/^---\n/, '---\nnoindex: true\n');
  fs.writeFileSync(fp, raw);
  done++;
}

console.log(`noindex付与: ${done} / 対象${TARGETS.length}`);
if (missing.length) console.log('見つからない:', missing.join(', '));
