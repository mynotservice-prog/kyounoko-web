#!/usr/bin/env node
/**
 * 個人店データ（lib/indie-restaurants/chunk-*.ts）の各店舗のうち、
 * 商業施設（モール・百貨店・駅ナカ）テナントを自動識別して
 *   - nursingRoom: true
 *   - diaperChangingTable: true
 * を一括付与する（未設定の店舗のみ）。
 *
 * 設計方針:
 *   - area / description に MALL_KEYWORDS が含まれれば「館内テナント」とみなす
 *   - ただし「近く」「周辺」「前」など"近接"を示す表現が同居する場合はスキップ
 *     → 館内に入っているテナントだけが共用授乳室・おむつ替え台を享受できる
 *   - 既に true/false が明示されているフィールドは絶対に上書きしない（idempotent）
 *   - allergenInfo 等の他フィールドは触らない
 *
 * 実装:
 *   AST ではなく行ベースの regex で書き換え（フォーマット維持）。
 *   既存の scripts/infer-indie-family-fields.mjs と同じ手法を踏襲。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'lib', 'indie-restaurants');

// ===========================================================================
// 対象施設キーワード
//  - 「館内テナント」と判定できる確度の高い名称のみを採用
//  - 単独語で曖昧になりやすいもの（"丸ビル" の "ビル"、"イオン" 等）は除外
//  - 個別の館名（伊勢丹新宿/玉川高島屋 等）は親キーワード（伊勢丹/高島屋）で吸収
// ===========================================================================
const MALL_KEYWORDS = [
  // 百貨店
  '伊勢丹',
  '三越',
  '高島屋',
  '松屋銀座',
  '大丸',
  'そごう',
  '西武池袋',
  '西武渋谷',
  '東急百貨店',
  '東急本店',
  '京王百貨店',
  '小田急百貨店',
  // 駅ビル
  'ルミネ',
  'LUMINE',
  'アトレ',
  'atre',
  'エキュート',
  'ecute',
  'グランデュオ',
  'アトレヴィ',
  'ニュウマン',
  'NEWoMan',
  'NEWoMan',
  'KITTE',
  'マルイ',
  '0101',
  'OIOI',
  // 大型商業施設
  '六本木ヒルズ',
  '東京ミッドタウン',
  '麻布台ヒルズ',
  '表参道ヒルズ',
  '渋谷ヒカリエ',
  '渋谷スクランブルスクエア',
  'スクランブルスクエア',
  'GINZA SIX',
  '銀座シックス',
  '二子玉川ライズ',
  '玉川高島屋',
  'アクアシティ',
  'ダイバーシティ',
  'ヴィーナスフォート',
  'ららぽーと',
  'IKEA',
  'イオンモール',
  'パルコ',
  'PARCO',
  'ラフォーレ原宿',
  '東急プラザ',
  '丸ビル',
  '新丸ビル',
  '新丸の内ビルディング',
  '丸の内ビルディング',
  'KITTE丸の内',
  '大丸東京',
  '東京駅一番街',
  '虎ノ門ヒルズ',
  'アークヒルズ',
  // ホテル系（高級ホテル内レストラン）
  'リッツ・カールトン',
  'リッツカールトン',
  'ペニンシュラ',
  'マンダリンオリエンタル',
  'マンダリン オリエンタル',
  'パークハイアット',
  'グランドハイアット',
  'ハイアット セントリック',
  'ホテルニューオータニ',
  'ニューオータニ',
  '帝国ホテル',
  'ANAインターコンチネンタル',
  'ANA インターコンチネンタル',
  'インターコンチネンタル',
];

// 「館内テナントではない」ことを示す表現（同居していたらスキップ）
const NEAR_BY_PATTERNS = [
  /近く/,
  /周辺/,
  /向かい/,
];

// キーワード別の"これが直後に続くと違う意味になる"接尾語ブラックリスト
// （例: 三越前駅・三越前は地名/駅名なので館内テナントではない）
const KEYWORD_SUFFIX_BLACKLIST = {
  三越: ['前駅', '前から', '前まで', '前を', '前 ', '前)', '前）', '前。', '前、', '前駅'],
  // 大丸は "大丸有" 表記が無いことを確認済み（追加不要）
  // その他のキーワードは現状の検出窓で十分
};

/**
 * 単一テキスト内で kw の全出現位置を探し、いずれかが
 *   - 「近く/周辺/向かい」窓に同居しない
 *   - 接尾ブラックリストに該当しない
 * を満たせば「館内テナント」と判定。
 */
function findValidOccurrence(text, kw) {
  const blacklist = KEYWORD_SUFFIX_BLACKLIST[kw] || [];
  let from = 0;
  while (from <= text.length) {
    const idx = text.indexOf(kw, from);
    if (idx === -1) return false;
    const afterStart = idx + kw.length;
    const after = text.slice(afterStart, afterStart + 5);
    // 接尾ブラックリストチェック
    const blocked = blacklist.some((suf) => after.startsWith(suf));
    if (!blocked) {
      // 近接表現窓チェック
      const window = text.slice(Math.max(0, idx - 5), afterStart + 15);
      const nearby = NEAR_BY_PATTERNS.some((re) => re.test(window));
      if (!nearby) return true;
    }
    from = idx + 1;
  }
  return false;
}

