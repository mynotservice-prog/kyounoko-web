#!/usr/bin/env node
/**
 * 凍結記事ガード — PRの差分が「測定中の面」を壊していないか検査する。
 *
 * 正本は docs/experiments-active.md。このスクリプトは同ファイルから
 * 凍結slug・凍結URL・比較基準を読み、差分が次のどれかに当たったら失敗する。
 *
 *   A: 凍結slug の content/articles/<slug>.md が変更された
 *   B: 凍結slug・凍結URL への**リンクが増減した**（別のファイルからでも）
 *   C: 実験の「比較基準」記事へのリンクが増減した
 *
 * 逃げ道は1つだけ: 同じPRで docs/experiments-active.md の「## 汚染の記録」節に
 * 追記していれば通す（判定時にその面を除外できる状態になるため）。
 *
 * 【なぜBとCが要るか】2026-09-18 の #241 は、凍結記事のファイルを1行も触らずに
 * 実験7の対照群「中込農園」と実験4の比較基準へリンクを張り、両方の実験を汚した。
 * 「凍結ファイルの変更」だけを見るガードでは、この型の汚染は1件も止まらない。
 *
 * 使い方:
 *   node scripts/check-frozen.mjs                       # origin/main...HEAD を検査
 *   node scripts/check-frozen.mjs --base origin/main    # 明示
 *   node scripts/check-frozen.mjs --list                # 読み取った凍結対象を表示して終了
 *   FROZEN_CHECK_ALLOW=1 node scripts/check-frozen.mjs  # 緊急時の強制通過（理由をPRに書くこと）
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const REGISTRY = 'docs/experiments-active.md';
const CODE_LIST = 'lib/auto-internal-links.ts';
const CONTAMINATION_HEADING = '## 汚染の記録';

const args = process.argv.slice(2);
const argVal = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const LIST_ONLY = args.includes('--list');
const BASE = argVal('--base', process.env.FROZEN_CHECK_BASE || 'origin/main');
const HEAD = argVal('--head', process.env.FROZEN_CHECK_HEAD || 'HEAD');

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/* ------------------------------------------------------------------ *
 * 1. レジストリを読む
 * ------------------------------------------------------------------ */

