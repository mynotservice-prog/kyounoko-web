#!/usr/bin/env node
/**
 * Google Indexing API 用キュー（docs/indexing-queue.txt）を生成する。
 *
 * IndexNowキューと違い、Google の 200/日 クォータを考慮し、
 * 「最も再クロールしてほしいURL」を優先度順に並べる。
 *
 * 使い方:
 *   node scripts/indexing-build-queue.mjs --max=180 --kind=articles
 *   node scripts/indexing-build-queue.mjs --max=180 --kind=touched   # 今日 updatedAt 更新したもの
 *   node scripts/indexing-build-queue.mjs --max=180 --kind=all
 *
 * 戦略:
 *   - kind=touched: content/articles/*.md で updatedAt=今日 のものを優先送信（既定）
 *   - kind=articles: 全 article URL（lastmod 降順）
 *   - kind=all: 本番 sitemap.xml から全URL
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);
const KIND = args.kind ?? 'touched';
const MAX = Number(args.max ?? 180);
const OUT = 'docs/indexing-queue.txt';
const BASE = 'https://kyounoko.jp';
const TODAY = new Date().toISOString().slice(0, 10);

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

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

function buildTouchedQueue() {
  const root = path.resolve('content/articles');
  const files = listMarkdown(root);
  const urls = [];
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8');
    const m = t.match(/^updatedAt:\s*['"]?([0-9T:.\-Z]+)['"]?\s*$/m);
    if (!m) continue;
    if (!m[1].startsWith(TODAY)) continue;
    const slug = path.basename(f).replace(/\.md$/, '');
    urls.push(`${BASE}/article/${slug}`);
  }
  return urls;
}

async function buildArticlesQueue() {
  const res = await get(`${BASE}/sitemap.xml`);
  if (res.status !== 200) throw new Error(`sitemap fetch failed: ${res.status}`);
  // 子sitemapが含まれていれば再帰
  const childSitemaps = [...res.body.matchAll(/<loc>([^<]+sitemap[^<]+)<\/loc>/g)].map((m) => m[1]);
  let bodies = [res.body];
  if (childSitemaps.length) {
    bodies = await Promise.all(childSitemaps.map(async (u) => (await get(u)).body));
  }
  const all = bodies.flatMap((b) => [...b.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  return all.filter((u) => /\/article\//.test(u));
}

async function buildAllQueue() {
  const res = await get(`${BASE}/sitemap.xml`);
  const childSitemaps = [...res.body.matchAll(/<loc>([^<]+sitemap[^<]+)<\/loc>/g)].map((m) => m[1]);
  let bodies = [res.body];
  if (childSitemaps.length) {
    bodies = await Promise.all(childSitemaps.map(async (u) => (await get(u)).body));
  }
  return bodies.flatMap((b) => [...b.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}

async function main() {
  let urls = [];
  if (KIND === 'touched') urls = buildTouchedQueue();
  else if (KIND === 'articles') urls = await buildArticlesQueue();
  else if (KIND === 'all') urls = await buildAllQueue();
  else throw new Error(`unknown kind: ${KIND}`);

  // 重複除去
  urls = [...new Set(urls)];
  // クォータに合わせて切り詰め
  const sliced = urls.slice(0, MAX);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, sliced.join('\n') + (sliced.length ? '\n' : ''));
  console.log(`✅ wrote ${sliced.length} URLs → ${OUT}  (source=${KIND}, available=${urls.length}, max=${MAX})`);
  if (sliced.length > 0) {
    console.log('サンプル:');
    sliced.slice(0, 5).forEach((u) => console.log('  •', u));
  }
}

main().catch((e) => {
  console.error('error:', e);
  process.exit(1);
});
