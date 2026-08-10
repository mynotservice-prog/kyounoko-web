#!/usr/bin/env node
/**
 * 公式サイトURL候補を実際に叩いて検証する。
 *
 * なぜ検証まで機械でやるか: 誤った公式リンクは「未設定」より悪い（別の施設へ送客する）。
 * URLを当てた時点では候補にすぎないので、**必ず取得して素性を確かめてから**採用する。
 *
 *   node scripts/verify-official-urls.mjs <candidates.json> [--out=result.tsv]
 *
 * candidates.json は { "スポット名": "https://…" } の形。
 * 出力は TSV: name / url / status / finalUrl / title。
 * タイトルが施設と対応しているかの最終判断は人がやる（機械の文字列一致は日本語で誤る）。
 */
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/verify-official-urls.mjs <candidates.json> [--out=result.tsv]');
  process.exit(1);
}
const outArg = process.argv.find((a) => a.startsWith('--out='));
const OUT = outArg ? outArg.split('=').slice(1).join('=') : '';

const candidates = JSON.parse(readFileSync(file, 'utf8'));
const entries = Object.entries(candidates);

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

/** <title> を取り出す。文字コードは Content-Type / meta charset を見て決める。 */
function decodeBody(buf, contentType) {
  let charset = /charset=([\w-]+)/i.exec(contentType || '')?.[1];
  if (!charset) {
    const head = new TextDecoder('utf-8', { fatal: false }).decode(buf.slice(0, 4096));
    charset = /charset=["']?([\w-]+)/i.exec(head)?.[1] || 'utf-8';
  }
  try {
    return new TextDecoder(charset.toLowerCase(), { fatal: false }).decode(buf);
  } catch {
    return new TextDecoder('utf-8', { fatal: false }).decode(buf);
  }
}

async function check(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept-Language': 'ja,en;q=0.8' },
    });
    const buf = Buffer.from(await r.arrayBuffer());
    const html = decodeBody(buf, r.headers.get('content-type'));
    const title = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 110);
    return { status: r.status, finalUrl: r.url, title };
  } catch (e) {
    return { status: 0, finalUrl: '', title: `ERROR: ${e.name === 'AbortError' ? 'timeout' : e.message}` };
  } finally {
    clearTimeout(timer);
  }
}

const CONCURRENCY = 6;
const results = [];
let i = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (i < entries.length) {
      const idx = i++;
      const [name, url] = entries[idx];
      const r = await check(url);
      results[idx] = { name, url, ...r };
      process.stderr.write(`\r  検証 ${results.filter(Boolean).length}/${entries.length}`);
    }
  }),
);
process.stderr.write('\n');

const lines = ['name\turl\tstatus\tfinalUrl\ttitle'];
for (const r of results) {
  lines.push([r.name, r.url, r.status, r.finalUrl, r.title].join('\t'));
}
const tsv = lines.join('\n');
if (OUT) {
  writeFileSync(OUT, tsv);
  console.log(`書き出し: ${OUT}`);
}

const ok = results.filter((r) => r.status >= 200 && r.status < 300).length;
const redirected = results.filter((r) => r.finalUrl && r.finalUrl !== r.url).length;
const bad = results.filter((r) => r.status === 0 || r.status >= 400);
console.log(`\n取得成功 ${ok}/${results.length}　うちリダイレクトあり ${redirected}件`);
if (bad.length) {
  console.log(`\n\x1b[1m要修正（${bad.length}件）\x1b[0m`);
  for (const r of bad) console.log(`  ${String(r.status).padStart(3)}  ${r.name}  ${r.url}  ${r.title}`);
}
if (!OUT) {
  console.log(`\n\x1b[1m取得できたもの\x1b[0m`);
  for (const r of results.filter((x) => x.status >= 200 && x.status < 300)) {
    console.log(`  ${r.name}\n      ${r.finalUrl}\n      ${r.title}`);
  }
}
