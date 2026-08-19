#!/usr/bin/env node
/**
 * KID_REPORTS のキーが SPOTS 内のスポット name と一致しているか検証する。
 * 一致しないキーは「name 一致マージ」で添付されず、サイトに表示されない。
 */
import fs from 'node:fs';
import path from 'node:path';

const kr = fs.readFileSync('lib/kid-reports.ts', 'utf8');

// name の収集元は lib/spots.ts だけでは足りない。SPOTS には lib/spots-extra/ の
// 追加スポット（*.ts と admin 作成の *.json）がモジュール読み込み時にマージされるため、
// spots.ts だけ見ると「実際には表示されているのに未マッチ」と誤検知する（2026-08-19に踏んだ）。
const sources = ['lib/spots.ts'];
const extraDir = 'lib/spots-extra';
if (fs.existsSync(extraDir)) {
  for (const f of fs.readdirSync(extraDir)) {
    if (f.endsWith('.ts') || f.endsWith('.json')) sources.push(path.join(extraDir, f));
  }
}
const spots = sources.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

// KID_REPORTS のトップレベルキー（2スペースインデントの "  key: {" / "  'key': {"）
const keys = [...kr.matchAll(/^ {2}('([^']+)'|([^\s':]+)):\s*\{/gm)].map(
  (m) => m[2] ?? m[3],
);

// SPOTS 内の全 name を集める（.ts の name: '…' と .json の "name": "…" の両方）
const names = new Set([
  ...[...spots.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1]),
  ...[...spots.matchAll(/"name":\s*"((?:[^"\\]|\\.)*)"/g)].map((m) =>
    m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\'),
  ),
]);

let ok = 0;
const miss = [];
for (const k of keys) {
  if (names.has(k)) ok++;
  else miss.push(k);
}

console.log(`[check-kid-reports] KID_REPORTS キー ${keys.length}件を検証（name収集元 ${sources.length}ファイル）`);
console.log(`  マッチ: ${ok} / 未マッチ: ${miss.length}`);
if (miss.length > 0) {
  for (const m of miss) console.error(`  ✗ SPOTS に name が無い: "${m}"`);
  process.exit(1);
}
console.log('[check-kid-reports] ✓ 全キーが SPOTS の name と一致');
