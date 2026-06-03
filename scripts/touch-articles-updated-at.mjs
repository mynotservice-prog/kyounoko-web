#!/usr/bin/env node
/**
 * content/articles/*.md の frontmatter `updatedAt` を一斉に今日の日付に更新する。
 *
 * 目的:
 *   - sitemap.xml の lastmod が「今日」になり、Google/Bing に再クロールを促進
 *   - リメギフ手法の Tier 1: 即効性最大 の中核施策
 *
 * 使い方:
 *   node scripts/touch-articles-updated-at.mjs             # 7日以上前更新のものを今日に
 *   node scripts/touch-articles-updated-at.mjs --all       # 全件強制更新
 *   node scripts/touch-articles-updated-at.mjs --skip=14   # 14日以内のものは触らない
 *   node scripts/touch-articles-updated-at.mjs --dry       # 実行せず差分プレビュー
 *
 * 安全策:
 *   - publishedAt は触らない（公開日は不変）
 *   - 直近 7 日（既定）に更新済みのものはスキップ（churn 防止）
 *   - 差分のあるファイルだけ書き込み（git ノイズ削減）
 *   - YAML文法を壊さないよう正規表現で「updatedAt: ...」の1行のみ置換
 */
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const SKIP_DAYS = Number(args.skip ?? 7);
const FORCE_ALL = Boolean(args.all);
const DRY = Boolean(args.dry);

const ROOT = path.resolve(process.cwd(), 'content/articles');
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

function listMarkdown(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue; // _drafts_chain 等はスキップ
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...listMarkdown(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      result.push(full);
    }
  }
  return result;
}

function daysBetween(a, b) {
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function parseUpdatedAt(frontmatter) {
  // 'YYYY-MM-DD' / "YYYY-MM-DD" / YYYY-MM-DD / YYYY-MM-DDTHH:mm:ss.sssZ 形式に対応
  const m = frontmatter.match(/^updatedAt:\s*['"]?([0-9T:.\-Z]+)['"]?\s*$/m);
  if (!m) return null;
  const raw = m[1];
  const d = new Date(raw.length === 10 ? `${raw}T00:00:00.000Z` : raw);
  if (Number.isNaN(d.getTime())) return null;
  return { raw, date: d };
}

function replaceUpdatedAt(text, newValue) {
  // 元の引用スタイル（', ", 引用なし）を保持
  return text.replace(
    /^(updatedAt:\s*)(['"]?)([^'"\n]+)\2(\s*)$/m,
    (_, prefix, quote, _old, tail) => {
      const q = quote || "'"; // 引用なしだった場合は ' を付ける（YAMLの安全側）
      return `${prefix}${q}${newValue}${q}${tail}`;
    }
  );
}

function main() {
  if (!fs.existsSync(ROOT)) {
    console.error(`content/articles ディレクトリが見つかりません: ${ROOT}`);
    process.exit(1);
  }

  const files = listMarkdown(ROOT);
  console.log(`📦 対象ファイル: ${files.length} 件`);
  console.log(`🗓  今日: ${TODAY}`);
  console.log(`⏭  ${FORCE_ALL ? '全件強制更新' : `直近 ${SKIP_DAYS} 日以内に更新済みはスキップ`}`);
  console.log(`💧 ${DRY ? 'DRY RUN（書き込まない）' : '書き込みモード'}`);
  console.log('');

  const today = new Date(`${TODAY}T00:00:00.000Z`);
  let updated = 0;
  let skipped = 0;
  let noField = 0;
  let unchanged = 0;
  const sampleUpdated = [];

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    if (!text.startsWith('---')) {
      noField++;
      continue;
    }
    const end = text.indexOf('\n---', 3);
    if (end < 0) {
      noField++;
      continue;
    }
    const fm = text.slice(3, end);
    const parsed = parseUpdatedAt(fm);
    if (!parsed) {
      noField++;
      continue;
    }

    if (!FORCE_ALL) {
      const dist = daysBetween(parsed.date, today);
      if (dist < SKIP_DAYS) {
        skipped++;
        continue;
      }
    }

    // 既に今日になっていれば書き込まない
    if (parsed.raw.startsWith(TODAY)) {
      unchanged++;
      continue;
    }

    const next = replaceUpdatedAt(text, TODAY);
    if (next === text) {
      unchanged++;
      continue;
    }

    if (!DRY) {
      fs.writeFileSync(file, next);
    }
    updated++;
    if (sampleUpdated.length < 5) {
      sampleUpdated.push(`  • ${path.basename(file)}  (${parsed.raw} → ${TODAY})`);
    }
  }

  console.log('---- 結果 ----');
  console.log(`✅ 更新:   ${updated}`);
  console.log(`⏭  スキップ: ${skipped}  （直近 ${SKIP_DAYS} 日以内）`);
  console.log(`= 不変:   ${unchanged}  （既に今日 or 差分なし）`);
  console.log(`⚠️  未対応: ${noField}  （frontmatter / updatedAt なし）`);
  if (sampleUpdated.length) {
    console.log('\nサンプル:');
    for (const s of sampleUpdated) console.log(s);
  }
  if (DRY) console.log('\n（DRY RUN なので実ファイルは書き換えていません）');
}

main();
