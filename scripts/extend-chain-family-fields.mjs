#!/usr/bin/env node
/**
 * lib/station-restaurants.ts の CHAINS 配列に「子連れ目線」8項目を一括追加する
 * 一回限りのマイグレーションスクリプト。
 *
 * 追加するフィールド:
 *   - stepFree: 入口に段差なし（ベビーカーそのまま入店可）
 *   - seatingType: 席タイプの組合せ（box/table/counter/zashiki/terrace）
 *   - diaperChangingTable: おむつ替え台あり
 *   - nursingRoom: 授乳室・授乳スペースあり
 *   - bringBabyFood: 離乳食持ち込みOK
 *   - shareDish: 取り分け前提のメニュー（小皿うどんなど）
 *   - strollerToSeat: ベビーカーで席まで（たたまずに済む）
 *   - allergenInfo: アレルゲン表示あり
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'lib', 'station-restaurants.ts');

/**
 * 各チェーンの8項目データ。
 * 公開情報・公式FAQ・店舗仕様の一般傾向から保守的に判定。
 * 「店舗による差が大きい」場合は false（=情報なし）として、過大表示を避ける。
 */
const FAMILY_FIELDS = {
  saizeriya:        { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  gusto:            { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  jonathan:         { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  'denny-s':        { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  'royal-host':     { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  cocos:            { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  bamiyan:          { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  starbucks:        { stepFree: true,  seatingType: ['table','counter','terrace'],    diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: false, strollerToSeat: true,  allergenInfo: false },
  'tully-coffee':   { stepFree: true,  seatingType: ['table','counter','terrace'],    diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: false, strollerToSeat: true,  allergenInfo: false },
  doutor:           { stepFree: false, seatingType: ['table','counter'],              diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: false, strollerToSeat: false, allergenInfo: false },
  komeda:           { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  excelsior:        { stepFree: false, seatingType: ['table','counter'],              diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: false, strollerToSeat: false, allergenInfo: false },
  mcdonalds:        { stepFree: true,  seatingType: ['box','table','counter'],        diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  'mos-burger':     { stepFree: true,  seatingType: ['table','counter','box'],        diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  kfc:              { stepFree: true,  seatingType: ['table','counter'],              diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  lotteria:         { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  subway:           { stepFree: false, seatingType: ['table','counter','box'],        diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: false, allergenInfo: true  },
  yoshinoya:        { stepFree: false, seatingType: ['counter','table'],              diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: false, strollerToSeat: false, allergenInfo: true  },
  matsuya:          { stepFree: false, seatingType: ['counter','table'],              diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: false, strollerToSeat: false, allergenInfo: true  },
  sukiya:           { stepFree: true,  seatingType: ['box','table','counter'],        diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  cocoichi:         { stepFree: false, seatingType: ['box','table'],                  diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: false, allergenInfo: true  },
  ootoya:           { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  yayoiken:         { stepFree: false, seatingType: ['counter','table','box'],        diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: false, allergenInfo: true  },
  ohsho:            { stepFree: false, seatingType: ['table','counter'],              diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: false, allergenInfo: true  },
  sushiro:          { stepFree: true,  seatingType: ['box','table','counter'],        diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  'kura-sushi':     { stepFree: true,  seatingType: ['box','table','counter'],        diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  'hama-sushi':     { stepFree: true,  seatingType: ['box','table','counter'],        diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  ichiban:          { stepFree: true,  seatingType: ['box','table','zashiki'],        diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  marugame:         { stepFree: true,  seatingType: ['table','counter'],              diaperChangingTable: false, nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  gyukaku:          { stepFree: true,  seatingType: ['box','table','zashiki'],        diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  'shabu-yo':       { stepFree: true,  seatingType: ['box','table'],                  diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  'ikea-restaurant':{ stepFree: true,  seatingType: ['table'],                        diaperChangingTable: true,  nursingRoom: true,  bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
  'costco-food':    { stepFree: true,  seatingType: ['counter','table','terrace'],    diaperChangingTable: true,  nursingRoom: false, bringBabyFood: true,  shareDish: true,  strollerToSeat: true,  allergenInfo: true  },
};

const src = fs.readFileSync(FILE, 'utf8');

// 各 slug ブロックの直前にある "lunchPrice:" 行の上に8項目を挿入する
// 既に "stepFree:" が存在するブロックはスキップ（再実行安全）
let out = src;
let touched = 0;
for (const [slug, fields] of Object.entries(FAMILY_FIELDS)) {
  // ブロック検出: slug: '<slug>' で始まり、次の "  }," までを1チャンクとして処理
  const slugLine = `slug: '${slug}',`;
  const idx = out.indexOf(slugLine);
  if (idx === -1) {
    console.warn(`⚠ slug not found: ${slug}`);
    continue;
  }
  // このブロックの終端 "  },\n" を探す
  const end = out.indexOf('\n  },\n', idx);
  if (end === -1) {
    console.warn(`⚠ block end not found: ${slug}`);
    continue;
  }
  const block = out.slice(idx, end);
  if (block.includes('stepFree:')) {
    // 既に追加済み → スキップ
    continue;
  }
  // lunchPrice: 行を見つけて、その直前に挿入
  const lpIdx = block.indexOf('lunchPrice:');
  if (lpIdx === -1) continue;
  const lpAbs = idx + lpIdx;
  // 行頭インデント揃え
  const indent = '    ';
  const extra = [
    `${indent}stepFree: ${fields.stepFree},`,
    `${indent}seatingType: [${fields.seatingType.map((s) => `'${s}'`).join(', ')}],`,
    `${indent}diaperChangingTable: ${fields.diaperChangingTable},`,
    `${indent}nursingRoom: ${fields.nursingRoom},`,
    `${indent}bringBabyFood: ${fields.bringBabyFood},`,
    `${indent}shareDish: ${fields.shareDish},`,
    `${indent}strollerToSeat: ${fields.strollerToSeat},`,
    `${indent}allergenInfo: ${fields.allergenInfo},`,
    '', // trailing newline before lunchPrice
  ].join('\n');
  out = out.slice(0, lpAbs) + extra + indent + out.slice(lpAbs + indent.length);
  touched++;
}

fs.writeFileSync(FILE, out);
console.log(`✓ ${touched}/${Object.keys(FAMILY_FIELDS).length} chains updated`);
