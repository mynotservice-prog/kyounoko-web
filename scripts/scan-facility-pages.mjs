#!/usr/bin/env node
/**
 * 商業施設の公式サイトから「子連れ設備」の記載を一括で拾う。
 *
 *   node scripts/scan-facility-pages.mjs <targets.json> [--out=hits.tsv]
 *
 * targets.json は [{ name, url, paths?: string[] }] 。paths を省くと既定の候補パスを試す。
 *
 * なぜ script でやるか: 施設サイトはトップに設備を書かず、/service-guide のような下層に置く。
 * 1施設ずつ人が辿ると数十回のフェッチになるので、候補パスを機械で舐めてキーワード周辺だけ抜き、
 * **人はヒットしたものだけ読む**。判断（採用するか）は人がやる。機械は収集だけ。
 */
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
const outArg = process.argv.find((a) => a.startsWith('--out='));
const OUT = outArg ? outArg.split('=').slice(1).join('=') : '';
if (!file) { console.error('usage: node scripts/scan-facility-pages.mjs <targets.json> [--out=hits.tsv]'); process.exit(1); }

const DEFAULT_PATHS = [
  '', 'service/', 'services/', 'service-guide', 'facility/', 'facilities/', 'guide/',
  'floor/', 'floorguide/', 'information/', 'info/', 'about/service/', 'kids/', 'baby/',
  'babyroom/', 'mamababy/', 'papamama', 'mama_guide/', 'access/',
];

const KEYS = ['授乳室', '授乳', 'おむつ替え', 'おむつ交換', 'ベビーベッド', 'ベビーシート',
  'ベビーカー貸出', 'ベビーカーの貸出', 'ベビーカー貸し出し', 'ベビー休憩室', 'ベビールーム',
  'キッズスペース', '多目的トイレ', '多機能トイレ'];

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

function decode(buf, ct) {
  let cs = /charset=([\w-]+)/i.exec(ct || '')?.[1];
  if (!cs) {
    const head = new TextDecoder('utf-8', { fatal: false }).decode(buf.slice(0, 4096));
    cs = /charset=["']?([\w-]+)/i.exec(head)?.[1] || 'utf-8';
  }
  try { return new TextDecoder(cs.toLowerCase(), { fatal: false }).decode(buf); }
  catch { return new TextDecoder('utf-8', { fatal: false }).decode(buf); }
}

async function grab(u) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(u, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA, 'Accept-Language': 'ja' } });
    if (!r.ok) return null;
    const html = decode(Buffer.from(await r.arrayBuffer()), r.headers.get('content-type'));
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ');
    return { url: r.url, text };
  } catch { return null; }
  finally { clearTimeout(t); }
}

const targets = JSON.parse(readFileSync(file, 'utf8'));
const lines = ['name\turl\tkeyword\tsnippet'];
for (const t of targets) {
  const base = t.url.endsWith('/') ? t.url : t.url + '/';
  const paths = t.paths ?? DEFAULT_PATHS;
  const found = new Map();
  for (const p of paths) {
    const u = p.startsWith('http') ? p : base + p;
    const g = await grab(u);
    if (!g) continue;
    for (const k of KEYS) {
      let i = g.text.indexOf(k);
      if (i < 0) continue;
      const snip = g.text.slice(Math.max(0, i - 90), i + 130).trim();
      const key = k + '|' + snip.slice(0, 40);
      if (!found.has(key)) found.set(key, { url: g.url, k, snip });
    }
    if (found.size >= 8) break;
  }
  process.stderr.write(`\r  ${t.name} … ${found.size}件`);
  if (found.size === 0) {
    lines.push([t.name, '', '(記載を見つけられず)', ''].join('\t'));
    console.log(`\n■ ${t.name}\n   （候補パスから設備の記載を見つけられず）`);
    continue;
  }
  console.log(`\n■ ${t.name}`);
  for (const v of [...found.values()].slice(0, 6)) {
    console.log(`   [${v.k}] ${v.url}\n     …${v.snip}…`);
    lines.push([t.name, v.url, v.k, v.snip].join('\t'));
  }
}
process.stderr.write('\n');
if (OUT) { writeFileSync(OUT, lines.join('\n')); console.log(`\n書き出し: ${OUT}`); }
