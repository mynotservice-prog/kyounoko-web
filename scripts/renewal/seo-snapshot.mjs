#!/usr/bin/env node
/**
 * リニューアル前後で SEO/GEO に効く出力が変わっていないかを機械照合するスナップショット。
 *   node scripts/renewal/seo-snapshot.mjs snap <outDir> [baseUrl]   … URL一覧を取得して保存
 *   node scripts/renewal/seo-snapshot.mjs diff <beforeDir> <afterDir> … 差分を表示
 * 取るもの: title/description/canonical/robots、JSON-LD、見出し列(h1-h3)、内部リンク集合、
 *           画像src集合、可視テキスト(単語多重集合)。
 */
import fs from 'node:fs';
import path from 'node:path';

const URLS = [
  '/',
  '/article/sushiro-kids-menu',
  '/article/famires-kodzure-ranking-2026-10sen',
  '/article/kodzure-famires-15sen',
  '/spot/-l5nt',
  '/spot/-7bh1',
  '/today',
  '/today?station=ikebukuro&age=2-3&weather=sunny',
  '/events',
  '/category/today-doko',
  '/station/ikebukuro',
  '/spots',
  '/articles',
  '/ranking',
  '/tag/0-1sai',
  '/feature/free-spots',
  '/about',
  '/article/ohsho-kids-menu',
  '/article/hoshino-morning-kosodate',
  '/spot/ASOBono!-a463',
  // 第2弾（一覧・カテゴリ系）
  '/events',
  '/event/doraemon-friends-tokyo-2026',
  '/spots/park',
  '/spots/indoor',
  '/category/today-taberu',
  '/tag/amenohi',
  '/station/shinjuku',
  '/station/ueno',
  // 第3弾（特集・プラン）
  '/feature/autumn-kids',
  '/plan/m-asa-2-3-10m-free-01',
  '/plan/p-out-any-2-3-240m-low-01',
];

function decode(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ');
}
function strip(html) {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}
function extract(html) {
  const meta = (name) => {
    const m = html.match(new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]*content="([^"]*)"`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]*(?:name|property)="${name}"`, 'i'));
    return m ? decode(m[1]) : null;
  };
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] ?? null;
  const canonical = (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || [])[1] ?? null;
  const jsonld = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return m[1]; } });
  const headings = [...html.matchAll(/<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => `${m[1]}: ${strip(m[2])}`);
  const links = [...new Set([...html.matchAll(/href="(\/[^"#?][^"]*)"/g)].map((m) => decode(m[1])))].sort();
  const imgs = [...new Set([
    ...[...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/background-image:\s*url\(([^)]+)\)/g)].map((m) => m[1].replace(/['"]/g, '')),
  ])].sort();
  const body = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ');
  const text = strip(body);
  return { title, description: meta('description'), robots: meta('robots'), canonical, jsonld, headings, links, imgs, text };
}
function fname(u) { return u.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root'; }

async function snap(outDir, base = 'http://localhost:3000') {
  fs.mkdirSync(outDir, { recursive: true });
  for (const u of URLS) {
    const res = await fetch(base + u, { headers: { 'user-agent': 'Mozilla/5.0 renewal-snapshot' } });
    const html = await res.text();
    const data = { url: u, status: res.status, ...extract(html) };
    fs.writeFileSync(path.join(outDir, fname(u) + '.json'), JSON.stringify(data, null, 1));
    console.log(res.status, u, `h:${data.headings.length} links:${data.links.length} imgs:${data.imgs.length} text:${data.text.length}`);
  }
}
function words(t) { return t.split(/(?<=[。．！？!?])\s*|\s+/).filter(Boolean); }
function multisetDiff(a, b) {
  const m = new Map();
  for (const w of a) m.set(w, (m.get(w) || 0) + 1);
  for (const w of b) m.set(w, (m.get(w) || 0) - 1);
  const removed = [], added = [];
  for (const [w, n] of m) { if (n > 0) removed.push(...Array(n).fill(w)); if (n < 0) added.push(...Array(-n).fill(w)); }
  return { removed, added };
}
function diff(beforeDir, afterDir) {
  let problems = 0;
  for (const u of URLS) {
    const f = fname(u) + '.json';
    const a = JSON.parse(fs.readFileSync(path.join(beforeDir, f), 'utf8'));
    const b = JSON.parse(fs.readFileSync(path.join(afterDir, f), 'utf8'));
    const out = [];
    for (const k of ['status', 'title', 'description', 'robots', 'canonical']) if (a[k] !== b[k]) out.push(`  ${k}: ${JSON.stringify(a[k])} -> ${JSON.stringify(b[k])}`);
    if (JSON.stringify(a.jsonld) !== JSON.stringify(b.jsonld)) out.push('  JSON-LD changed');
    const ha = a.headings.join('\n'), hb = b.headings.join('\n');
    if (ha !== hb) {
      const la = new Set(a.headings), lb = new Set(b.headings);
      const rem = a.headings.filter((h) => !lb.has(h)), add = b.headings.filter((h) => !la.has(h));
      out.push(`  headings: -${rem.length} +${add.length}${a.headings.length === b.headings.length && !rem.length && !add.length ? ' (order changed)' : ''}`);
      rem.slice(0, 8).forEach((h) => out.push(`     - ${h}`));
      add.slice(0, 8).forEach((h) => out.push(`     + ${h}`));
    }
    const lostLinks = a.links.filter((l) => !b.links.includes(l));
    const newLinks = b.links.filter((l) => !a.links.includes(l));
    if (lostLinks.length || newLinks.length) {
      out.push(`  links: -${lostLinks.length} +${newLinks.length}`);
      lostLinks.slice(0, 15).forEach((l) => out.push(`     - ${l}`));
    }
    const lostImgs = a.imgs.filter((l) => !b.imgs.includes(l));
    if (lostImgs.length) { out.push(`  images lost: ${lostImgs.length}`); lostImgs.slice(0, 10).forEach((l) => out.push(`     - ${l}`)); }
    const { removed, added } = multisetDiff(words(a.text), words(b.text));
    if (removed.length || added.length) {
      out.push(`  text: -${removed.length} +${added.length} segments (before ${a.text.length} chars, after ${b.text.length})`);
      removed.slice(0, 25).forEach((w) => out.push(`     - ${w.slice(0, 80)}`));
      added.slice(0, 12).forEach((w) => out.push(`     + ${w.slice(0, 80)}`));
    }
    if (out.length) { problems++; console.log(`\n## ${u}`); console.log(out.join('\n')); } else console.log(`\n## ${u}\n  identical`);
  }
  console.log(`\n${problems} URL(s) differ`);
}
const [, , cmd, ...args] = process.argv;
if (cmd === 'snap') await snap(args[0], args[1]);
else if (cmd === 'diff') diff(args[0], args[1]);
else { console.log('usage: snap <outDir> [base] | diff <before> <after>'); process.exit(1); }
