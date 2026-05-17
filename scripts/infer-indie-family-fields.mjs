#!/usr/bin/env node
/**
 * 個人店データ（lib/indie-restaurants/chunk-*.ts）の各店舗に
 * 「子連れ目線」8項目を description + 既存フィールド + genre から推論で付与する。
 *
 * 設計方針:
 *   - description テキストに明示キーワードがあれば最優先で反映（"段差なし"→ stepFree=true）
 *   - 既存の strollerOk/kidsMenu/privateRoom/kidsChair/kidsSpace から二次推論
 *   - genre による一般傾向（イタリアン/中華は share 前提、カフェは段差少なめ等）
 *   - 確信度がない場合は undefined（過大表示を避ける = 「不明」のままにする）
 *   - 既に値が入っているフィールドは上書きしない（idempotent）
 *
 * 処理:
 *   各 chunk-*.ts を AST ではなく regex で書き換え（フォーマット維持のため）。
 *   オブジェクトリテラル内に対象キーがなければ priceLunch の前に挿入。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'lib', 'indie-restaurants');

// ジャンル別「取り分け文化が強い」ジャンル
const SHARE_GENRES = new Set([
  'italian', 'chinese', 'shabu', 'yakiniku', 'teppan', 'korean', 'asian', 'french',
]);
// ジャンル別「カウンター中心になりがちなジャンル」
const COUNTER_HEAVY = new Set(['sushi', 'tempura', 'noodles']);
// ジャンル別「座敷率が高い和食系ジャンル」
const ZASHIKI_LIKELY = new Set(['washoku', 'shabu', 'sushi', 'tempura', 'yakiniku']);
// ジャンル別「カフェ・洋系（段差・通路の制約は少なめ）」
const CASUAL_GENRES = new Set(['cafe', 'bakery', 'sweets', 'yoshoku', 'italian']);

/**
 * 単一店舗オブジェクトの「フィールド集合」を読み込み、推論結果を返す。
 * 既に値があるフィールドはそのまま返却。
 */
