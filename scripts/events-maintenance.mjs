/**
 * イベント定期メンテナンス・レビュー用スクリプト（週次運用の起点）。
 *
 * 使い方:
 *   npx tsx scripts/events-maintenance.mjs            # 今日基準
 *   npx tsx scripts/events-maintenance.mjs 2026-08-01 # 日付を指定して確認
 *
 * 出力（docs/events-maintenance.md にも書き出し）:
 *   1) 終了した「年次イベント」 → 翌年に繰り上げる候補（要・公式日付確認）
 *   2) 終了した「単発イベント」 → 削除候補
 *   3) これから開催のイベント件数（月別）
 *   4) 開催予定イベントが無い都道府県（=今週の調査ターゲット）
 *
 * ※ 日付の繰り上げは「同月同日 +1年」の機械計算。多くの祭りは「第N週末」など
 *   変動するため、必ず公式サイトで実際の翌年日程を確認してから反映すること。
 */
import fs from 'node:fs';
import { EVENTS } from '../lib/events.ts';
import { AREAS } from '../lib/area.ts';

const today = process.argv[2] || new Date().toISOString().slice(0, 10);

// 年次イベント判定: recurring フラグ、または category=matsuri、または定番キーワード
const ANNUAL_RE = /祭|まつり|花火|おどり|踊り|山笠|天王祭|ペーロン|開山|七夕|夜店|納涼|ナイト|サマー|ラベンダー|さくらんぼ|潮|夜の水族館/;
const isAnnual = (e) =>
  e.recurring === 'annual' || e.category === 'matsuri' || ANNUAL_RE.test(e.title);

const rollOneYear = (d) => {
  const [y, m, day] = d.split('-').map(Number);
  return `${y + 1}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const areaName = {};
for (const a of AREAS) areaName[a.slug] = a.name;

const ended = EVENTS.filter((e) => e.endDate < today);
const upcoming = EVENTS.filter((e) => e.endDate >= today);
const endedAnnual = ended.filter(isAnnual);
const endedOneOff = ended.filter((e) => !isAnnual(e));

let md = `# イベント メンテナンス・レビュー\n\n> 基準日: ${today} ／ 全${EVENTS.length}件（開催予定${upcoming.length} / 終了${ended.length}）\n\n`;

md += `## 1. 終了した年次イベント — 翌年へ繰り上げ候補（${endedAnnual.length}件）\n\n`;
md += `> 下記の新日付は「同月同日+1年」の機械計算。**必ず公式サイトで翌年の実際の日程を確認**してから反映してください。\n\n`;
if (endedAnnual.length) {
  md += `| slug | タイトル | 現日付 | 繰り上げ候補 | 公式 |\n|---|---|---|---|---|\n`;
  for (const e of endedAnnual) {
    md += `| \`${e.slug}\` | ${e.title} | ${e.startDate}〜${e.endDate} | ${rollOneYear(e.startDate)}〜${rollOneYear(e.endDate)} | ${e.officialUrl || '-'} |\n`;
  }
} else {
  md += `なし\n`;
}

md += `\n## 2. 終了した単発イベント — 削除候補（${endedOneOff.length}件）\n\n`;
if (endedOneOff.length) {
  md += `| slug | タイトル | 終了日 |\n|---|---|---|\n`;
  for (const e of endedOneOff) md += `| \`${e.slug}\` | ${e.title} | ${e.endDate} |\n`;
} else {
  md += `なし\n`;
}

// 月別の開催予定件数
const byMonth = {};
for (const e of upcoming) {
  const m = e.startDate.slice(0, 7);
  byMonth[m] = (byMonth[m] || 0) + 1;
}
md += `\n## 3. これから開催のイベント（月別・開始月ベース）\n\n`;
md += `| 月 | 件数 |\n|---|---|\n`;
for (const m of Object.keys(byMonth).sort()) md += `| ${m} | ${byMonth[m]} |\n`;

// カバレッジ: 開催予定イベントが無い都道府県
const haveUpcoming = new Set(upcoming.map((e) => e.area));
const gaps = AREAS.filter(
  (a) => a.slug !== 'all' && a.block !== undefined && !haveUpcoming.has(a.slug),
).map((a) => a.name);
md += `\n## 4. 開催予定イベントが無い都道府県（今週の調査ターゲット・${gaps.length}件）\n\n`;
md += gaps.length ? gaps.join('、') + '\n' : 'なし（全都道府県カバー済み）\n';

fs.writeFileSync('docs/events-maintenance.md', md);

// コンソール要約
console.log(`基準日: ${today}`);
console.log(`全${EVENTS.length}件（開催予定${upcoming.length} / 終了${ended.length}）`);
console.log(`  └ 終了のうち 年次=${endedAnnual.length}（繰り上げ候補） / 単発=${endedOneOff.length}（削除候補）`);
console.log(`未カバー都道府県: ${gaps.length}件${gaps.length ? ' → ' + gaps.join('、') : ''}`);
console.log(`詳細レポート: docs/events-maintenance.md`);
