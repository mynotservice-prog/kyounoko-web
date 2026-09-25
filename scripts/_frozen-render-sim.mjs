/**
 * check-frozen.mjs の描画層シミュレーション（ワーカー）。直接は呼ばない。
 *
 * 1本のツリー（HEAD の作業ツリー、または base を展開した一時ディレクトリ）の lib を読み、
 * 親が渡した記事一覧（本文HTML込み）について、描画層が張るリンクを列挙して JSON で返す。
 *
 *   auto    : lib/auto-internal-links.ts の injectInternalLinks（本文キーワード→記事）
 *   cluster : lib/article-cluster-links.ts の getClusterNav（チェーン／区の姉妹チップ）
 *   station : lib/article-station-link.ts の buildStationLinkForArticle（本文の駅名→/station/...）
 *
 * 起動（親が組み立てる）:
 *   node --experimental-strip-types --no-warnings --import <tree>/scripts/_ts-resolve.mjs \
 *     scripts/_frozen-render-sim.mjs <tree> <input.json> <output.json>
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [tree, inputPath, outputPath] = process.argv.slice(2);
const input = JSON.parse(readFileSync(inputPath, 'utf8'));

async function load(rel) {
  const p = join(tree, rel);
  if (!existsSync(p)) return null; // base にまだ無い lib はその経路が無かったとみなす
  return import(pathToFileURL(p).href);
}

const autoLib = await load('lib/auto-internal-links.ts');
const clusterLib = await load('lib/article-cluster-links.ts');
const stationLib = await load('lib/article-station-link.ts');

const inject = autoLib?.injectInternalLinks;
const clusterNav = clusterLib?.getClusterNav ?? clusterLib?.getChainClusterNav;
const buildStation = stationLib?.buildStationLinkForArticle;

// getAllFileArticles() と同じ並び（readdir順 → publishedAt 降順）。getChainClusterNav は
// 「同じ suffix は先に見つかった1本だけ」なので、並びが違うと結果が変わる。
const all = input.articles
  .map((a) => ({ slug: a.slug, publishedAt: a.publishedAt, noindex: a.noindex, title: a.title }))
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

const HREF_RE = /href="([^"]+)"/g;
const AUTO_RE = /<a\b[^>]*href="([^"]+)"[^>]*data-auto="1"[^>]*>([\s\S]*?)<\/a>/g;

function hrefCounts(html) {
  const m = new Map();
  for (const [, h] of html.matchAll(HREF_RE)) m.set(h, (m.get(h) ?? 0) + 1);
  return m;
}

const edges = [];
for (const a of input.articles) {
  let html = a.html;

  if (inject) {
    const out = inject(a.html, a.slug, { publishedAt: a.publishedAt });
    // 注入で増えた href を数える（マークアップが変わっても拾えるよう、増分で判定する）
    const before = hrefCounts(a.html);
    const after = hrefCounts(out);
    const kw = new Map();
    for (const [, h, text] of out.matchAll(AUTO_RE)) if (!kw.has(h)) kw.set(h, text);
    for (const [h, n] of after) {
      if (n > (before.get(h) ?? 0)) edges.push({ via: 'auto', from: a.slug, to: h, note: kw.get(h) ?? '' });
    }
    html = out;
  }

  if (clusterNav) {
    const nav = clusterNav(a.slug, all);
    for (const it of nav?.items ?? []) edges.push({ via: 'cluster', from: a.slug, to: it.href, note: it.label });
  }

  if (buildStation) {
    const st = buildStation({
      title: a.title,
      metaDescription: a.metaDescription,
      body: html,
      quickInfo: a.quickInfo,
    });
    if (st?.href) edges.push({ via: 'station', from: a.slug, to: st.href, note: st.label ?? '' });
  }
}

const frozenTargetSlugs = autoLib?.FROZEN_TARGET_SLUGS ? [...autoLib.FROZEN_TARGET_SLUGS] : null;

writeFileSync(
  outputPath,
  JSON.stringify({
    paths: { auto: Boolean(inject), cluster: Boolean(clusterNav), station: Boolean(buildStation) },
    frozenTargetSlugs,
    edges,
  }),
);
