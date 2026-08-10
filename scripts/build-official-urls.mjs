#!/usr/bin/env node
/**
 * 検証済みの公式サイトURLから lib/spot-official-urls.ts を生成する。
 *
 *   node scripts/build-official-urls.mjs <verified.tsv> [<verified2.tsv> …]
 *
 * 入力は scripts/verify-official-urls.mjs が出す TSV（name/url/status/finalUrl/title）。
 * **HTTP 200 で取得できたものだけ**を採用し、リダイレクト先が確定していればそちらを正とする
 * （リダイレクトを毎回踏ませない＆改称・移転を取り込むため）。
 *
 * DROP に入れた名前は意図的に採用しない。理由をコメントで残すこと
 * （「調べたが確認できなかった」と「まだ調べていない」を将来の自分が区別できるように）。
 */
import { readFileSync, writeFileSync } from 'node:fs';

/** 検証したが採用しないもの。理由つき。 */
const DROP = {
  'コストコ 多摩境倉庫店 フードコート':
    'costco.co.jp/store-finder/Tamasakai は JS 描画で本文が取れず、多摩境の店舗ページだと確認できなかった',
  'コストコ 多摩境倉庫 フードコート':
    'costco.co.jp/store-finder/Tamasakai は JS 描画で本文が取れず、多摩境の店舗ページだと確認できなかった',
  'IKEA レストラン（新三郷・立川・原宿等）':
    '複数店舗の総称で、対応する単一の公式ページが無い（個別店舗ページは別途登録済み）',
};

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node scripts/build-official-urls.mjs <verified.tsv> [...]');
  process.exit(1);
}

const map = new Map();
const dropped = [];
const failed = [];

for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n').slice(1).filter(Boolean);
  for (const ln of lines) {
    const [name, url, status, finalUrl, title] = ln.split('\t');
    if (DROP[name]) {
      dropped.push([name, DROP[name]]);
      continue;
    }
    const code = Number(status);
    if (!(code >= 200 && code < 300)) {
      failed.push([name, url, status, title]);
      continue;
    }
    map.set(name, { url: finalUrl || url, title: (title || '').trim() });
  }
}

const rows = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ja'));
const body = rows
  .map(([name, v]) => `  ${JSON.stringify(name)}: ${JSON.stringify(v.url)}, // ${v.title}`)
  .join('\n');

const dropBody = dropped
  .map(([name, why]) => ` *  - ${name}: ${why}`)
  .join('\n');

const src = `/**
 * スポットの公式サイトURL。**自動生成ファイル（手で編集しない）**。
 *
 *   生成: node scripts/build-official-urls.mjs <verified.tsv>
 *   検証: node scripts/verify-official-urls.mjs <candidates.json> --out=<verified.tsv>
 *
 * 収録しているのは **実際に HTTP 200 で取得し、<title> が施設と対応することを確認できたURL だけ**。
 * 誤った公式リンクは未設定より悪い（別の施設へ送客する）ので、確認できないものは入れない。
 * 行末のコメントは確認時点のページタイトル＝採用の根拠。
 *
 * 調べたうえで意図的に入れていないもの:
${dropBody || ' *  （なし）'}
 *
 * キー（スポット名）は lib/spots.ts の name と完全一致させること。
 * spots.ts 側で name 一致により officialUrl が自動マージされる（overrides で表示名を
 * 変えても外れないよう、上書き前の name でマージしている）。
 */
export const SPOT_OFFICIAL_URLS: Record<string, string> = {
${body}
};
`;

writeFileSync('lib/spot-official-urls.ts', src);
console.log(`採用 ${rows.length}件 / 除外 ${dropped.length}件 / 取得失敗 ${failed.length}件`);
if (failed.length) {
  console.log('\n取得失敗（未採用）:');
  for (const [name, url, status, title] of failed) console.log(`  ${status}  ${name}  ${url}  ${title}`);
}
console.log('\n書き出し: lib/spot-official-urls.ts');
