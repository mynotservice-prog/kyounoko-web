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
 *   B/C/D（描画層）: md に現れない描画時のリンク（本文キーワード自動リンク・回遊チップ・駅リンク）を
 *      base と作業ツリーの全記事でシミュレーションし、凍結面・比較基準への被リンク（B/C）と
 *      凍結記事から出るリンク（D）が増減した（7回目の汚染の再発防止。lib/・content/articles/ に差分がある時だけ走る。約20秒）
 *   S: lib/auto-internal-links.ts の FROZEN_TARGET_SLUGS がレジストリの凍結slug全件とずれている（汚染の記録では通らない）
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
 *   node scripts/check-frozen.mjs --force-render        # 差分が無くても描画層シミュレーションを回す（--no-render で省略）
 *   ※ 描画層は --head 省略時「作業ツリー」を見る（未コミットの新記事も対象）。要 npm ci（remark 等）。
 *   FROZEN_CHECK_ALLOW=1 node scripts/check-frozen.mjs  # 緊急時の強制通過（理由をPRに書くこと）
 */

import { execFileSync, spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';
import { pathToFileURL } from 'node:url';

const REGISTRY = 'docs/experiments-active.md';
const CODE_LIST = 'lib/auto-internal-links.ts';
const CONTAMINATION_HEADING = '## 汚染の記録';

const args = process.argv.slice(2);
const argVal = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const LIST_ONLY = args.includes('--list');
const NO_RENDER = args.includes('--no-render');
const FORCE_RENDER = args.includes('--force-render');
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
 * 2.5 描画層シミュレーション（2026-09-25・7回目の汚染の再発防止）
 *
 * md の差分に現れない「描画時に張られるリンク」を base と HEAD の両方で計算して比べる。
 *   auto    : lib/auto-internal-links.ts  injectInternalLinks（本文キーワード→記事）
 *   cluster : lib/article-cluster-links.ts getClusterNav（チェーン／区の姉妹チップ）
 *   station : lib/article-station-link.ts  buildStationLinkForArticle（本文の駅名→/station/...）
 * 本文HTMLは md 全体（TL;DR・FAQ節も含む）を remark で描画したもの。本番は TL;DR・FAQ を
 * 抜いてから注入するので、ここは「本番より多めに拾う」側に倒れている（両側同じ扱いなので差分には効かない）。
 * KV 上書き・chain-facilities 経由の本文は見ない（リポジトリに無いため）。
 * ------------------------------------------------------------------ */

const REPO_ROOT = resolvePath(git('rev-parse', '--show-toplevel').trim());
const RENDER_PATHS = ['lib', 'content/articles'];

/** lib/auto-internal-links.ts の FROZEN_TARGET_SLUGS（作業ツリー版）を静的に読む */
function readFrozenTargetSlugs() {
  try {
    const lib = readFileSync(join(REPO_ROOT, CODE_LIST), 'utf8');
    const m = lib.match(/FROZEN_TARGET_SLUGS\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
    if (!m) return null;
    return new Set([...m[1].matchAll(/'([a-z0-9][a-z0-9-]+)'/g)].map(([, s]) => s));
  } catch {
    return null;
  }
}

/** base（と --head 指定時の head）を一時ディレクトリに展開する。lib と記事だけで足りる。 */
function extractTree(ref) {
  const dir = mkdtempSync(join(tmpdir(), 'frozen-check-'));
  const want = [...RENDER_PATHS, 'package.json'].filter((p) => {
    try {
      git('cat-file', '-e', `${ref}:${p}`);
      return true;
    } catch {
      return false;
    }
  });
  const tar = execFileSync('git', ['archive', '--format=tar', ref, '--', ...want], { maxBuffer: 1024 * 1024 * 1024 });
  execFileSync('tar', ['-x', '-C', dir], { input: tar, maxBuffer: 1024 * 1024 * 1024 });
  // 解決フックは HEAD 版を使う（ROOT を自分の位置から決めるので、コピー先の lib を解決する）
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  copyFileSync(join(REPO_ROOT, 'scripts/_ts-resolve.mjs'), join(dir, 'scripts/_ts-resolve.mjs'));
  const nm = join(REPO_ROOT, 'node_modules');
  if (existsSync(nm)) symlinkSync(nm, join(dir, 'node_modules'), 'dir');
  return dir;
}

/** lib/articles.ts の toIsoDate と同じ規則（本番の publishedAt と同じ文字列にする） */
function toIsoDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'string') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toISOString();
  }
  return null;
}

