#!/usr/bin/env node
/**
 * 新規記事の「出す前」品質ゲート（ブロッキング）。
 *
 * scripts/article-quality-audit.ts が既存記事全体の改善候補を並べる**助言**ツール（常に exit 0）なのに対し、
 * こちらは「これから commit / デプロイする記事が憲章の必達条件を満たしているか」を判定し、
 * 1本でも落ちたら **exit 1** で止める。CI・commit 前チェック用。
 *
 * 使い方:
 *   node scripts/article-quality-gate.mjs --new                 # git 上の未追跡/変更ぶんを対象（既定）
 *   node scripts/article-quality-gate.mjs --slugs=a,b,c         # slug 指定
 *   node scripts/article-quality-gate.mjs --new --min-chars=3000
 *   node scripts/article-quality-gate.mjs --new --json
 *
 * なぜ必要か（2026-07-27 の実測に基づく）:
 *  1. **公開中145本に、実施していない「編集部の独自集計」の数字が入っていた。**
 *     AdSense を「有用性の低いコンテンツ」から再審査で通した直後のサイトで、
 *     捏造データと未訪問施設の体験記述は事業の根幹を壊す。→ BANNED_PHRASES / UNSOURCED_STAT で機械検出する。
 *  2. **WebFetch / WebSearch が公式サイトに書かれていない数値を返す事故**が同日に2件確認された
 *     （入園料600円→実際300円・月曜休園→実際は開園・駐車場あり→実際なし／「ドレミファ橋91.2m」は別の橋の値）。
 *     機械では真偽を判定できないので、**出典行の存在**を必須にして人間が追跡できる状態を強制する。
 *  3. hero 画像の実在と内部リンク切れは、過去に存在しない slug へリンクした事故があるため。
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const ROOT = process.cwd();
const ARTICLE_DIR = path.join(ROOT, 'content', 'articles');

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const has = (k) => process.argv.includes(`--${k}`);

const MIN_CHARS = Number(arg('min-chars', '2500'));
const MIN_H2 = Number(arg('min-h2', '5'));
const MIN_TABLES = Number(arg('min-tables', '2'));
const MIN_FAQ = Number(arg('min-faq', '5'));
const AS_JSON = has('json');
const REQUIRE_NOINDEX = has('require-noindex'); // 新規面は noindex 先出しが原則

/** 体験の創作・捏造の痕跡。実体験メディアなので、行っていない施設の体験記述は事業を壊す。 */
const BANNED_PHRASES = [
  '編集部の独自視点',
  '編集部調べ',
  '編集部の調査',
  '独自集計',
  '独自調査',
  '編集長',
  '我が家',
  'わが家',
  '筆者',
  '行ってきました',
  '行ってきた',
  '実際に訪れ',
  '実際に行っ',
  '取材し',
  '食べてみた',
  '歩いてみた',
  '登ってみた',
  '試してみた',
  '体験してきた',
];

/** 出典のない統計の形（「◯◯率 91%」「動線完結率91%」型）。実例が公開中145本で見つかっている。 */
const UNSOURCED_STAT = /(率|割合)[^。\n]{0,12}?[0-9０-９]{1,3}(\.[0-9])?\s*[%％]/g;

/** 出典行。人間が一次情報を追跡できる状態を強制する。 */
const SOURCE_LINE = /出典[：:]/;

function listTargets() {
  const slugsArg = arg('slugs', '');
  if (slugsArg) return slugsArg.split(',').map((s) => s.trim()).filter(Boolean);
  // 既定は --new: git 上の未追跡 or 変更されている content/articles/*.md
  const out = execSync('git status --porcelain content/articles', { cwd: ROOT, encoding: 'utf8' });
  return out
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^\S+\s+/, ''))
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.basename(f, '.md'));
}