function readRegistry() {
  // 作業ツリーの版を読む。CIでは checkout がPRのhead版を置くので、これがhead版になる。
  // （`git show HEAD:` にすると、手元で編集中のレジストリが反映されず混乱するため）
  let text;
  try {
    text = readFileSync(REGISTRY, 'utf8');
  } catch {
    text = git('show', `${HEAD}:${REGISTRY}`);
  }

  const cutAt = text.indexOf(CONTAMINATION_HEADING);
  // 「汚染の記録」より下は過去の記録なので、凍結対象の抽出には使わない
  const activePart = cutAt >= 0 ? text.slice(0, cutAt) : text;

  const frozenSlugs = new Set();
  const frozenUrls = new Set();
  const comparisonBaselines = new Set();

  /* --- 土台①: すでに保守されているコード側のリスト --- */
  // lib/auto-internal-links.ts の EXPERIMENT_FROZEN_SLUGS。二重管理を避けるため、
  // 新しいリストを作らずにこれを読む。
  try {
    const lib = readFileSync(CODE_LIST, 'utf8');
    const m = lib.match(/EXPERIMENT_FROZEN_SLUGS\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
    if (m) for (const [, s] of m[1].matchAll(/'([a-z0-9][a-z0-9-]+)'/g)) frozenSlugs.add(s);
  } catch {
    /* ファイルが無ければブロックだけで動く */
  }

  /* --- 土台②: 実験7の処置群・対照群の節にあるURL（見出しで明示されているので曖昧さがない） --- */
  for (const sub of activePart.split(/^#### /m)) {
    const heading = sub.split('\n', 1)[0] ?? '';
    if (!/処置群|対照群/.test(heading)) continue;
    for (const [, u] of sub.matchAll(/(\/(?:spot|station)\/[A-Za-z0-9._-]+)/g)) frozenUrls.add(u);
  }

  /* --- 土台③: 機械可読ブロック（比較基準はここだけが正本） --- */
  const block = text.match(/```json frozen-check\n([\s\S]*?)```/);
  if (block) {
    let cfg;
    try {
      cfg = JSON.parse(block[1]);
    } catch (e) {
      console.error(`✗ ${REGISTRY} の \`\`\`json frozen-check ブロックが壊れています: ${e.message}`);
      process.exit(2);
    }
    for (const s of cfg.comparisonBaselines ?? []) comparisonBaselines.add(s);
    for (const s of cfg.frozenSlugs ?? []) frozenSlugs.add(s);
    for (const u of cfg.frozenUrls ?? []) frozenUrls.add(u);
    for (const s of cfg.released ?? []) frozenSlugs.delete(s);
    for (const u of cfg.releasedUrls ?? []) frozenUrls.delete(u);
  }

  /* --- ドリフト警告（落とさない） ---
   * 本文に出てくるslugのうち、上の3つの土台に無いものを並べる。
   * ここを「凍結」として扱ってはいけない。レジストリには
   * 「除外した対象と理由」「編集した記事47本」のような、
   * 凍結ではないslugの一覧が混ざっているため（2026-09-21 に誤検知を実測）。
   */
  const mentioned = new Set();
  for (const section of activePart.split(/^### /m)) {
    const heading = section.split('\n', 1)[0] ?? '';
    if (/判定済み/.test(heading)) continue;
    for (const [, token] of section.matchAll(/`([^`\n]+)`/g)) {
      const slug = token.trim().match(/^([a-z0-9][a-z0-9-]{5,})(?:\.md)?$/);
      if (slug && slug[1].includes('-') && !frozenSlugs.has(slug[1])) mentioned.add(slug[1]);
    }
  }

  return { frozenSlugs, frozenUrls, comparisonBaselines, hasBlock: Boolean(block), drift: mentioned };
}

/* ------------------------------------------------------------------ *
 * 2. 差分を読む
 * ------------------------------------------------------------------ */

function mergeBase() {
  try {
    return git('merge-base', BASE, HEAD).trim();
  } catch {
    return BASE;
  }
}

function changedFiles(base) {
  return git('diff', '--name-only', `${base}`, HEAD).split('\n').filter(Boolean);
}

/** 追加行・削除行を {file, sign, text, newLine} で返す */
function changedLines(base) {
  const out = [];
  const diff = git('diff', '--unified=0', base, HEAD);
  let file = null;
  let newLine = 0;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) {
      file = line.slice(6);
      continue;
    }
    if (line.startsWith('--- ')) continue;
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (!file) continue;
    if (line.startsWith('+')) {
      out.push({ file, sign: '+', text: line.slice(1), newLine });
      newLine += 1;
    } else if (line.startsWith('-')) {
      out.push({ file, sign: '-', text: line.slice(1), newLine });
    }
  }
  return out;
}

/** 同じPRが「汚染の記録」節に追記しているか */
function recordedContamination(base, lines) {
  const touched = lines.some((l) => l.file === REGISTRY && l.sign === '+');
  if (!touched) return false;
  let head;
  try {
    head = git('show', `${HEAD}:${REGISTRY}`).split('\n');
  } catch {
    return false;
  }
  const idx = head.findIndex((l) => l.startsWith(CONTAMINATION_HEADING));
  if (idx < 0) return false;
  // 「汚染の記録」より下（=節の中）に追加行があれば記録されたとみなす
  return lines.some((l) => l.file === REGISTRY && l.sign === '+' && l.newLine > idx);
}

/* ------------------------------------------------------------------ *
 * 3. 検査
 * ------------------------------------------------------------------ */

const { frozenSlugs, frozenUrls, comparisonBaselines, hasBlock, drift } = readRegistry();

if (LIST_ONLY) {
  console.log(`凍結slug ${frozenSlugs.size}件:\n  ${[...frozenSlugs].sort().join('\n  ')}`);
  console.log(`\n凍結URL ${frozenUrls.size}件:\n  ${[...frozenUrls].sort().join('\n  ')}`);
  console.log(`\n比較基準 ${comparisonBaselines.size}件:\n  ${[...comparisonBaselines].sort().join('\n  ') || '(なし)'}`);
  console.log(`\n機械可読ブロック: ${hasBlock ? 'あり' : 'なし（比較基準は検査されません）'}`);
  if (drift.size) {
    console.log(`\n△ 本文に出てくるが凍結として扱っていないslug ${drift.size}件（凍結すべきものが混じっていないか、たまに見ること）:`);
    console.log(`  ${[...drift].sort().join('\n  ')}`);
  }
  process.exit(0);
}

const base = mergeBase();
const files = changedFiles(base);
const lines = changedLines(base);

const violations = [];

// --- A: 凍結記事そのものの変更 ---
for (const f of files) {
  const m = f.match(/^content\/articles\/(.+)\.md$/);
  if (m && frozenSlugs.has(m[1])) {
    violations.push({ type: 'A', target: m[1], where: f, detail: '凍結記事のファイルが変更されています' });
  }
}

// --- B/C: 凍結面・比較基準への「リンクの増減」 ---
// リンクの増減だけを見る（本文で名前に触れただけでは落とさない）。
const linkTargets = [
  ...[...frozenUrls].map((u) => ({ kind: 'B', needle: u, label: `凍結URL ${u}` })),
  ...[...frozenSlugs].map((s) => ({ kind: 'B', needle: `/article/${s}`, label: `凍結記事 /article/${s}` })),
  ...[...comparisonBaselines].map((s) => ({ kind: 'C', needle: `/article/${s}`, label: `比較基準 /article/${s}` })),
];

for (const l of lines) {
  // レジストリ自身と、判定台帳・報告書は対象外（記録を書く行為を落とさないため）
  if (l.file === REGISTRY) continue;
  if (l.file.startsWith('reports/')) continue;
  for (const t of linkTargets) {
    if (!l.text.includes(t.needle)) continue;
    // 「リンク」らしさの判定: markdownリンク・href・単独のパス参照
    if (!/\]\(|href=|^\s*[-*]?\s*\/|\s\/(spot|station|article)\//.test(l.text) && !l.text.includes(`](${t.needle}`)) {
      // 素の言及（コード例・文中の記述）は落とさない
      if (!new RegExp(`\\]\\(${t.needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(l.text)) continue;
    }
    violations.push({
      type: t.kind,
      target: t.label,
      where: `${l.file}:${l.sign === '+' ? l.newLine : '削除'}`,
      detail: `${l.sign === '+' ? 'リンクが追加' : 'リンクが削除'}されています: ${l.text.trim().slice(0, 120)}`,
    });
  }
}

/* ------------------------------------------------------------------ *
 * 4. 結果
 * ------------------------------------------------------------------ */

console.log(`凍結ガード: base=${base.slice(0, 8)} head=${HEAD} / 凍結slug ${frozenSlugs.size} ・凍結URL ${frozenUrls.size} ・比較基準 ${comparisonBaselines.size}`);
if (!hasBlock) {
  console.log(`△ ${REGISTRY} に \`\`\`json frozen-check ブロックがありません。比較基準（実験4のような「同じ土俵で比較する」相手）は検査できていません。`);
}

if (violations.length === 0) {
  console.log('✓ 測定中の面に触っている差分はありません。');
  process.exit(0);
}

console.error(`\n✗ 測定中の面に触る差分が ${violations.length} 件あります。\n`);
for (const v of violations) {
  console.error(`  [${v.type}] ${v.target}`);
  console.error(`        ${v.where}`);
  console.error(`        ${v.detail}`);
}

if (recordedContamination(base, lines)) {
  console.error(`\n△ ただし同じPRで ${REGISTRY} の「${CONTAMINATION_HEADING}」に追記があるので通します。`);
  console.error('   判定日に、この面を分母から除外することを忘れないでください。');
  process.exit(0);
}

if (process.env.FROZEN_CHECK_ALLOW) {
  console.error('\n△ FROZEN_CHECK_ALLOW が立っているので通します（理由をPRに書いてください）。');
  process.exit(0);
}

console.error(`
どうすればよいか（どちらか）:
  1. 差分から上記の変更を外す。測定が終わるまで待つ（判定日は ${REGISTRY} にあります）。
  2. 意図的に触るなら、同じPRで ${REGISTRY} の「${CONTAMINATION_HEADING}」節に
     「何を・どの実験の・どの群に・なぜ」を書く。書けばこの検査は通り、判定時に
     その面を分母から外せます。

記録せずに通すと、実験に使った数週間がまるごと無駄になります（2026-08〜09 に5回発生）。
`);
process.exit(1);
