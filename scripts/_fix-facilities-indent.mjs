#!/usr/bin/env node
/**
 * _backfill-facilities.mjs で挿入した facilities ブロックのインデント不整合を整える。
 * パターン: `      facilities: {` の次行から `              bathroom: 'yes',` のように
 * インデントが過剰になっているのを 8 スペースに揃える。
 */
import fs from 'node:fs';

const FILES = ['lib/spots.ts', 'lib/spots-extra/batch-7.ts'];
let total = 0;

for (const file of FILES) {
  let raw = fs.readFileSync(file, 'utf8');
  // 連続した正規化を一度に行う
  const re = /(\n)( *)(facilities:\s*\{)([\s\S]*?)\n\2\},/g;
  raw = raw.replace(re, (m, nl, indent, head, inner) => {
    const innerLines = inner.split('\n').filter((l) => l.trim().length > 0);
    const normalized = innerLines.map((l) => indent + '  ' + l.trim()).join('\n');
    total++;
    return `${nl}${indent}${head}\n${normalized}\n${indent}},`;
  });
  fs.writeFileSync(file, raw);
}

console.log(`indent fixed: ${total} facilities blocks`);
