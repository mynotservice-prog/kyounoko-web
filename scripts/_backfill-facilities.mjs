#!/usr/bin/env node
/**
 * Spot に `facilities` フィールドを後付けで足す一回限りスクリプト。
 *
 * 戦略:
 *   - `popular: true` のスポットだけ対象
 *   - カテゴリ別に「ほぼ確実にある設備」だけ yes に。残りは未指定（△表示）
 *   - 既に `facilities:` を持つスポットはスキップ
 *
 * 実装: 配列要素っぽい `{...}` を深さカウントで抽出 → 修正候補(start,end,newText)を貯めて
 *       後ろから適用。これにより index ずれを完全に回避できる。
 */
import fs from 'node:fs';

const FILES = ['lib/spots.ts', 'lib/spots-extra/batch-7.ts'];

const CATEGORY_FACILITIES = {
  zoo:        { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes' },
  aquarium:   { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes' },
  amusement:  { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes' },
  museum:     { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes' },
  indoor:     { bathroom: 'yes', diaperChange: 'yes', kidsSpace: 'yes' },
  park:       { bathroom: 'yes', diaperChange: 'yes' },
  farm:       { bathroom: 'yes', diaperChange: 'yes' },
};

function findSpotBlocks(raw) {
  const blocks = [];
  let i = 0;
  while (i < raw.length) {
    const openIdx = raw.indexOf('{', i);
    if (openIdx === -1) break;
    const prev = raw.slice(Math.max(0, openIdx - 30), openIdx);
    if (!/[\[,]\s*$/.test(prev)) {
      i = openIdx + 1;
      continue;
    }
    let depth = 1;
    let j = openIdx + 1;
    let inStr = null;
    while (j < raw.length && depth > 0) {
      const ch = raw[j];
      if (inStr) {
        if (ch === '\\') { j += 2; continue; }
        if (ch === inStr) inStr = null;
      } else if (ch === '"' || ch === "'" || ch === '`') {
        inStr = ch;
      } else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) break; }
      j++;
    }
    if (depth !== 0) break;
    blocks.push({ start: openIdx, end: j }); // raw[end] === '}'
    i = j + 1;
  }
  return blocks;
}

let totalModified = 0;
let totalScanned = 0;

for (const file of FILES) {
  if (!fs.existsSync(file)) continue;
  let raw = fs.readFileSync(file, 'utf8');
  const blocks = findSpotBlocks(raw);
  const edits = []; // {start, end, replacement}

  for (const { start, end } of blocks) {
    const block = raw.slice(start, end + 1);
    totalScanned++;
    const nameM = block.match(/\bname:\s*['"]([^'"]+)['"]/);
    const catM = block.match(/\bcategory:\s*['"]([^'"]+)['"]/);
    if (!nameM || !catM) continue;
    if (!/\bpopular:\s*true\b/.test(block)) continue;
    if (/\bfacilities\s*:/.test(block)) continue;
    const defaults = CATEGORY_FACILITIES[catM[1]];
    if (!defaults) continue;
    // インデント検出（最浅 key）
    const indentMatches = [...block.matchAll(/\n( +)\w+\s*:/g)];
    if (indentMatches.length === 0) continue;
    const indent = indentMatches
      .map((m) => m[1])
      .reduce((a, b) => (b.length < a.length ? b : a));
    // 閉じ `}` の直前のインデント
    const closeIndentMatch = block.match(/\n( *)\}\s*$/);
    const closeIndent = closeIndentMatch ? closeIndentMatch[1] : indent.slice(0, Math.max(0, indent.length - 2));

    // facilities テキスト
    const lines = [];
    lines.push(`${indent}facilities: {`);
    for (const [k, v] of Object.entries(defaults)) {
      lines.push(`${indent}  ${k}: '${v}',`);
    }
    lines.push(`${indent}},`);
    const facilitiesText = lines.join('\n');

    // block の最後の文字 `}` の手前 `\n<closeIndent>` を見つける
    // 例: "...,\n  }" の場合、`\n  ` の位置 = end - closeIndent.length - 1
    const insertPosInBlock = block.lastIndexOf('\n' + closeIndent + '}');
    if (insertPosInBlock < 0) continue;
    const absoluteInsertPos = start + insertPosInBlock; // ここから '\n<closeIndent>}' が始まる

    // 直前が `,` でなければカンマを補う必要がある
    const beforeChar = raw.slice(0, absoluteInsertPos).replace(/\s+$/, '').slice(-1);
    const needsComma = beforeChar !== ',' && beforeChar !== '{';

    const replacement = (needsComma ? ',' : '') + '\n' + facilitiesText;
    edits.push({ start: absoluteInsertPos, end: absoluteInsertPos, replacement });
  }
  // 後ろから適用
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) {
    raw = raw.slice(0, e.start) + e.replacement + raw.slice(e.end);
  }
  if (edits.length > 0) fs.writeFileSync(file, raw);
  console.log(`${file}: modified ${edits.length}`);
  totalModified += edits.length;
}

console.log(`---\nscanned: ${totalScanned}, modified: ${totalModified}`);
