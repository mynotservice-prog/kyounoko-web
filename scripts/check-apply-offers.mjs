#!/usr/bin/env node
/**
 * 申込型アフィリエイトの導線（lib/apply-offers.ts）の検査。
 *
 * 止めるもの（exit 1）:
 *   - 置き場所の slug が content/articles に無い／noindex／タイアップ記事
 *   - 置き場所の slug が docs/experiments-active.md の凍結 slug、または台帳の現役の節に名前が出る記事
 *     （処置・対照でも機械可読ブロックに入れていない実験があるため、名前が出たら止めて人が確かめる。
 *       見出しに「申込型アフィリ」を含む節＝この導線そのものの実験の節は数えない）
 *   - 置き場所が、定義の無い案件を指している
 *   - 描画できる状態の案件のリンクが https でない／ASP のホストでない／確認日の形式が違う
 *
 * 表示するもの: いま描画される記事と案件の一覧、リンク未取得で描画されない案件。
 *
 * 使い方（Node 24。lib の .ts を直接読むため）:
 *   node --import ./scripts/_ts-resolve.mjs scripts/check-apply-offers.mjs
 *   node --import ./scripts/_ts-resolve.mjs scripts/check-apply-offers.mjs --json   # 一覧を JSON で出す
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const { APPLY_PLACEMENTS, APPLY_PROGRAMS, getApplyOffer, isApplyProgramLive } = await import(
  '../lib/apply-offers.ts'
);
const { isTieupArticle } = await import('../lib/reservation-cta.ts');

const ASP_HOSTS = { a8: /^px\.a8\.net$/, moshimo: /^af\.moshimo\.com$/ };
const errors = [];

/* 1. 凍結中の記事（check-frozen.mjs --list の出力を正とする） */
const listOut = execFileSync('node', ['scripts/check-frozen.mjs', '--list'], { encoding: 'utf8' });
const frozen = new Set();
let inFrozen = false;
for (const line of listOut.split('\n')) {
  if (/^凍結slug/.test(line)) inFrozen = true;
  else if (/^\S/.test(line)) inFrozen = false;
  const m = line.match(/^\s{2}([a-z0-9][a-z0-9-]+)\s*$/);
  if (m && inFrozen) frozen.add(m[1]);
}
if (frozen.size === 0) errors.push('凍結 slug を1件も読めませんでした（check-frozen.mjs --list の出力形式が変わった可能性）');

/* 1b. 台帳の現役の節（「## 汚染の記録」より上・判定済みを除く）に名前が出る記事。
 *     この導線そのものの実験の節（見出しに「申込型アフィリ」）は数えない。 */
const registry = readFileSync('docs/experiments-active.md', 'utf8');
const cutAt = registry.indexOf('## 汚染の記録');
const mentioned = new Set();
for (const sec of (cutAt >= 0 ? registry.slice(0, cutAt) : registry).split(/^### /m)) {
  const heading = sec.split('\n', 1)[0] ?? '';
  if (/判定済み|申込型アフィリ/.test(heading)) continue;
  for (const [, token] of sec.matchAll(/`([^`\n]+)`/g)) {
    const m = token.trim().match(/^([a-z0-9][a-z0-9-]{5,})(?:\.md)?$/);
    if (m && m[1].includes('-')) mentioned.add(m[1]);
  }
}

/* 2. 案件の定義 */
const programs = new Map(APPLY_PROGRAMS.map((p) => [p.id, p]));
if (programs.size !== APPLY_PROGRAMS.length) errors.push('APPLY_PROGRAMS に同じ id が2つあります');
for (const p of APPLY_PROGRAMS) {
  if (!isApplyProgramLive(p)) continue;
  let host = '';
  try {
    host = new URL(p.href).hostname;
  } catch {
    errors.push(`${p.id}: href が URL として読めません`);
  }
  if (host && !ASP_HOSTS[p.asp]?.test(host)) errors.push(`${p.id}: href のホスト ${host} が asp=${p.asp} のものではありません`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.copyVerifiedAt)) errors.push(`${p.id}: copyVerifiedAt は YYYY-MM-DD で書いてください`);
}

/* 3. 置き場所 */
const rows = [];
for (const [slug, ids] of Object.entries(APPLY_PLACEMENTS)) {
  const file = `content/articles/${slug}.md`;
  if (!existsSync(file)) {
    errors.push(`${slug}: ${file} がありません`);
    continue;
  }
  const fm = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  if (/^noindex:\s*true/m.test(fm)) errors.push(`${slug}: noindex の記事です`);
  if (isTieupArticle(slug)) errors.push(`${slug}: タイアップ記事です`);
  if (frozen.has(slug)) errors.push(`${slug}: 凍結中の記事です（docs/experiments-active.md）`);
  else if (mentioned.has(slug)) errors.push(`${slug}: 実験台帳の現役の節に名前が出ます。処置・対照でないことを確かめてから入れてください`);
  for (const id of ids) if (!programs.has(id)) errors.push(`${slug}: 案件 ${id} の定義がありません`);
  const offer = getApplyOffer(slug);
  rows.push({ slug, programs: ids, renders: offer ? offer.itemId : null });
}

const live = APPLY_PROGRAMS.filter(isApplyProgramLive).map((p) => p.id);
const idle = APPLY_PROGRAMS.filter((p) => !isApplyProgramLive(p)).map((p) => p.id);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ live, idle, placements: rows, errors }, null, 1));
} else {
  console.log(`描画できる案件 ${live.length}件: ${live.join(', ') || 'なし'}`);
  console.log(`リンク未取得で描画されない案件 ${idle.length}件: ${idle.join(', ') || 'なし'}`);
  console.log(`置き場所 ${rows.length}本（描画される ${rows.filter((r) => r.renders).length}本）:`);
  for (const r of rows) console.log(`  ${r.renders ? '●' : '○'} ${r.slug} → ${r.renders ?? `（${r.programs.join(', ')} はリンク未取得）`}`);
}
if (errors.length) {
  console.error(`\n✗ ${errors.length}件`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.error('\n✓ 置き場所と案件の定義に問題はありません');
