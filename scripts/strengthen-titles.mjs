#!/usr/bin/env node
/**
 * 記事タイトルを SEO/CTR 観点で強化するスクリプト。
 *
 * リメギフ手法 Tier 3 #8 の移植版。kyounoko 用に「破壊的書き換えはしない」運用に調整。
 *
 * ## 何をやるか
 *   - 年号も具体数字も入っていない「素のタイトル」を抽出
 *   - slug が商品系/比較系/ランキング系であれば「【2026年最新】」プレフィックスを付与
 *   - 既に【】が冒頭にあるタイトルは触らない
 *   - 60文字を超えるタイトルは触らない（titleタグ長対策）
 *   - 触ったものは frontmatter `updatedAt` も今日に更新（再クロール促進）
 *
 * ## 使い方
 *   node scripts/strengthen-titles.mjs                 # DRY RUN（プレビュー）
 *   node scripts/strengthen-titles.mjs --apply         # 実際に書き換え
 *   node scripts/strengthen-titles.mjs --report-only   # docs/title-strengthen-report.md だけ出す
 *
 * ## 設計の安全側
 *   - デフォルトは DRY。意図せず一括書き換えにならない。
 *   - 候補抽出ロジックを slug ベースに絞り、年号付け足しのみに限定
 *   - 「育児マップ」「発達ガイド」等の Mr. 良タイトルは対象外
 *   - 変更ファイル数を 200/run まで（安全側）
 */
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);
const APPLY = Boolean(args.apply);
const REPORT_ONLY = Boolean(args['report-only']);
const MAX_CHANGES = Number(args.max ?? 200);
const ROOT = path.resolve('content/articles');
const TODAY = new Date().toISOString().slice(0, 10);
const YEAR = TODAY.slice(0, 4);
const REPORT_PATH = 'docs/title-strengthen-report.md';

/** slug が「商品系/比較系/ランキング系」=【2026年最新】の効果が高い領域 */
const PRODUCT_SLUG_RE =
  /(ranking|osusume|hikaku|erabikata|katte-yokatta|review|comparison|matome|sentaku|babycar|baby-chair|kosodate-app|chiku|knowledge-toy|chiiku|insurance|hoken|stroller|cribba|crib|nyuuyoufuku|child-seat|chinese|bento-box|kyaraben|sunscreen|hiyakedome|mushiyoke|repellent|katei-pool|home-pool|naraigoto|kumon|gakken|shichida|tsuushin-kyouiku|kyouzai)/i;

/** 「育児マップ」「発達ガイド」等、すでに完成形タイトルのため触らない slug パターン */
const SKIP_SLUG_RE = /(kanzen-map|kanzen-guide|hattatsu)/i;

function listMarkdown(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...listMarkdown(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) result.push(full);
  }
  return result;
}

/** タイトルに年号 or 具体数字が入っているか */
function isAlreadyStrong(title) {
  const hasYear = /20\d{2}|【最新】|【保存版】|【完全/.test(title);
  const hasNumber =
    /\d+選|\d+つ|\d+パターン|\d+ステップ|\d+個|\d+枚|\d+番|\d+ランキング|\d+人|TOP\s*\d+|\d+例|\d+chain|\d+店/i.test(
      title,
    );
  return hasYear || hasNumber;
}

/** 既に冒頭が【...】で始まっている */
function hasLeadingBrackets(title) {
  return /^【[^】]+】/.test(title);
}

function strengthen(title) {
  // 60字超は触らない（タイトル長の安全側）
  if (title.length >= 56) return null;
  return `【${YEAR}年最新】${title}`;
}

function main() {
  const files = listMarkdown(ROOT);
  console.log(`📦 articles: ${files.length}`);
  const candidates = [];
  let alreadyStrong = 0;
  let leadingBrackets = 0;
  let skippedSlug = 0;
  let nonProduct = 0;

  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const slug = path.basename(f).replace(/\.md$/, '');
    const m = text.match(/^title:\s*(.+)$/m);
    if (!m) continue;
    const title = m[1].replace(/^['"](.*)['"]$/, '$1').trim();
    if (isAlreadyStrong(title)) { alreadyStrong++; continue; }
    if (hasLeadingBrackets(title)) { leadingBrackets++; continue; }
    if (SKIP_SLUG_RE.test(slug)) { skippedSlug++; continue; }
    if (!PRODUCT_SLUG_RE.test(slug)) { nonProduct++; continue; }
    const next = strengthen(title);
    if (!next || next === title) continue;
    candidates.push({ file: f, slug, oldTitle: title, newTitle: next });
  }

  console.log(`✅ 強化候補: ${candidates.length}`);
  console.log(`  ⏭ 既に強い(年号/数字): ${alreadyStrong}`);
  console.log(`  ⏭ 既に【】先頭: ${leadingBrackets}`);
  console.log(`  ⏭ skip slug (完成形): ${skippedSlug}`);
  console.log(`  ⏭ 商品系/比較系でない: ${nonProduct}`);

  if (candidates.length === 0) {
    console.log('変更対象なし。');
    return;
  }

  // レポート生成
  const reportLines = [
    `# タイトル強化レポート (${TODAY})`,
    '',
    `総候補数: **${candidates.length}**`,
    '',
    '| slug | 旧 | 新 |',
    '|---|---|---|',
    ...candidates.map((c) => `| ${c.slug} | ${c.oldTitle} | ${c.newTitle} |`),
    '',
  ];
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, reportLines.join('\n'));
  console.log(`📝 report: ${REPORT_PATH}`);

  if (REPORT_ONLY) {
    console.log('--report-only モードのため書き換えはスキップ');
    return;
  }

  // サンプル表示
  console.log('\nサンプル (先頭5件):');
  candidates.slice(0, 5).forEach((c) => {
    console.log(`  • ${c.oldTitle}`);
    console.log(`    → ${c.newTitle}`);
  });

  if (!APPLY) {
    console.log('\n💧 DRY RUN — 書き換えていません。--apply で実行。');
    return;
  }

  const targets = candidates.slice(0, MAX_CHANGES);
  let written = 0;
  for (const c of targets) {
    const text = fs.readFileSync(c.file, 'utf8');
    // タイトル行を一行だけ置換（引用スタイルを保持しつつ）。
    const replaced = text.replace(/^title:\s*(.+)$/m, (line, raw) => {
      const stripped = raw.replace(/^['"](.*)['"]$/, '$1').trim();
      if (stripped !== c.oldTitle) return line; // 念のため
      // 元の引用スタイル
      const wasQuoted = /^['"]/.test(raw.trim());
      const q = wasQuoted ? raw.trim()[0] : '';
      return q ? `title: ${q}${c.newTitle}${q}` : `title: ${c.newTitle}`;
    });
    // updatedAt も今日に
    const replaced2 = replaced.replace(
      /^(updatedAt:\s*)(['"]?)([^'"\n]+)\2(\s*)$/m,
      (_, prefix, quote, _old, tail) => {
        const q = quote || "'";
        return `${prefix}${q}${TODAY}${q}${tail}`;
      },
    );
    fs.writeFileSync(c.file, replaced2);
    written++;
  }
  console.log(`\n✅ 書き換え: ${written} 件`);
}

main();
