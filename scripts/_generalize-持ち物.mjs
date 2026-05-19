#!/usr/bin/env node
/**
 * 持ち物セクションの具体商品名を一般化する一回限りスクリプト。
 *
 * ユーザー指摘:「具体的な商品名はアフィリエイトつけないなら無し」
 *
 * 戦略:
 *   - 「## 持ち物」セクション内のリスト行のみ対象（他セクション・本文段落は触らない）
 *   - その行にURL（http/https or markdown link）がない場合のみ、ブランド名を一般化
 *   - ブランド付き「XXX『YYY』」→「YYY」、「ダイソー」「セリア」→「100均」など
 *   - 楽天価格（楽天1,500円）等のパッケージ価格表記は削除
 *
 * 既存のアフィリエイトURL付き商品名は触らない（収益化を壊さないため）。
 */
import fs from 'node:fs';
import path from 'node:path';

const DIRS = ['content/plans', 'content/articles'];
let modifiedFiles = 0;
let modifiedLines = 0;

/** 行に http/https のリンクが含まれるか（markdown link/auto-link/raw URL いずれも検出） */
function hasUrl(line) {
  return /https?:\/\//i.test(line);
}

/** ブランド名・価格表記の一般化変換。lineに対して非破壊的に新しい line を返す。 */
function generalize(line) {
  let out = line;

  // 「ダイソー・セリア」「ダイソー／セリア」「ダイソーやセリア」「ダイソー、セリア」→ 100均
  out = out.replace(/(?:ダイソー)[\s・/／、,やと]+(?:セリア|キャンドゥ)/g, '100均');
  out = out.replace(/(?:セリア)[\s・/／、,やと]+(?:ダイソー|キャンドゥ)/g, '100均');

  // 単独ブランド → 100均
  out = out.replace(/(?<![A-Za-z0-9一-龯])(ダイソー|セリア|キャンドゥ|スリーコインズ|3COINS)(?![A-Za-z0-9一-龯])/g, '100均');

  // ブランド『商品名』→ 商品名 （和文括弧）
  out = out.replace(/(?:Pigeon|ピジョン|明治|永谷園|アース製薬|花王|味の素|ハウス食品|キリン|サントリー|キユーピー|キッコーマン|ニチレイ|江崎グリコ|森永|不二家|ライオン|ユニ・チャーム|資生堂|ロート製薬)『([^』]{2,40})』/g, '$1');
  out = out.replace(/(?:Pigeon|ピジョン|明治|永谷園|アース製薬|花王|味の素|ハウス食品|キリン|サントリー|キユーピー|キッコーマン|ニチレイ|江崎グリコ|森永|不二家|ライオン|ユニ・チャーム|資生堂|ロート製薬)「([^」]{2,40})」/g, '$1');

  // ブランドの・XXX → XXX
  out = out.replace(/(?<![A-Za-z0-9一-龯])(?:Pigeon|ピジョン|明治|永谷園|アース製薬|花王|味の素|ハウス食品|キリン|サントリー|キユーピー|キッコーマン|ニチレイ|江崎グリコ|森永|不二家|ライオン|ユニ・チャーム|資生堂|ロート製薬)の/g, '');

  // 「（楽天1,500円）」「（楽天500円）」等の楽天価格表記を削除
  out = out.replace(/[（(]楽天[0-9,]+円[）)]/g, '');
  // 「（Amazon〜円）」も削除
  out = out.replace(/[（(]Amazon\s*[0-9,]+円[）)]/gi, '');
  // 「（ダイソー100円）」「（セリア300円）」等のブランド+価格 → 「（100均）」
  out = out.replace(/[（(](?:ダイソー|セリア|キャンドゥ)[0-9,]+円[^）)]*[）)]/g, '（100均）');
  // 「100均『XXX』100円」「100均『XXX』」→ XXX（100均）
  out = out.replace(/100均『([^』]{2,40})』(?:[0-9,]+円)?/g, '$1（100均）');
  out = out.replace(/100均「([^」]{2,40})」(?:[0-9,]+円)?/g, '$1（100均）');
  // 「ピップ製」「キヤノン製」のようなブランド+製 → 削除
  out = out.replace(/[（(](?:ピップ|キヤノン|ニコン|ソニー|パナソニック|シャープ|東芝|日立|タイガー|象印|サーモス|ZOJIRUSHI|TIGER|THERMOS)製[）)]/g, '');
  // 括弧内に「ダイソーNNN円」「セリアNNN円」が混ざる場合 → 「100均」に置換
  out = out.replace(/(?:ダイソー|セリア|キャンドゥ)[0-9,]+円(?:の)?/g, '100均の');
  // 「アース」「カネボウ」など見落とし系：仮置き、安全のためコメントアウト
  // 後始末: 「ベビー耳あてor」のようにorの前のスペースがない場合に補完
  out = out.replace(/([ぁ-んァ-ヶ一-龯])(or|OR)\b/g, '$1 $2');
  out = out.replace(/\b(or|OR)([ぁ-んァ-ヶ一-龯])/g, '$1 $2');
  out = out.replace(/\s+or\s+/g, ' or ');

  // 連続スペース・連続区切りを掃除
  out = out.replace(/[ \t]{2,}/g, ' ');
  // 「、 、」「・ ・」のような重複区切りを掃除
  out = out.replace(/、\s*、/g, '、');
  out = out.replace(/・\s*・/g, '・');
  // 行末の余計な空白
  out = out.replace(/[ \t]+$/g, '');

  return out;
}

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const fname of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const fp = path.join(dir, fname);
    const raw = fs.readFileSync(fp, 'utf8');
    const lines = raw.split('\n');
    let inMochi = false;
    let fileChanged = false;
    let fileChangedLines = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // セクション開始/終了の検出
      if (/^##\s+持ち物\s*$/.test(line)) {
        inMochi = true;
        continue;
      }
      if (inMochi && /^##\s+/.test(line)) {
        inMochi = false;
        continue;
      }
      if (!inMochi) continue;
      // リスト行のみ対象
      if (!/^\s*[-*]\s+/.test(line)) continue;
      // URL付きはスキップ
      if (hasUrl(line)) continue;
      const next = generalize(line);
      if (next !== line) {
        lines[i] = next;
        fileChanged = true;
        fileChangedLines++;
      }
    }

    if (fileChanged) {
      fs.writeFileSync(fp, lines.join('\n'));
      modifiedFiles++;
      modifiedLines += fileChangedLines;
    }
  }
}

console.log(`modified files: ${modifiedFiles}, modified lines: ${modifiedLines}`);
