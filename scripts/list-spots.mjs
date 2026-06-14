import { getAllSpotsWithSlug, SPOT_CATEGORY_LABEL } from '../lib/spots.ts';

const all = getAllSpotsWithSlug();
console.log('総施設数:', all.length);

// 都道府県別・カテゴリ別集計
const byArea = {};
const byCat = {};
for (const { area, spot } of all) {
  byArea[area] = (byArea[area] || 0) + 1;
  byCat[spot.category] = (byCat[spot.category] || 0) + 1;
}
console.log('\n=== カテゴリ別 ===');
for (const [c, n] of Object.entries(byCat).sort((a,b)=>b[1]-a[1])) {
  console.log(`${SPOT_CATEGORY_LABEL[c] || c}: ${n}`);
}
console.log('\n=== 都道府県別（上位15） ===');
for (const [a, n] of Object.entries(byArea).sort((a,b)=>b[1]-a[1]).slice(0,15)) {
  console.log(`${a}: ${n}`);
}
