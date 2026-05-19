#!/usr/bin/env node
/**
 * 全プランの「持ち物」セクションから入園料・予約系の行を取り出し、
 * 「入園料・予約」セクションを「持ち物」セクションの直前に挿入する一回限りのマイグレ。
 *
 * 検出ルール: 「入園料」「予約」「チケット」「料金」「入場料」を含む箇条書き行。
 * 既に「## 入園料・予約」セクションがある場合はスキップ。
 *
 * 使い方: node scripts/_split-ticket-info.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'content/plans';
let modified = 0;
let scanned = 0;

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.md'))) {
  scanned++;
  const fp = path.join(DIR, f);
  let raw = fs.readFileSync(fp, 'utf8');
  if (/(^|\n)## 入園料・予約/.test(raw)) continue;
  // 「## 持ち物」セクションの本文（次のH2が来るまで or 末尾まで）を捕捉
  // m フラグなしで全文サーチ。$ はファイル末尾。
  const mochiMatch = raw.match(/(^|\n)(## 持ち物[ \t]*\n)([\s\S]*?)(?=\n## |$)/);
  if (!mochiMatch) continue;
  const mochiPrefix = mochiMatch[1]; // 直前の改行 or 空
  const mochiHeader = mochiMatch[2]; // "## 持ち物\n"
  const mochiBody = mochiMatch[3];
  const ticketLines = mochiBody
    .split('\n')
    .filter((l) => /^\s*[-*]\s+.*(入園料|予約|チケット|料金|入場料)/i.test(l));
  if (ticketLines.length === 0) continue;

  const ticketSection =
    '## 入園料・予約\n\n' +
    ticketLines.map((l) => l.replace(/^\s*[-*]\s+/, '- ')).join('\n') +
    '\n\n> 最新情報は各施設の公式サイトで必ずご確認ください。チケットは事前予約で混雑回避できる施設が多いです。\n\n';

  let newMochiBody = mochiBody;
  for (const l of ticketLines) newMochiBody = newMochiBody.replace(l + '\n', '');

  raw = raw.replace(
    /(^|\n)(## 持ち物[ \t]*\n)([\s\S]*?)(?=\n## |$)/,
    mochiPrefix + ticketSection + mochiHeader + newMochiBody,
  );
  fs.writeFileSync(fp, raw);
  modified++;
}

console.log(`scanned: ${scanned} / modified: ${modified}`);
