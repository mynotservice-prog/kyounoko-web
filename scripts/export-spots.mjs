import fs from 'node:fs';
import { getAllSpotsWithSlug, SPOT_CATEGORY_LABEL } from '../lib/spots.ts';
import { AREAS } from '../lib/area.ts';

const areaName = {};
for (const a of AREAS) areaName[a.slug] = a.name;

const all = getAllSpotsWithSlug();

// CSV
const esc = (v) => {
  const s = (v ?? '').toString().replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
};
const header = ['施設名','カテゴリ','都道府県','市区町村','最寄駅','対象年齢','予算','屋内外','URL'];
const rows = [header.join(',')];
const budgetLabel = { free:'無料', low:'〜1000円', mid:'1000〜3000円', high:'3000円〜' };
const placeLabel = { indoor:'屋内', outdoor:'屋外', mixed:'屋内外' };

const sorted = [...all].sort((a, b) => {
  const an = areaName[a.area] || a.area, bn = areaName[b.area] || b.area;
  if (an !== bn) return an.localeCompare(bn, 'ja');
  return (a.spot.name || '').localeCompare(b.spot.name || '', 'ja');
});

for (const { slug, area, spot } of sorted) {
  rows.push([
    esc(spot.name),
    esc(SPOT_CATEGORY_LABEL[spot.category] || spot.category),
    esc(areaName[area] || area),
    esc(spot.ward || spot.city || ''),
    esc(spot.nearestStation || ''),
    esc((spot.ages || []).join('/')),
    esc(budgetLabel[spot.budget] || spot.budget || ''),
    esc(placeLabel[spot.place] || spot.place || ''),
    esc('https://kyounoko.jp/spot/' + slug),
  ].join(','));
}
fs.writeFileSync('docs/spots-list.csv', rows.join('\n'));
console.log('CSV: docs/spots-list.csv (' + all.length + '施設)');

// Markdown（都道府県ごとにグルーピング）
const byArea = {};
for (const { slug, area, spot } of sorted) {
  const an = areaName[area] || area;
  (byArea[an] ||= []).push({ slug, spot });
}
let md = `# きょうのこ 掲載施設リスト\n\n`;
md += `> 全${all.length}施設（${new Date().getFullYear()}年時点）\n\n`;
md += `## カテゴリ別内訳\n\n`;
const byCat = {};
for (const { spot } of all) byCat[spot.category] = (byCat[spot.category]||0)+1;
md += `| カテゴリ | 件数 |\n|---|---|\n`;
for (const [c,n] of Object.entries(byCat).sort((a,b)=>b[1]-a[1])) {
  md += `| ${SPOT_CATEGORY_LABEL[c]||c} | ${n} |\n`;
}
md += `\n## 都道府県別\n\n`;
// 都道府県をAREAS順に
const areaOrder = AREAS.map(a => a.name);
const areaKeys = Object.keys(byArea).sort((a,b) => {
  const ia = areaOrder.indexOf(a), ib = areaOrder.indexOf(b);
  return (ia<0?999:ia) - (ib<0?999:ib);
});
for (const an of areaKeys) {
  const list = byArea[an];
  md += `### ${an}（${list.length}施設）\n\n`;
  md += `| 施設名 | カテゴリ | エリア | 最寄駅 |\n|---|---|---|---|\n`;
  for (const { slug, spot } of list) {
    md += `| [${spot.name}](https://kyounoko.jp/spot/${slug}) | ${SPOT_CATEGORY_LABEL[spot.category]||spot.category} | ${spot.ward||spot.city||'-'} | ${spot.nearestStation||'-'} |\n`;
  }
  md += `\n`;
}
fs.writeFileSync('docs/spots-list.md', md);
console.log('Markdown: docs/spots-list.md');
