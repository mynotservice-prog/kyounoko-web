#!/usr/bin/env node
/**
 * KID_REPORTS のキーが SPOTS 内のスポット name と一致しているか検証する。
 * 一致しないキーは「name 一致マージ」で添付されず、サイトに表示されない。
 */
import fs from 'node:fs';

const kr = fs.readFileSync('lib/kid-reports.ts', 'utf8');
const spots = fs.readFileSync('lib/spots.ts', 'utf8');

// KID_REPORTS のトップレベルキー（2スペースインデントの "  key: {" / "  'key': {"）
const keys = [...kr.matchAll(/^ {2}('([^']+)'|([^\s':]+)):\s*\{/gm)].map(
  (m) => m[2] ?? m[3],
);

// SPOTS 内の全 name を集める
const names = new Set(
  [...spots.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1]),
);

let ok = 0;
const miss = [];
for (const k of keys) {
  if (names.has(k)) ok++;
  else miss.push(k);
}

console.log(`[check-kid-reports] KID_REPORTS キー ${keys.length}件を検証`);
console.log(`  マッチ: ${ok} / 未マッチ: ${miss.length}`);
if (miss.length > 0) {
  for (const m of miss) console.error(`  ✗ SPOTS に name が無い: "${m}"`);
  process.exit(1);
}
console.log('[check-kid-reports] ✓ 全キーが SPOTS の name と一致');