async function makeRenderer() {
  const [{ remark }, gfm, cjk, html, matter] = await Promise.all([
    import('remark'),
    import('remark-gfm').then((m) => m.default),
    import('remark-cjk-friendly').then((m) => m.default),
    import('remark-html').then((m) => m.default),
    import('gray-matter').then((m) => m.default),
  ]);
  // lib/articles.ts の renderMarkdownToHtml と同じプラグイン構成
  const proc = remark().use(gfm).use(cjk).use(html, { sanitize: false });
  const cache = new Map(); // 本文 → HTML（base と HEAD で同じ本文は1回だけ描画する）
  return async function readArticles(root) {
    const dir = join(root, 'content/articles');
    const out = [];
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
      const raw = readFileSync(join(dir, f), 'utf8');
      const { data: d, content } = matter(raw);
      let h = cache.get(content);
      if (h === undefined) {
        h = String(await proc.process(content));
        cache.set(content, h);
      }
      const qi = d.quickInfo && typeof d.quickInfo === 'object' ? d.quickInfo : undefined;
      const arr = (v) => (Array.isArray(v) ? v.map(String) : undefined);
      out.push({
        file: f,
        slug: typeof d.slug === 'string' ? d.slug : f.replace(/\.md$/, ''),
        title: typeof d.title === 'string' ? d.title : '',
        metaDescription: typeof d.metaDescription === 'string' ? d.metaDescription : '',
        // publishedAt が無い記事は本番では「今」になる（= カットオフ以降の新記事扱い）
        publishedAt: toIsoDate(d.publishedAt) ?? new Date().toISOString(),
        noindex: typeof d.noindex === 'boolean' ? d.noindex : undefined,
        quickInfo: qi ? { place: arr(qi.place), weather: arr(qi.weather), ageRanges: arr(qi.ageRanges) } : undefined,
        html: h,
      });
    }
    return out;
  };
}

function runWorker(tree, articles, label) {
  const work = mkdtempSync(join(tmpdir(), `frozen-sim-${label}-`));
  const inPath = join(work, 'in.json');
  const outPath = join(work, 'out.json');
  writeFileSync(inPath, JSON.stringify({ articles }));
  const nodeArgs = ['--no-warnings'];
  const [maj, min] = process.versions.node.split('.').map(Number);
  if (maj < 23 || (maj === 23 && min < 6)) nodeArgs.push('--experimental-strip-types');
  nodeArgs.push('--import', pathToFileURL(join(tree, 'scripts/_ts-resolve.mjs')).href);
  nodeArgs.push(join(REPO_ROOT, 'scripts/_frozen-render-sim.mjs'), tree, inPath, outPath);
  return new Promise((res, rej) => {
    const p = spawn(process.execPath, nodeArgs, { cwd: tree, stdio: ['ignore', 'inherit', 'pipe'] });
    let err = '';
    p.stderr.on('data', (c) => (err += c));
    p.on('close', (code) => {
      try {
        if (code !== 0) throw new Error(`描画層シミュレーション(${label})が失敗: exit ${code}\n${err.slice(-2000)}`);
        res(JSON.parse(readFileSync(outPath, 'utf8')));
      } catch (e) {
        rej(e);
      } finally {
        rmSync(work, { recursive: true, force: true });
      }
    });
  });
}

/** base と作業ツリーで、描画層に効くファイル（lib・記事md）に差があるか */
function renderInputsChanged(base) {
  if (HEAD !== 'HEAD') return git('diff', '--name-only', base, HEAD, '--', ...RENDER_PATHS).trim() !== '';
  if (git('diff', '--name-only', base, '--', ...RENDER_PATHS).trim() !== '') return true;
  return git('ls-files', '--others', '--exclude-standard', '--', ...RENDER_PATHS).trim() !== '';
}

/**
 * 描画層のリンクのうち「測定中の面に関係するもの」を key → 表示用 にして返す。
 *   in-frozen   : 凍結slug・凍結URL への描画リンク（リンク元の集合）
 *   in-baseline : 比較基準への描画リンク
 *   out-frozen  : 凍結記事から出る描画リンク
 */
