#!/usr/bin/env node
/**
 * コンテンツ負債の棚卸し。
 *
 * GSCの実表示数が無くても測れる「構造的な薄さ」で全記事を分類し、
 * noindex/統合の候補をランク化する。
 *
 *   実行: node scripts/audit-content-debt.mjs
 *   出力: docs/content-debt-audit.md（ティア別の候補表）
 *
 * 判定はあくまで構造シグナル。最終的なnoindex判断は GSC の
 * 「表示0かつ4週間経過」と併せて行うこと（保護対象は除外済み）。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ART_DIR = path.join(ROOT, 'content/articles');

// 保護対象スラッグ（収益/ピラー/キラー）はソースから抽出
function extractSlugs(file, marker) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const start = src.indexOf(marker);
  if (start < 0) return [];
  const tail = src.slice(start, start + 4000);
  return [...tail.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
}
const money = extractSlugs('lib/affiliate-products.ts', 'AFFILIATE_TARGET_SLUGS = [');
const pillar = extractSlugs('app/sitemap.ts', 'PILLAR_SLUGS = new Set');
const killer = extractSlugs('app/sitemap.ts', 'KILLER_SLUGS = new Set');
const PROTECTED = new Set([...money, ...pillar, ...killer]);

function fm(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  const meta = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
      if (kv) meta[kv[1]] = kv[2].replace(/^['"]|['"]$/g, '');
    }
  }
  const body = raw.replace(/^---\n[\s\S]*?\n---/, '');
  return { meta, body };
}

const rows = [];
for (const file of fs.readdirSync(ART_DIR)) {
  if (!file.endsWith('.md')) continue;
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(ART_DIR, file), 'utf8');
  const { meta, body } = fm(raw);
  const chars = body.replace(/\s/g, '').length;
  const h2 = (body.match(/^##\s/gm) || []).length;
  const intLinks = (body.match(/\/article\//g) || []).length;
  const hasTable = /^\|/m.test(body);
  const noindex = meta.noindex === 'true';
  const protectedHit = PROTECTED.has(slug);

  // 構造的薄さスコア（高いほど薄い＝負債候補）
  let score = 0;
  if (chars < 1500) score += 3;
  else if (chars < 2500) score += 2;
  else if (chars < 3500) score += 1;
  if (h2 < 3) score += 2;
  if (intLinks === 0) score += 2; // 孤立（被リンク誘導もしにくい）
  if (!hasTable && chars < 3000) score += 1;

  rows.push({ slug, chars, h2, intLinks, hasTable, noindex, protectedHit, score, category: meta.category || '?' });
}

const active = rows.filter((r) => !r.noindex);
// 負債候補 = 保護対象でなく score>=4
const debt = active.filter((r) => !r.protectedHit && r.score >= 4).sort((a, b) => b.score - a.score || a.chars - b.chars);
const reviewMid = active.filter((r) => !r.protectedHit && r.score === 3).sort((a, b) => a.chars - b.chars);

const byCat = {};
for (const r of debt) byCat[r.category] = (byCat[r.category] || 0) + 1;

const md = [];
md.push('# コンテンツ負債 棚卸し（自動分類）\n');
md.push(`> 生成: \`node scripts/audit-content-debt.mjs\` ／ 対象 ${rows.length} 記事（うち既noindex ${rows.length - active.length}）`);
md.push('> 判定は**構造シグナルのみ**（文字数・H2・内部リンク・表の有無）。保護対象（収益/ピラー/キラー 計' + PROTECTED.size + '）は除外。');
md.push('> **最終的なnoindex判断は GSC「表示0かつ4週間経過」と併用すること。** 単独では消さない。\n');
md.push('## サマリ');
md.push(`- 🔴 強い負債候補（score≥4）: **${debt.length}本**`);
md.push(`- 🟡 要レビュー（score=3・増強 or 統合の判断）: **${reviewMid.length}本**`);
md.push(`- 🟢 健全（保護対象＋厚い記事）: ${active.length - debt.length - reviewMid.length}本`);
md.push('\nカテゴリ別の負債候補数: ' + Object.entries(byCat).map(([c, n]) => `${c}=${n}`).join(' / ') + '\n');
md.push('## 推奨アクション');
md.push('1. **強い負債候補**：GSCで表示0を確認 → 同テーマの厚い記事へ301 or canonical統合、統合先が無ければ noindex。');
md.push('2. **要レビュー**：テーマに需要があれば 3,000字超へ増強（独自視点・実体験・表を追加）、無ければ統合。');
md.push('3. 保護対象（収益/ピラー/キラー）は対象外。むしろ内部リンクで強化する。\n');
md.push('## 強い負債候補（score≥4・薄い順 上位60）\n');
md.push('| score | 文字 | H2 | 内部ﾘﾝｸ | 表 | category | slug |');
md.push('|---|---|---|---|---|---|---|');
for (const r of debt.slice(0, 60)) {
  md.push(`| ${r.score} | ${r.chars} | ${r.h2} | ${r.intLinks} | ${r.hasTable ? '○' : '—'} | ${r.category} | ${r.slug} |`);
}
md.push('\n（全' + debt.length + '本の一覧が必要なら本スクリプトのslice上限を外す）\n');

fs.writeFileSync(path.join(ROOT, 'docs/content-debt-audit.md'), md.join('\n') + '\n');
console.log(`保護対象: ${PROTECTED.size}（収益${money.length}/ピラー${pillar.length}/キラー${killer.length}）`);
console.log(`総記事 ${rows.length} / アクティブ ${active.length} / 既noindex ${rows.length - active.length}`);
console.log(`🔴強い負債候補 ${debt.length} / 🟡要レビュー ${reviewMid.length}`);
console.log('→ docs/content-debt-audit.md を生成');
