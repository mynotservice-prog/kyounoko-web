#!/usr/bin/env node
/**
 * 既存SPOTS(park)にplaygroundFeatures 配列を推論で付与。
 * name + note のキーワードからマッチ。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/sessions/modest-keen-fermat/mnt/kyounoko-web';
const files = [
  path.join(ROOT, 'lib/spots.ts'),
  ...fs.readdirSync(path.join(ROOT, 'lib/spots-extra'))
    .filter((f) => /^batch-\d+\.ts$/.test(f))
    .map((f) => path.join(ROOT, 'lib/spots-extra', f)),
];

const RULES = [
  { feature: 'long-slide', re: /ロングすべり|ロング滑り|ローラーすべり|ローラー滑り|長.{0,3}すべり|長.{0,3}滑り|巨大すべり|巨大滑り|アクアアイランド/ },
  { feature: 'large-slide', re: /大型滑り|大型すべり|ジャンボ滑り|ジャンボすべり|大すべり/ },
  { feature: 'fuwafuwa', re: /ふわふわ|エアトランポリン|エアドーム|空気で膨らむ/ },
  { feature: 'athletic', re: /アスレチック|複合遊具|大型遊具|フィールドアスレチック/ },
  { feature: 'tarzan', re: /ターザン|ジップライン/ },
  { feature: 'climbing', re: /クライミング|ボルダリング|岩登り/ },
  { feature: 'spider-net', re: /クモの巣|ネット遊具|ロープジム|くもの巣/ },
  { feature: 'swing', re: /ブランコ|大型ブランコ/ },
  { feature: 'sandbox', re: /砂場/ },
  { feature: 'bbq', re: /BBQ|バーベキュー/ },
  { feature: 'cycling', re: /サイクリング|レンタサイクル/ },
  { feature: 'mini-train', re: /パークトレイン|ミニ電車|D51|蒸気機関車展示/ },
];

function processFile(fp) {
  let src = fs.readFileSync(fp, 'utf-8');
  let added = 0;

  const result = [];
  let i = 0;
  while (i < src.length) {
    let openIdx = src.indexOf('{', i);
    if (openIdx === -1) { result.push(src.slice(i)); break; }
    const after = src.slice(openIdx + 1, openIdx + 30);
    if (!/^\s+name:\s*'/.test(after)) {
      result.push(src.slice(i, openIdx + 1));
      i = openIdx + 1;
      continue;
    }
    result.push(src.slice(i, openIdx));
    // depth-balance parse
    let depth = 0, j = openIdx, inStr = false, strCh = '';
    while (j < src.length) {
      const c = src[j];
      const prev = j > 0 ? src[j - 1] : '';
      if (inStr) { if (c === strCh && prev !== '\\') inStr = false; }
      else {
        if (c === "'" || c === '"') { inStr = true; strCh = c; }
        else if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { j++; break; } }
      }
      j++;
    }
    const objText = src.slice(openIdx, j);
    const hasCat = /category:\s*'park'/.exec(objText);
    if (!hasCat) { result.push(objText); i = j; continue; }
    if (/playgroundFeatures:/.test(objText)) { result.push(objText); i = j; continue; }
    const name = (/name:\s*'([^']+)'/.exec(objText) || [])[1] || '';
    const note = (/note:\s*'([^']+)'/.exec(objText) || [])[1] || '';
    const text = name + ' ' + note;
    const found = [];
    for (const { feature, re } of RULES) {
      if (re.test(text)) found.push(feature);
    }
    if (found.length === 0) { result.push(objText); i = j; continue; }
    const arrStr = `[${found.map((f) => `'${f}'`).join(', ')}]`;
    const newObj = objText.replace(/(\s*)\}$/, `,\n      playgroundFeatures: ${arrStr},$1}`);
    result.push(newObj);
    added++;
    i = j;
  }

  // double-comma fix safety net
  let newSrc = result.join('');
  newSrc = newSrc.replace(/,,\s*\n/g, ',\n');
  newSrc = newSrc.replace(/,(\s*),/g, ',$1');
  if (newSrc !== src) fs.writeFileSync(fp, newSrc);
  return added;
}

let total = 0;
for (const fp of files) {
  const a = processFile(fp);
  console.log(`${path.basename(fp)}: +${a} park spots tagged`);
  total += a;
}
console.log(`\n=== 完了: ${total} parkスポットにplaygroundFeatures付与 ===`);