function relevantEdges(edges, { frozenSlugs, frozenUrls, comparisonBaselines }) {
  const urlHit = (href) => [...frozenUrls].find((u) => href === u || href.startsWith(`${u}/`) || href.startsWith(`${u}?`) || href.startsWith(`${u}#`));
  const artSlug = (href) => href.match(/^\/article\/([^/?#]+)/)?.[1];
  const m = new Map();
  for (const e of edges) {
    const s = artSlug(e.to);
    const hits = [];
    if (s && frozenSlugs.has(s)) hits.push({ kind: 'B', cat: '凍結記事への被リンク', target: `/article/${s}` });
    const u = urlHit(e.to);
    if (u) hits.push({ kind: 'B', cat: '凍結URLへの被リンク', target: u });
    if (s && comparisonBaselines.has(s)) hits.push({ kind: 'C', cat: '比較基準への被リンク', target: `/article/${s}` });
    if (frozenSlugs.has(e.from)) hits.push({ kind: 'D', cat: '凍結記事から出るリンク', target: `/article/${e.from}` });
    for (const h of hits) m.set(`${h.kind}\t${h.target}\t${e.via}\t${e.from}\t${e.to}`, { ...h, ...e });
  }
  return m;
}

async function simulateRenderLayer(base, registry) {
  const t0 = Date.now();
  const readArticles = await makeRenderer();
  const baseDir = extractTree(base);
  const headDir = HEAD === 'HEAD' ? REPO_ROOT : extractTree(HEAD);
  try {
    const [baseArts, headArts] = [await readArticles(baseDir), await readArticles(headDir)];
    const tRender = Date.now();
    const [b, h] = await Promise.all([runWorker(baseDir, baseArts, 'base'), runWorker(headDir, headArts, 'head')]);
    const be = relevantEdges(b.edges, registry);
    const he = relevantEdges(h.edges, registry);
    const added = [...he].filter(([k]) => !be.has(k)).map(([, v]) => ({ ...v, sign: '+' }));
    const removed = [...be].filter(([k]) => !he.has(k)).map(([, v]) => ({ ...v, sign: '-' }));
    return {
      changes: [...added, ...removed],
      stats: {
        articles: { base: baseArts.length, head: headArts.length },
        edges: { base: b.edges.length, head: h.edges.length },
        relevant: { base: be.size, head: he.size },
        paths: h.paths,
        ms: { render: tRender - t0, total: Date.now() - t0 },
      },
      headFrozenTargetSlugs: h.frozenTargetSlugs,
    };
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
    if (headDir !== REPO_ROOT) rmSync(headDir, { recursive: true, force: true });
  }
}

/* ------------------------------------------------------------------ *
 * 3. 検査
 * ------------------------------------------------------------------ */

const registry = readRegistry();
const { frozenSlugs, frozenUrls, comparisonBaselines, hasBlock, drift } = registry;

// --- S: lib の FROZEN_TARGET_SLUGS とレジストリの凍結slug全件の一致 ---
// 描画層のガード（mayLinkToFrozen）はこの写しを見る。ずれると新記事から凍結面へのリンクが素通りする。
const frozenTargetSlugs = readFrozenTargetSlugs();
const syncProblems = [];
if (!frozenTargetSlugs) {
  syncProblems.push(`${CODE_LIST} に FROZEN_TARGET_SLUGS が見つかりません`);
} else {
  const missing = [...frozenSlugs].filter((s) => !frozenTargetSlugs.has(s)).sort();
  const extra = [...frozenTargetSlugs].filter((s) => !frozenSlugs.has(s)).sort();
  if (missing.length) syncProblems.push(`FROZEN_TARGET_SLUGS に無い凍結slug（新記事からのリンクが止まらない）: ${missing.join(' ')}`);
  if (extra.length) syncProblems.push(`FROZEN_TARGET_SLUGS にあるがレジストリでは凍結でないslug（判定済みなら外す）: ${extra.join(' ')}`);
}

if (LIST_ONLY) {
  console.log(`凍結slug ${frozenSlugs.size}件:\n  ${[...frozenSlugs].sort().join('\n  ')}`);
  console.log(`\n凍結URL ${frozenUrls.size}件:\n  ${[...frozenUrls].sort().join('\n  ')}`);
  console.log(`\n比較基準 ${comparisonBaselines.size}件:\n  ${[...comparisonBaselines].sort().join('\n  ') || '(なし)'}`);
  console.log(`\n機械可読ブロック: ${hasBlock ? 'あり' : 'なし（比較基準は検査されません）'}`);
  if (drift.size) {
    console.log(`\n△ 本文に出てくるが凍結として扱っていないslug ${drift.size}件（凍結すべきものが混じっていないか、たまに見ること）:`);
    console.log(`  ${[...drift].sort().join('\n  ')}`);
  }
  console.log(
    syncProblems.length
      ? `\n✗ ${CODE_LIST} の FROZEN_TARGET_SLUGS とずれています:\n  ${syncProblems.join('\n  ')}`
      : `\n✓ ${CODE_LIST} の FROZEN_TARGET_SLUGS（${frozenTargetSlugs.size}件）と一致`,
  );
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

// --- B/C/D（描画層）: 自動リンク・回遊チップ・駅リンクの増減 ---
const VIA_LABEL = { auto: '本文キーワード自動リンク', cluster: '回遊チップ', station: '駅リンク' };
let renderSummary;
if (NO_RENDER) {
  renderSummary = '△ 描画層シミュレーションは --no-render で省略しました（自動リンク・回遊チップ・駅リンクは未検査）';
} else if (!FORCE_RENDER && !renderInputsChanged(base)) {
  renderSummary = '描画層: lib/・content/articles/ に差分が無いので省略（--force-render で強制）';
} else {
  let sim;
  try {
    sim = await simulateRenderLayer(base, registry);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    console.error('  描画層を検査できませんでした。npm ci 済みか確認するか、理由をPRに書いて --no-render で回してください。');
    process.exit(2);
  }
  const s = sim.stats;
  renderSummary =
    `描画層: 記事 base ${s.articles.base}/head ${s.articles.head} ・描画リンク ${s.edges.base}→${s.edges.head} ` +
    `・測定面に関係するもの ${s.relevant.base}→${s.relevant.head}（${(s.ms.total / 1000).toFixed(1)}秒）`;
  const off = Object.entries(s.paths).filter(([, v]) => !v).map(([k]) => k);
  if (off.length) renderSummary += `\n△ HEAD で見つからない経路: ${off.join(', ')}`;
  for (const c of sim.changes.sort((x, y) => x.kind.localeCompare(y.kind) || x.target.localeCompare(y.target))) {
    violations.push({
      type: c.kind,
      target: `${c.cat} ${c.target}`,
      where: `描画層/${VIA_LABEL[c.via] ?? c.via}: /article/${c.from} → ${c.to}${c.note ? `（${c.note}）` : ''}`,
      detail: c.sign === '+' ? '描画時のリンクが増えます（md の差分には出ない経路）' : '描画時のリンクが消えます（md の差分には出ない経路）',
    });
  }
}

/* ------------------------------------------------------------------ *
 * 4. 結果
 * ------------------------------------------------------------------ */

console.log(`凍結ガード: base=${base.slice(0, 8)} head=${HEAD} / 凍結slug ${frozenSlugs.size} ・凍結URL ${frozenUrls.size} ・比較基準 ${comparisonBaselines.size}`);
console.log(renderSummary);
if (!hasBlock) {
  console.log(`△ ${REGISTRY} に \`\`\`json frozen-check ブロックがありません。比較基準（実験4のような「同じ土俵で比較する」相手）は検査できていません。`);
}

// S は「汚染の記録」では通さない（記録しても描画層のガードは直らないため）
if (syncProblems.length) {
  console.error(`\n✗ [S] ${CODE_LIST} の FROZEN_TARGET_SLUGS がレジストリの凍結slug全件とずれています:`);
  for (const p of syncProblems) console.error(`        ${p}`);
  console.error('        `node scripts/check-frozen.mjs --list` の凍結slugと同じ集合にしてください。');
}

if (violations.length === 0) {
  if (syncProblems.length && !process.env.FROZEN_CHECK_ALLOW) process.exit(1);
  console.log('✓ 測定中の面に触っている差分はありません。');
  process.exit(0);
}

console.error(`\n✗ 測定中の面に触る差分が ${violations.length} 件あります。\n`);
for (const v of violations) {
  console.error(`  [${v.type}] ${v.target}`);
  console.error(`        ${v.where}`);
  console.error(`        ${v.detail}`);
}

if (syncProblems.length && !process.env.FROZEN_CHECK_ALLOW) {
  console.error('\n（[S] が残っているので、汚染の記録があっても通しません）');
  process.exit(1);
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
