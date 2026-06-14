/**
 * 「次に訪問してレポートすべきスポット」優先リスト生成。
 *
 * 堀（＝運営者が実際に行った一次情報）を最速で太らせるため、
 * kidReport を持たないスポットを「効果の大きい順」に並べる。
 *
 *   npx tsx scripts/report-targets.mjs
 *
 * 出力: docs/report-targets.md
 *   - 最優先: popular（編集部が「ママに人気」と推す）なのにレポート無し
 *   - 次点  : 集客力の高いカテゴリ（動物園/水族館/遊園地/大型公園）でレポート無し
 *   - エリア別の穴（各都道府県でレポート0件 → 地方の信頼性が低いままになる）
 *
 * ※ここに出るのは「行く候補」。レポート本文は必ず運営者の実体験のみで書くこと
 *   （scripts/new-kid-report.mjs でひな形を出せる）。
 */
import fs from 'node:fs';
import { getAllSpotsWithSlug, SPOT_CATEGORY_LABEL } from '../lib/spots.ts';
import { AREAS } from '../lib/area.ts';

const areaName = {};
for (const a of AREAS) areaName[a.slug] = a.name;

// 集客力の重み（一次情報の価値が高い＝行き先になりやすいカテゴリほど高得点）
const CAT_WEIGHT = {
  amusement: 30, zoo: 28, aquarium: 28, park: 22, museum: 18, farm: 16, seasonal: 12, indoor: 10, restaurant: 4,
};

// 運営者が現実に日帰りで行ける範囲（東京23区＋関東日帰り圏）。
// ここを最優先にする。遠方は「実訪問レポート」を無理に作らず、
// Track B（公式確認できる設備・料金データ）＋「未訪問」明示で誠実にカバーする。
const REACHABLE = new Set(['tokyo', 'kanagawa', 'chiba', 'saitama', 'ibaraki', 'tochigi', 'gunma']);

const all = getAllSpotsWithSlug();
const withReport = all.filter((x) => x.spot.kidReport).length;

const score = (x) =>
  (REACHABLE.has(x.area) ? 200 : 0) +
  (x.spot.popular ? 100 : 0) +
  (CAT_WEIGHT[x.spot.category] ?? 0) +
  (x.spot.pricing ? 5 : 0);

const targets = all
  .filter((x) => !x.spot.kidReport)
  .map((x) => ({ ...x, score: score(x) }))
  .sort((a, b) => b.score - a.score);

// 🔴 最優先 = 行ける範囲 ×「人気」なのにレポート無し
const popularNoReport = targets.filter((x) => x.spot.popular && REACHABLE.has(x.area));

// エリア別: レポート0件の都道府県（地方ほど一次情報ゼロになりがち）
const reportByArea = {};
for (const { area, spot } of all) {
  if (spot.kidReport) reportByArea[area] = (reportByArea[area] || 0) + 1;
}
const zeroReportAreas = AREAS.filter(
  (a) => a.slug !== 'all' && a.block !== undefined && !reportByArea[a.slug],
);

let md = `# 訪問レポート 優先ターゲット\n\n`;
md += `> 一次情報カバレッジ: ${withReport} / ${all.length} 件（${(withReport / all.length * 100).toFixed(1)}%）\n`;
md += `> ここに出るのは「訪問候補」。レポートは必ず運営者の実体験のみで記録すること。\n\n`;

md += `## 🔴 最優先 — 行ける範囲（東京＋関東日帰り圏）で「人気」なのにレポート無し（${popularNoReport.length}件）\n\n`;
md += `運営者が実際に行けて、かつ編集部が推しているスポット。ここを埋めるのが最も費用対効果が高い。\n\n`;
md += `| スポット | カテゴリ | エリア | 市区町村 |\n|---|---|---|---|\n`;
for (const { area, spot } of popularNoReport) {
  md += `| ${spot.name} | ${SPOT_CATEGORY_LABEL[spot.category]} | ${areaName[area] || area} | ${spot.ward || spot.city || '-'} |\n`;
}

md += `\n## 🟠 関東日帰り圏で集客力の高い施設（レポート無し・上位40）\n\n`;
md += `動物園・水族館・遊園地・大型公園など「わざわざ行く」場所。実際に行ける関東圏に絞った訪問候補。\n\n`;
md += `| スコア | スポット | カテゴリ | エリア |\n|---|---|---|---|\n`;
for (const { area, spot, score: s } of targets.filter((x) => REACHABLE.has(x.area) && !x.spot.popular).slice(0, 40)) {
  md += `| ${s} | ${spot.name} | ${SPOT_CATEGORY_LABEL[spot.category]} | ${areaName[area] || area} |\n`;
}

md += `\n## ⚪ 遠方（関東圏外）の扱い\n\n`;
md += `運営者が日帰りで行けない地域は、実訪問レポートを**無理に作らない**（作れば堀＝正直さが壊れる）。\n`;
md += `代わりに Track B＝公式で確認できる設備（おむつ替え・授乳室・ベビーカー動線）・料金・予約データを充実させ、\n`;
md += `「運営者は未訪問。設備情報は公式で確認」と明示することで、誠実なまま情報密度で勝負する。\n`;

md += `\n## 🟡 一次情報ゼロの都道府県（${zeroReportAreas.length}件）\n\n`;
md += `この地域は「実際に行った情報」が1件も無く、地方ユーザーへの信頼性が上がりにくい。\n`;
md += `各県の代表スポット1件でもレポートが付くと一気に説得力が増す。\n\n`;
md += zeroReportAreas.length
  ? zeroReportAreas.map((a) => a.name).join('、') + '\n'
  : 'なし（全都道府県に最低1件のレポートあり）\n';

fs.writeFileSync('docs/report-targets.md', md);

console.log(`一次情報カバレッジ: ${withReport}/${all.length} (${(withReport / all.length * 100).toFixed(1)}%)`);
console.log(`🔴 人気なのにレポート無し: ${popularNoReport.length}件`);
console.log(`🟡 レポート0件の都道府県: ${zeroReportAreas.length}件`);
console.log(`詳細: docs/report-targets.md`);