function inferOne(obj) {
  const d = obj.description || '';
  const genre = obj.genre;
  const result = {};

  // ---- stepFree ----
  if (obj.stepFree === undefined) {
    if (/段差なし|バリアフリー|スロープ|フラットフロア|段差はあり|段差はない|車椅子で/.test(d)) {
      result.stepFree = /段差はあり/.test(d) ? false : true;
    } else if (/地下|半地下|階段|2F|3F|ビル2階|ビル3階|2階に|3階に/.test(d)) {
      result.stepFree = false;
    } else if (obj.strollerOk === true && /広め|通路|広い|広々/.test(d)) {
      result.stepFree = true;
    } else if (CASUAL_GENRES.has(genre) && obj.strollerOk === true) {
      result.stepFree = true;
    }
    // それ以外は undefined
  }

  // ---- seatingType ----
  if (obj.seatingType === undefined) {
    const types = new Set();
    types.add('table'); // ほぼ全店にテーブルあり
    if (/座敷|小上がり|畳席|お座敷/.test(d)) types.add('zashiki');
    if (/カウンター/.test(d)) types.add('counter');
    if (/テラス|屋外席|オープン席|オープンエア/.test(d)) types.add('terrace');
    if (/ボックス席|半個室|仕切り席/.test(d)) types.add('box');
    // ジャンル推論
    if (ZASHIKI_LIKELY.has(genre) && obj.privateRoom === true) types.add('zashiki');
    if (COUNTER_HEAVY.has(genre)) types.add('counter');
    if (types.size > 0) {
      // table を必ず先頭にして安定ソート
      const order = ['table', 'box', 'counter', 'zashiki', 'terrace'];
      result.seatingType = order.filter((t) => types.has(t));
    }
  }

  // ---- diaperChangingTable ----
  if (obj.diaperChangingTable === undefined) {
    if (/おむつ替え|オムツ替え|多目的トイレ|ベビーシート/.test(d)) {
      result.diaperChangingTable = true;
    } else if (obj.kidsSpace === true) {
      result.diaperChangingTable = true;
    }
  }

  // ---- nursingRoom ----
  if (obj.nursingRoom === undefined) {
    if (/授乳室|授乳スペース|授乳ケープ/.test(d)) {
      result.nursingRoom = true;
    }
    // 個人店では基本ない。undefined のままが正しい
  }

  // ---- bringBabyFood ----
  if (obj.bringBabyFood === undefined) {
    if (/離乳食.*持ち込み|持ち込みOK|持参可|離乳食可/.test(d)) {
      result.bringBabyFood = true;
    } else if (obj.kidsMenu === true && obj.kidsChair === true) {
      result.bringBabyFood = true;
    } else if (/赤ちゃん|0歳|1歳/.test(d) && obj.strollerOk === true) {
      result.bringBabyFood = true;
    }
  }

  // ---- shareDish ----
  if (obj.shareDish === undefined) {
    if (/取り分け|シェア|取り皿|小皿|小盛り|半量/.test(d)) {
      result.shareDish = true;
    } else if (SHARE_GENRES.has(genre)) {
      result.shareDish = true;
    } else if (obj.kidsCutlery === true) {
      result.shareDish = true;
    }
  }

  // ---- strollerToSeat ----
  if (obj.strollerToSeat === undefined) {
    if (/ベビーカーで席まで|ベビーカー横付け|ベビーカー入店OK/.test(d)) {
      result.strollerToSeat = true;
    } else if (obj.strollerOk === true && !/階段|狭い|混雑|たたん/.test(d)) {
      if (result.stepFree === true || obj.privateRoom === true) {
        result.strollerToSeat = true;
      } else if (CASUAL_GENRES.has(genre)) {
        result.strollerToSeat = true;
      }
    }
  }

  // ---- allergenInfo ----
  if (obj.allergenInfo === undefined) {
    if (/アレルゲン|アレルギー対応|アレルギー表示/.test(d)) {
      result.allergenInfo = true;
    }
    // 個人店はほぼ false / undefined
  }

  // ---- kidsChair (新規・保守的) ----
  // description で明示されているか、kidsMenu + privateRoom があれば推論
  if (obj.kidsChair === undefined) {
    if (/キッズチェア|子供用椅子|子ども用椅子|お子様椅子|お子様用椅子|ハイチェア|ベビーチェア/.test(d)) {
      result.kidsChair = true;
    } else if (obj.kidsMenu === true && obj.kidsCutlery === true) {
      // キッズメニューもカトラリーもあるならチェアもある確度高
      result.kidsChair = true;
    } else if (obj.kidsSpace === true) {
      result.kidsChair = true;
    }
  }

  // ---- kidsMenu (新規・保守的) ----
  if (obj.kidsMenu === undefined) {
    if (/キッズメニュー|お子様メニュー|お子さまメニュー|お子様ランチ|キッズランチ|お子様プレート|キッズプレート/.test(d)) {
      result.kidsMenu = true;
    }
    // それ以外は推論しない（誤誘導リスク）
  }

  // ---- kidsCutlery (新規・保守的) ----
  if (obj.kidsCutlery === undefined) {
    if (/子供用カトラリー|子ども用カトラリー|お子様用フォーク|お子様用スプーン|キッズ用フォーク|プラスチックスプーン提供|取り皿用意/.test(d)) {
      result.kidsCutlery = true;
    } else if (obj.kidsMenu === true || result.kidsMenu === true) {
      // キッズメニューがあるならカトラリーも基本ある
      result.kidsCutlery = true;
    }
  }

  return result;
}

/**
 * 1個の店オブジェクト「{...}」テキストをパースして key->value マップを取得。
 * 値は boolean / string / array をサポート。
 */