const allSlugs = new Set(
  readdirSync(ARTICLE_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
);

const targets = listTargets();
const results = [];

for (const slug of targets) {
  const file = path.join(ARTICLE_DIR, `${slug}.md`);
  const r = { slug, file, ok: false, errors: [], metrics: {} };
  results.push(r);

  if (!existsSync(file)) {
    r.errors.push('ファイルが存在しない');
    continue;
  }
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) {
    r.errors.push('frontmatter を parse できない');
    continue;
  }
  const [, fm, body] = m;

  const chars = body.replace(/\s/g, '').length;
  const h2 = (body.match(/^## /gm) || []).length;
  const tables = (body.match(/\n\|[-: |]+\|\r?\n/g) || []).length;
  const faq = (body.match(/^#{3,4}\s*Q\s*[.．、]/gm) || []).length;
  r.metrics = { chars, h2, tables, faq };

  if (chars < MIN_CHARS) r.errors.push(`本文${chars}字 < ${MIN_CHARS}`);
  if (h2 < MIN_H2) r.errors.push(`## 見出し${h2} < ${MIN_H2}`);
  if (tables < MIN_TABLES) r.errors.push(`表${tables} < ${MIN_TABLES}`);
  if (faq < MIN_FAQ) r.errors.push(`FAQ ${faq}問 < ${MIN_FAQ}`);

  // frontmatter
  const fmSlug = (fm.match(/^slug:\s*(\S+)/m) || [])[1];
  if (!fmSlug) r.errors.push('slug なし');
  else if (fmSlug !== slug) r.errors.push(`slug 不一致（fm:${fmSlug} / file:${slug}）`);
  if (!/^title:\s*\S/m.test(fm)) r.errors.push('title なし');
  if (!/^metaDescription:/m.test(fm)) r.errors.push('metaDescription なし');
  if (REQUIRE_NOINDEX && !/^noindex:\s*true\s*$/m.test(fm)) r.errors.push('noindex: true でない');

  const hero = (fm.match(/^hero:\s*(\S+)/m) || [])[1];
  if (!hero) r.errors.push('hero なし');
  else if (hero.startsWith('/') && !existsSync(path.join(ROOT, 'public', hero)))
    r.errors.push(`hero 画像が存在しない: ${hero}`);

  // 一次情報の追跡可能性
  if (!SOURCE_LINE.test(body)) r.errors.push('出典行なし（一次情報が追跡できない）');

  // 捏造・体験創作
  const banned = BANNED_PHRASES.filter((p) => body.includes(p));
  if (banned.length) r.errors.push(`禁止語: ${banned.join(', ')}`);

  const stats = [...new Set(body.match(UNSOURCED_STAT) || [])];
  if (stats.length) r.errors.push(`出典のない統計の疑い: ${stats.slice(0, 3).join(' / ')}`);

  // 内部リンク切れ
  const links = [...body.matchAll(/\]\(\/article\/([a-z0-9-]+)\)/g)].map((x) => x[1]);
  const dead = [...new Set(links.filter((s) => !allSlugs.has(s)))];
  if (dead.length) r.errors.push(`内部リンク切れ: ${dead.join(', ')}`);

  r.ok = r.errors.length === 0;
}

if (AS_JSON) {
  console.log(JSON.stringify({ targets: results.length, results }, null, 2));
} else {
  if (!results.length) {
    console.log('対象記事なし（--new は git 上の未追跡/変更ぶんを見ます。--slugs= でも指定できます）');
  }
  console.log('slug'.padEnd(34) + '字数   H2   表  FAQ  判定');
  for (const r of results) {
    const mm = r.metrics;
    console.log(
      r.slug.padEnd(34) +
        String(mm.chars ?? '-').padStart(5) +
        String(mm.h2 ?? '-').padStart(5) +
        String(mm.tables ?? '-').padStart(5) +
        String(mm.faq ?? '-').padStart(5) +
        '  ' +
        (r.ok ? '○' : '✗ ' + r.errors.join(' / '))
    );
  }
  const ng = results.filter((r) => !r.ok).length;
  console.log(`\n合格 ${results.length - ng} / ${results.length}`);
}

process.exit(results.some((r) => !r.ok) ? 1 : 0);
