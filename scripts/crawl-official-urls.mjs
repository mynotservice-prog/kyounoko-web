#!/usr/bin/env node
/**
 * 収録済みの公式サイトURLを巡回し、閉店・改称・リンク切れを機械検出する。
 *
 *   node scripts/crawl-official-urls.mjs [--only=restaurant] [--out=report.tsv]
 *
 * 何を見るか:
 *  1. HTTP ステータス（404/410/DNS失敗 = 施設が消えた可能性）
 *  2. リダイレクト先のホスト/パス変化（統合・移転・改称のサイン。実際に
 *     IKEA港北が /stores/kohoku → /stores/yokohama に飛んで改称が判明した）
 *  3. 閉店を示す文言（「閉店しました」「閉館」「営業を終了」など）
 *  4. <title> が収録時から変わっていないか（lib/spot-official-urls.ts の行末コメントが
 *     収録時点のタイトル＝比較の基準）
 *
 * ※ここで出るのは**あくまで疑いのフラグ**。閉店の確定は人が公式で確認して
 *   lib/spot-closed.ts に理由つきで入れる。機械が勝手に閉店扱いにはしない。
 */
import { readFileSync, writeFileSync } from 'node:fs';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const OUT = arg('out', '');

// ── 収録データを読む（url と収録時タイトルの両方が要るのでソースを直接パースする）──
const src = readFileSync('lib/spot-official-urls.ts', 'utf8');
const entries = [];
for (const m of src.matchAll(/^\s*("(?:[^"\\]|\\.)*"):\s*("(?:[^"\\]|\\.)*"),\s*\/\/\s*(.*)$/gm)) {
  entries.push({ name: JSON.parse(m[1]), url: JSON.parse(m[2]), title0: m[3].trim() });
}
console.log(`巡回対象: ${entries.length}件`);

const CLOSED_PATTERNS = [
  '閉店しました', '閉店いたしました', '閉館しました', '閉館いたしました',
  '営業を終了', '営業終了しました', 'サービスを終了', '営業を休止',
  '閉店のお知らせ', '閉館のお知らせ', '移転しました', 'リニューアルのため休業',
];

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

function decode(buf, ct) {
  let cs = /charset=([\w-]+)/i.exec(ct || '')?.[1];
  if (!cs) {
    const head = new TextDecoder('utf-8', { fatal: false }).decode(buf.slice(0, 4096));
    cs = /charset=["']?([\w-]+)/i.exec(head)?.[1] || 'utf-8';
  }
  try {
    return new TextDecoder(cs.toLowerCase(), { fatal: false }).decode(buf);
  } catch {
    return new TextDecoder('utf-8', { fatal: false }).decode(buf);
  }
}

async function crawl(e) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(e.url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept-Language': 'ja,en;q=0.8' },
    });
    const buf = Buffer.from(await r.arrayBuffer());
    const html = decode(buf, r.headers.get('content-type'));
    const title = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 110);
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
    const hits = CLOSED_PATTERNS.filter((p) => text.includes(p));
    return { status: r.status, finalUrl: r.url, title, hits };
  } catch (err) {
    return { status: 0, finalUrl: '', title: '', hits: [], error: err.name === 'AbortError' ? 'timeout' : err.message };
  } finally {
    clearTimeout(t);
  }
}

const results = [];
let i = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (i < entries.length) {
      const idx = i++;
      const r = await crawl(entries[idx]);
      results[idx] = { ...entries[idx], ...r };
      process.stderr.write(`\r  巡回 ${results.filter(Boolean).length}/${entries.length}`);
    }
  }),
);
process.stderr.write('\n');

const norm = (u) => (u || '').replace(/\/$/, '');
const flagged = [];
for (const r of results) {
  const flags = [];
  if (r.status === 0) flags.push(`取得失敗(${r.error})`);
  else if (r.status >= 400) flags.push(`HTTP${r.status}`);
  // ※チェーン公式・商業施設公式は「個店の閉店告知」を常時載せているため、この文言単体では
  //   ブランド全体の閉店を意味しない（2026-08-11 に華屋与兵衛で確認＝相模原小山店の告知だった）。
  //   優先度の低い「要目視」フラグとして扱う。
  if (r.hits.length) flags.push(`閉店文言(要目視・個店告知の可能性):${r.hits.join('/')}`);
  if (r.finalUrl && norm(r.finalUrl) !== norm(r.url)) flags.push(`転送→${r.finalUrl}`);
  if (r.status >= 200 && r.status < 300 && r.title && r.title0 && r.title !== r.title0) {
    flags.push(`タイトル変化「${r.title0}」→「${r.title}」`);
  }
  if (flags.length) flagged.push({ ...r, flags });
}

console.log(`\n\x1b[1m要確認 ${flagged.length}件 / ${results.length}件\x1b[0m\n`);
for (const f of flagged) {
  console.log(`■ ${f.name}`);
  console.log(`   ${f.url}`);
  for (const fl of f.flags) console.log(`   - ${fl}`);
}

if (OUT) {
  const lines = ['name\turl\tstatus\tfinalUrl\ttitle\tflags'];
  for (const r of results) {
    const fl = flagged.find((x) => x.name === r.name)?.flags.join(' | ') ?? '';
    lines.push([r.name, r.url, r.status, r.finalUrl, r.title, fl].join('\t'));
  }
  writeFileSync(OUT, lines.join('\n'));
  console.log(`\n書き出し: ${OUT}`);
}