function parseObjectFields(objText) {
  const fields = {};
  // 各行 "key: value," から抽出（簡易パーサ）
  const lineRe = /^\s*([a-zA-Z]+):\s*(.+?),?\s*$/gm;
  let m;
  while ((m = lineRe.exec(objText)) !== null) {
    const key = m[1];
    let v = m[2].trim();
    // 行末カンマを除去
    v = v.replace(/,\s*$/, '');
    if (v === 'true') fields[key] = true;
    else if (v === 'false') fields[key] = false;
    else if (v === 'undefined' || v === 'null') fields[key] = undefined;
    else if (v.startsWith("'") || v.startsWith('"')) fields[key] = v.slice(1, -1);
    else if (v.startsWith('[')) fields[key] = v; // 配列は文字列のまま
    else if (!isNaN(Number(v))) fields[key] = Number(v);
    else fields[key] = v;
  }
  return fields;
}

/**
 * オブジェクトテキストに新フィールドを priceLunch 直前に挿入する。
 * 既存キーは上書きしない。
 */
function injectFields(objText, newFields) {
  if (Object.keys(newFields).length === 0) return { text: objText, added: 0 };
  const lines = objText.split('\n');
  const priceIdx = lines.findIndex((l) => /^\s*priceLunch:/.test(l));
  if (priceIdx === -1) return { text: objText, added: 0 };
  const indentMatch = lines[priceIdx].match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : '      ';
  const extra = [];
  for (const [k, v] of Object.entries(newFields)) {
    let valStr;
    if (Array.isArray(v)) {
      valStr = `[${v.map((x) => `'${x}'`).join(', ')}]`;
    } else if (typeof v === 'boolean') {
      valStr = v.toString();
    } else if (typeof v === 'string') {
      valStr = `'${v}'`;
    } else {
      continue;
    }
    extra.push(`${indent}${k}: ${valStr},`);
  }
  lines.splice(priceIdx, 0, ...extra);
  return { text: lines.join('\n'), added: extra.length };
}

/**
 * chunk file 1つを処理。
 */
function processChunk(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  // 店舗オブジェクト一つを正規表現で取り出す（{ から対応する } まで非貪欲）
  // 各オブジェクトは "    {" で始まり "    }," で終わる
  const re = /(\s{4,6})\{\n([\s\S]*?)\n\1\},/g;
  let totalAdded = 0;
  let totalObjects = 0;
  const newSrc = src.replace(re, (match, indent, body) => {
    // body は { } の中身
    const fields = parseObjectFields(body);
    if (!fields.genre || !fields.priceLunch) return match; // 店舗オブジェクトでない可能性
    totalObjects++;
    const inferred = inferOne(fields);
    if (Object.keys(inferred).length === 0) return match;
    const { text, added } = injectFields(body, inferred);
    totalAdded += added;
    return `${indent}{\n${text}\n${indent}},`;
  });
  if (totalAdded > 0) {
    fs.writeFileSync(filePath, newSrc);
  }
  return { totalAdded, totalObjects };
}

// メイン
// chunk-NN.ts と chunk-NN[a-z].ts と chunk-kansai.ts を対象
const files = fs
  .readdirSync(DIR)
  .filter((f) => /^chunk-(\d+[a-z]?|kansai)\.ts$/.test(f))
  .sort();

let grandTotalObjs = 0;
let grandTotalAdded = 0;
for (const f of files) {
  const fp = path.join(DIR, f);
  const { totalAdded, totalObjects } = processChunk(fp);
  console.log(`  ${f}: ${totalObjects}店舗 / +${totalAdded}フィールド`);
  grandTotalObjs += totalObjects;
  grandTotalAdded += totalAdded;
}

console.log(`\n=== 完了 ===`);
console.log(`全店舗: ${grandTotalObjs}`);
console.log(`追加フィールド総数: ${grandTotalAdded}`);
console.log(`1店舗あたり平均: ${(grandTotalAdded / grandTotalObjs).toFixed(1)}項目`);
