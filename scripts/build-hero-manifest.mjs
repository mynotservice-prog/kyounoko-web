#!/usr/bin/env node
/**
 * lib/hero-manifest.json をビルド時に生成する。
 *
 * - public/hero-ai/<slug>.webp / .jpg
 * - public/photos/article-<slug>.webp / .jpg
 * を走査し、{ slug: heroUrl } の Map を作成。
 *
 * 実行タイミング:
 *   prebuild フックで自動実行（package.json に "prebuild" 設定）
 *
 * これにより lib/articles.ts と lib/plans.ts は
 * fs.existsSync(path.join(process.cwd(), 'public', ...)) を呼ばずに済み、
 * Vercel File Tracing が API Function バンドルに public/ 画像を含めてしまう
 * 問題を回避できる。
 *
 * パフォーマンス:
 *   入力ディレクトリ（hero-ai/, photos/, articles/, plans/）のファイル一覧と
 *   その count + 末尾要素のソート結果からフィンガープリントを作成。
 *   既存 manifest と同じなら再走査をスキップ（数秒短縮）。
 *   フィンガープリントは manifest 内 _cacheKey に保存。
 *   FORCE_REBUILD=1 環境変数で強制再生成可能。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const heroAiDir = path.join(ROOT, 'public', 'hero-ai');
const photosDir = path.join(ROOT, 'public', 'photos');

const articleHero = {}; // slug -> /hero-ai/<slug>.webp etc
const planHero = {}; // planId -> /hero-ai/<planId>.webp etc

const outPath = path.join(ROOT, 'lib', 'hero-manifest.json');

/** ディレクトリ内エントリ数 + 名前ソート最終要素を結合してフィンガープリント素材を作る */
function dirSignature(dir) {
  try {
    const list = fs.readdirSync(dir).sort();
    return `${list.length}|${list[0] || ''}|${list[list.length - 1] || ''}`;
  } catch {
    return '0||';
  }
}

const cacheKey = crypto
  .createHash('sha1')
  .update(
    [
      dirSignature(heroAiDir),
      dirSignature(photosDir),
      dirSignature(path.join(ROOT, 'content', 'articles')),
      dirSignature(path.join(ROOT, 'content', 'plans')),
    ].join('::'),
  )
  .digest('hex')
  .slice(0, 16);

// 既存 manifest を読んで cacheKey 一致なら早期 return
const FORCE = process.env.FORCE_REBUILD === '1';
if (!FORCE && fs.existsSync(outPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
    if (existing._cacheKey === cacheKey) {
      console.log(
        `[hero-manifest] cache HIT (key=${cacheKey}) → skip rebuild (${existing.stats?.articleHeroCount ?? '?'} articles, ${existing.stats?.planHeroCount ?? '?'} plans)`,
      );
      process.exit(0);
    }
  } catch {
    // 壊れていれば再生成
  }
}

console.log(`[hero-manifest] cache MISS (key=${cacheKey}) → rebuilding...`);

// hero-ai 配下のファイル一覧
let heroAiFiles = [];
try {
  heroAiFiles = fs.readdirSync(heroAiDir);
} catch {
  heroAiFiles = [];
}

let photosFiles = [];
try {
  photosFiles = fs.readdirSync(photosDir);
} catch {
  photosFiles = [];
}

// ファイル名 Set 化（高速チェック）
const heroAiSet = new Set(heroAiFiles);
const photosSet = new Set(photosFiles);

// content/articles/ のスラッグ走査
const articlesDir = path.join(ROOT, 'content', 'articles');
let articleSlugs = [];
try {
  articleSlugs = fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => f.replace(/\.md$/, ''));
} catch {
  articleSlugs = [];
}

for (const slug of articleSlugs) {
  // 優先順位: hero-ai webp > hero-ai jpg > photos webp
  if (heroAiSet.has(`${slug}.webp`)) {
    articleHero[slug] = `/hero-ai/${slug}.webp`;
  } else if (heroAiSet.has(`${slug}.jpg`)) {
    articleHero[slug] = `/hero-ai/${slug}.jpg`;
  } else if (photosSet.has(`article-${slug}.webp`)) {
    articleHero[slug] = `/photos/article-${slug}.webp`;
  }
}

// content/plans/ のplanId走査
const plansDir = path.join(ROOT, 'content', 'plans');
let planIds = [];
try {
  planIds = fs
    .readdirSync(plansDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => f.replace(/\.md$/, ''));
} catch {
  planIds = [];
}

for (const id of planIds) {
  if (heroAiSet.has(`${id}.webp`)) {
    planHero[id] = `/hero-ai/${id}.webp`;
  } else if (heroAiSet.has(`${id}.jpg`)) {
    planHero[id] = `/hero-ai/${id}.jpg`;
  }
}

// 書き出し
const out = {
  generatedAt: new Date().toISOString(),
  _cacheKey: cacheKey,
  articleHero,
  planHero,
  stats: {
    articleSlugs: articleSlugs.length,
    articleHeroCount: Object.keys(articleHero).length,
    planIds: planIds.length,
    planHeroCount: Object.keys(planHero).length,
  },
};

fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

console.log(
  `[hero-manifest] articles ${out.stats.articleHeroCount}/${out.stats.articleSlugs}, ` +
    `plans ${out.stats.planHeroCount}/${out.stats.planIds} → ${path.relative(ROOT, outPath)}`,
);
