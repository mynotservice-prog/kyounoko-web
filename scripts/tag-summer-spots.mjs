#!/usr/bin/env node
/**
 * 既存SPOTSにsummerCool / waterPlay フラグを推論で付与。
 * 上書きはしない（既に値が入ってるものは温存）。
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

function processFile(fp) {
  let src = fs.readFileSync(fp, 'utf-8');
  let summerCoolAdded = 0;
  let waterPlayAdded = 0;

  const result = [];
  let i = 0;
  while (i < src.length) {
    // "{" 単独行+次に "name:" を探す
    let openIdx = src.indexOf('{', i);
    if (openIdx === -1) { result.push(src.slice(i)); break; }

    // openIdx の後ろに最初の "name: '" が早く来るか確認 (空白/改行のみ挟む)
    const after = src.slice(openIdx + 1, openIdx + 30);
    if (!/^\s+name:\s*'/.test(after)) {
      // この { はスポットオブジェクトではない (pricing: {...} 等)
      result.push(src.slice(i, openIdx + 1));
      i = openIdx + 1;
      continue;
    }

    // i から openIdx までは出力
    result.push(src.slice(i, openIdx));

    // { から対応する } を探す (depthで)
    let depth = 0;
    let j = openIdx;
    let inStr = false;
    let strCh = '';
    while (j < src.length) {
      const c = src[j];
      const prev = j > 0 ? src[j - 1] : '';
      if (inStr) {
        if (c === strCh && prev !== '\\') inStr = false;
      } else {
        if (c === "'" || c === '"') { inStr = true; strCh = c; }
        else if (c === '{') depth++;
        else if (c === '}') {
          depth--;
          if (depth === 0) { j++; break; }
        }
      }
      j++;
    }
    const objText = src.slice(openIdx, j);
    const hasName = /name: '([^']+)'/.exec(objText);
    const hasCategory = /category: '([^']+)'/.exec(objText);
    const hasPlace = /place: '([^']+)'/.exec(objText);
    const hasNote = /note: '([^']+)'/.exec(objText);
    if (!hasName || !hasCategory) { result.push(objText); i = j; continue; }
    const name = hasName[1];
    const category = hasCategory[1];
    const place = hasPlace ? hasPlace[1] : '';
    const note = hasNote ? hasNote[1] : '';
    const text = name + ' ' + note;

    let newObj = objText;
    if (!/summerCool: /.test(objText)) {
      let needSummerCool = false;
      if (['aquarium', 'museum'].includes(category)) needSummerCool = true;
      else if (category === 'indoor') needSummerCool = true;
      else if (place === 'indoor') needSummerCool = true;
      if (needSummerCool) {
        newObj = newObj.replace(/(\s*)\}$/, `,\n      summerCool: true,$1}`);
        summerCoolAdded++;
      }
    }
    if (!/waterPlay: /.test(newObj)) {
      let needWater = false;
      if (/プール|水遊び|じゃぶじゃぶ|水場|噴水|ウォーター|タッチプール|ビーチ|海水浴|川遊び|ウォーターパーク|水鉄砲/.test(text)) needWater = true;
      else if (category === 'aquarium') needWater = true;
      if (needWater) {
        newObj = newObj.replace(/(\s*)\}$/, `,\n      waterPlay: true,$1}`);
        waterPlayAdded++;
      }
    }
    result.push(newObj);
    i = j;
  }

  const newSrc = result.join('');
  if (newSrc !== src) fs.writeFileSync(fp, newSrc);
  return { summerCoolAdded, waterPlayAdded };
}

let totalSummer = 0, totalWater = 0;
for (const fp of files) {
  const r = processFile(fp);
  console.log(`${path.basename(fp)}: summerCool=+${r.summerCoolAdded}, waterPlay=+${r.waterPlayAdded}`);
  totalSummer += r.summerCoolAdded;
  totalWater += r.waterPlayAdded;
}
console.log(`\n=== 完了 ===\nsummerCool +${totalSummer}\nwaterPlay +${totalWater}`);