/**
 * area / description のいずれかに MALL_KEYWORDS のどれかが館内テナントとして含まれているか判定。
 * マッチした施設キーワードを返す。
 */
function detectMall(area, description) {
  const texts = [area || '', description || ''];
  for (const kw of MALL_KEYWORDS) {
    for (const t of texts) {
      if (!t.includes(kw)) continue;
      if (findValidOccurrence(t, kw)) return kw;
    }
  }
  return null;
}

/**
 * オブジェクトテキストから簡易フィールドパース。
 * - boolean / string のみ判定すれば足りる。
 */
function parseObjectFields(objText) {
  const fields = {};
  const lineRe = /^\s*([a-zA-Z]+):\s*(.+?),?\s*$/gm;
  let m;
  while ((m = lineRe.exec(objText)) !== null) {
    const key = m[1];
    let v = m[2].trim().replace(/,\s*$/, '');
    if (v === 'true') fields[key] = true;
    else if (v === 'false') fields[key] = false;
    else if (v.startsWith("'") || v.startsWith('"')) {
      // シングルクォート/ダブルクォートで囲まれた文字列。複数行はここでは捕まらない。
      fields[key] = v.slice(1, -1);
    } else if (v.startsWith('[')) {
      fields[key] = v;
    } else if (!isNaN(Number(v))) {
      fields[key] = Number(v);
    } else {
      fields[key] = v;
    }
  }
  return fields;
}

/**
 * priceLunch 行の直前に新フィールドを挿入。
 * 既存キーがあればそもそも呼ばれない前提（呼び出し側で除外）。
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
    extra.push(`${indent}${k}: ${v ? 'true' : 'false'},`);
  }
  lines.splice(priceIdx, 0, ...extra);
  return { text: lines.join('\n'), added: extra.length };
}

const stats = {
  totalObjects: 0,
  matchedStores: 0,
  nursingAdded: 0,
  diaperAdded: 0,
  bothAdded: 0,
  byFacility: new Map(), // keyword -> count
  samples: [], // 確実そうな付与例
};

function processChunk(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const re = /(\s{4,6})\{\n([\s\S]*?)\n\1\},/g;
  const fileBase = path.basename(filePath);

  const newSrc = src.replace(re, (match, indent, body) => {
    const fields = parseObjectFields(body);
    if (!fields.genre || !fields.priceLunch) return match; // 店舗オブジェクトではない
    stats.totalObjects++;

    const area = fields.area || '';
    const description = fields.description || '';
    const hit = detectMall(area, description);
    if (!hit) return match;

    // 既に true/false が明示されているフィールドは触らない
    const toAdd = {};
    if (fields.nursingRoom === undefined) toAdd.nursingRoom = true;
    if (fields.diaperChangingTable === undefined) toAdd.diaperChangingTable = true;

    if (Object.keys(toAdd).length === 0) return match;

    const { text, added } = injectFields(body, toAdd);
    if (added === 0) return match;

    stats.matchedStores++;
    if ('nursingRoom' in toAdd) stats.nursingAdded++;
    if ('diaperChangingTable' in toAdd) stats.diaperAdded++;
    if ('nursingRoom' in toAdd && 'diaperChangingTable' in toAdd) stats.bothAdded++;
    stats.byFacility.set(hit, (stats.byFacility.get(hit) || 0) + 1);
    if (stats.samples.length < 5) {
      stats.samples.push({
        file: fileBase,
        name: fields.name,
        area,
        matchedKeyword: hit,
        added: Object.keys(toAdd),
      });
    }

    return `${indent}{\n${text}\n${indent}},`;
  });

  if (newSrc !== src) {
    fs.writeFileSync(filePath, newSrc);
    return true;
  }
  return false;
}

// メイン
const files = fs
  .readdirSync(DIR)
  .filter((f) => /^chunk-\d+\.ts$/.test(f))
  .sort((a, b) => {
    const na = Number(a.match(/\d+/)[0]);
    const nb = Number(b.match(/\d+/)[0]);
    return na - nb;
  });

console.log(`処理対象: ${files.length} files\n`);
for (const f of files) {
  const fp = path.join(DIR, f);
  const changed = processChunk(fp);
  if (changed) console.log(`  ${f}: 更新`);
}

console.log(`\n=== 完了 ===`);
console.log(`総店舗数            : ${stats.totalObjects}`);
console.log(`マッチした店舗数    : ${stats.matchedStores}`);
console.log(`  nursingRoom 付与  : ${stats.nursingAdded}`);
console.log(`  diaperChangingTable 付与: ${stats.diaperAdded}`);
console.log(`  両方付与          : ${stats.bothAdded}`);

console.log(`\n--- 施設別 上位10 ---`);
const sorted = [...stats.byFacility.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
for (const [kw, n] of sorted) {
  console.log(`  ${kw.padEnd(30, ' ')} ${n}`);
}

console.log(`\n--- サンプル ---`);
for (const s of stats.samples) {
  console.log(`  [${s.matchedKeyword}] ${s.name} | ${s.area} (${s.file}, +${s.added.join(', ')})`);
}
