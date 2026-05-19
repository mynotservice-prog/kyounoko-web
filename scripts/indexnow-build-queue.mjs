#!/usr/bin/env node
/**
 * docs/indexnow-queue.txt を生成する。
 *
 * 戦略:
 *   - 本番 sitemap.xml をフェッチして URL を抽出（最も確実、デプロイ後の最新状態）
 *   - --kind=spots で /station/(slug)/(asobiba|kouen|ame-asobiba) のみ抽出
 *   - --kind=articles で /article/ 配下のみ
 *   - --kind=plans で /plan/ 配下のみ
 *   - --kind=all で全部
 *
 * 使い方:
 *   node scripts/indexnow-build-queue.mjs --max=8000 --kind=spots
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const BASE = 'https://kyounoko.jp';
const OUT = 'docs/indexnow-queue.txt';
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const MAX = Number(args.max ?? 8000);
const KIND = args.kind ?? 'all'; // all | spots | articles | plans

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    }).on('error', reject);
  });
}

function extractUrls(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) urls.push(m[1]);
  return urls;
}

async function fetchAllSitemapUrls() {
  console.log(`fetching ${BASE}/sitemap.xml ...`);
  const top = await get(`${BASE}/sitemap.xml`);
  if (top.status !== 200) {
    throw new Error(`sitemap.xml fetch failed: ${top.status}`);
  }
  // sitemap index 形式 or 単一 urlset
  const isIndex = /<sitemapindex/.test(top.body);
  if (!isIndex) return extractUrls(top.body);
  // index 形式: 子 sitemap を全て取得
  const childUrls = extractUrls(top.body);
  console.log(`  sitemapindex detected, fetching ${childUrls.length} child sitemaps`);
  const all = [];
  for (const child of childUrls) {
    const c = await get(child);
    if (c.status === 200) all.push(...extractUrls(c.body));
  }
  return all;
}

function filterByKind(urls, kind) {
  if (kind === 'all') return urls;
  if (kind === 'spots') {
    // /station/(slug)/(asobiba|kouen|ame-asobiba)
    return urls.filter((u) =>
      /\/station\/[^/]+\/(asobiba|kouen|ame-asobiba)$/.test(u),
    );
  }
  if (kind === 'articles') {
    return urls.filter((u) => /\/article\/[^/]+$/.test(u));
  }
  if (kind === 'plans') {
    return urls.filter((u) => /\/plan\/[^/]+$/.test(u));
  }
  return urls;
}

async function main() {
  const all = await fetchAllSitemapUrls();
  console.log(`total urls in sitemap: ${all.length}`);
  const filtered = filterByKind(all, KIND);
  console.log(`filtered (kind=${KIND}): ${filtered.length}`);
  const unique = [...new Set(filtered)];
  const trimmed = unique.slice(0, MAX);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, trimmed.join('\n') + '\n');
  console.log(`wrote ${trimmed.length} URLs to ${OUT} (max=${MAX})`);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
