#!/usr/bin/env node
/**
 * _add-plan-intro.mjs で導入文を追加した後、`## 見出し` の直前に空行が
 * 不足しているファイルを修復する。
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'content/plans';
let modified = 0;

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.md'))) {
  const fp = path.join(DIR, f);
  let raw = fs.readFileSync(fp, 'utf8');
  // `\n非空行\n## ` のパターンを `\n非空行\n\n## ` にする（既に空行があるなら触らない）
  const orig = raw;
  raw = raw.replace(/([^\n])\n(##[ \t])/g, '$1\n\n$2');
  // ###, ####も同様（よくH3も詰まる）
  raw = raw.replace(/([^\n])\n(###[ \t])/g, '$1\n\n$2');
  if (raw !== orig) {
    fs.writeFileSync(fp, raw);
    modified++;
  }
}

console.log(`fixed spacing in ${modified} files`);
