#!/usr/bin/env node
/**
 * スポットの「最終確認日」データ（lib/spot-verification-data.ts）を生成する。
 *
 * なぜ git 履歴から作るのか:
 *   確認日は本来「人が公式サイト等で裏を取った日」だが、既存データにはその記録が無い。
 *   ただし lib/spot-facilities.ts と lib/kid-reports.ts は
 *   **裏取り/実訪問記録そのもの**なので、そのエントリ行が最後に書かれた日 ＝ 確認した日
 *   とみなせる。git blame で行ごとのコミット日を取り、エントリのキー行の日付を採る。
 *
 *   逆に lib/spots.ts 本体（name/category/note/pricing 等）は他サイトを参考にした
 *   キュレーションであり「公式で確認した」記録ではない。**ここには確認日を付けない**
 *   （付けると未確認のデータを確認済みに見せることになる）。
 *
 * 使い方:
 *   node scripts/seed-spot-verification.mjs           # 生成して書き出す
 *   node scripts/seed-spot-verification.mjs --dry     # 結果だけ表示
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry');
const OUT = 'lib/spot-verification-data.ts';

/**
 * git blame --line-porcelain を解析し、[{ line, date }] を返す。
 * date は committer-time（そのコミットが実際に入った日）を YYYY-MM-DD で。
 */
function blame(file) {
  const raw = execFileSync('git', ['blame', '--line-porcelain', '--', file], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const out = [];
  let time = null;
  for (const ln of raw.split('\n')) {
    if (ln.startsWith('committer-time ')) {
      time = Number(ln.slice('committer-time '.length));
    } else if (ln.startsWith('\t')) {
      out.push({ line: ln.slice(1), date: new Date(time * 1000).toISOString().slice(0, 10) });
    }
  }
  return out;
}

/** Record<キー, 値> のトップレベルのエントリ開始行からキーを取る。 */
function entryKey(line) {
  // '施設名': { …  /  施設名: { …
  const m = line.match(/^ {2}'([^']+)':\s*\{/) || line.match(/^ {2}([^\s':{}]+):\s*\{/);
  return m ? m[1] : null;
}

const records = new Map(); // name -> { verifiedAt, method }

// ① 公式裏取り済みの設備データ
for (const { line, date } of blame('lib/spot-facilities.ts')) {
  const k = entryKey(line);
  if (k) records.set(k, { verifiedAt: date, method: 'official' });
}

// ② 運営者の実訪問レポート（実訪問は公式確認より強いので上書きする）
for (const { line, date } of blame('lib/kid-reports.ts')) {
  const k = entryKey(line);
  if (k) records.set(k, { verifiedAt: date, method: 'visited' });
}

const rows = [...records.entries()].sort((a, b) =>
  a[1].verifiedAt === b[1].verifiedAt ? a[0].localeCompare(b[0], 'ja') : a[1].verifiedAt.localeCompare(b[1].verifiedAt),
);

const byMethod = rows.reduce((acc, [, v]) => ((acc[v.method] = (acc[v.method] || 0) + 1), acc), {});
console.log(`抽出: ${rows.length}件  (${Object.entries(byMethod).map(([k, v]) => `${k}=${v}`).join(' / ')})`);
const dates = rows.map(([, v]) => v.verifiedAt);
console.log(`確認日の範囲: ${dates[0]} 〜 ${dates[dates.length - 1]}`);

if (DRY) {
  for (const [k, v] of rows.slice(0, 15)) console.log(`  ${v.verifiedAt}  ${v.method.padEnd(8)} ${k}`);
  process.exit(0);
}

const body = rows
  .map(([k, v]) => `  ${JSON.stringify(k)}: { verifiedAt: '${v.verifiedAt}', method: '${v.method}' },`)
  .join('\n');

const src = `/**
 * スポットの最終確認日。**自動生成ファイル（手で編集しない）**。
 *
 *   生成: node scripts/seed-spot-verification.mjs
 *
 * 出どころ:
 *  - method: 'official' … lib/spot-facilities.ts のエントリ行が最後に書かれた日
 *                          （＝公式サイト/自治体公式で設備を裏取りした日）
 *  - method: 'visited'  … lib/kid-reports.ts のエントリ行が最後に書かれた日
 *                          （＝運営者の実訪問レポートを記録した日）
 *
 * ここに載っていないスポットは「未確認」。UI では未確認と正直に出す。
 * 嘘の確認日を入れないこと（確認していないものを確認済みに見せない）。
 */
import type { SpotVerification } from './spots';

export const SPOT_VERIFICATION: Record<string, SpotVerification> = {
${body}
};
`;

writeFileSync(OUT, src);
console.log(`書き出し: ${OUT}（${src.split('\n').length}行）`);
