import { readFileSync, readdirSync } from 'node:fs';

const chunkDir = 'lib/indie-restaurants';
const chunkFiles = readdirSync(chunkDir).filter((f) => f.startsWith('chunk-') && f.endsWith('.ts'));

// より緩い regex: 'slug': [ から次の同レベル ], までを取る
const stationStoreCount = {};
for (const f of chunkFiles) {
  const txt = readFileSync(`${chunkDir}/${f}`, 'utf-8');
  // station ブロックを分解: '駅slug': [\n ... \n  ],
  // 1) station declaration の位置
  const lines = txt.split('\n');
  let currentSlug = null;
  let depth = 0;
  let inBlock = false;
  let nameCountForSlug = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 駅宣言開始
    const m = line.match(/^\s*'([\w-]+)':\s*\[\s*$/);
    if (m && !inBlock) {
      currentSlug = m[1];
      inBlock = true;
      depth = 1;
      nameCountForSlug[currentSlug] = nameCountForSlug[currentSlug] || 0;
      continue;
    }
    if (inBlock) {
      const opens = (line.match(/\[/g) || []).length;
      const closes = (line.match(/\]/g) || []).length;
      depth += opens - closes;
      // name field 検出
      if (/^\s+name:\s*'/.test(line)) {
        nameCountForSlug[currentSlug]++;
      }
      if (depth === 0) {
        inBlock = false;
        currentSlug = null;
      }
    }
  }
  for (const [slug, cnt] of Object.entries(nameCountForSlug)) {
    stationStoreCount[slug] = (stationStoreCount[slug] || 0) + cnt;
  }
}

// 統計
const counts = Object.values(stationStoreCount);
console.log(`Covered stations: ${counts.length}`);
console.log(`Total stores: ${counts.reduce((a,b)=>a+b,0)}`);

// 分布
const bins = { '1': 0, '2-3': 0, '4-5': 0, '6-10': 0, '11+': 0 };
for (const c of counts) {
  if (c === 1) bins['1']++;
  else if (c <= 3) bins['2-3']++;
  else if (c <= 5) bins['4-5']++;
  else if (c <= 10) bins['6-10']++;
  else bins['11+']++;
}
console.log('\n店舗数分布:');
for (const [k,v] of Object.entries(bins)) console.log(`  ${k} 店: ${v}駅`);

// Tokyo の thin な major/terminal 駅をリストアップ
const tk = readFileSync('lib/tokyo-stations.ts', 'utf-8');
const stationRe = /\{\s*slug:\s*'([\w-]+)',\s*name:\s*'([^']+)',[\s\S]*?ward:\s*'([\w-]+)',[\s\S]*?scale:\s*'(terminal|major|minor)'/g;
const allTokyo = [];
let m;
while ((m = stationRe.exec(tk)) !== null) {
  allTokyo.push({ slug: m[1], name: m[2], ward: m[3], scale: m[4] });
}

console.log('\n=== 1店舗しかない駅 (薄い) — 強化候補 ===');
const oneStore = allTokyo.filter((s) => stationStoreCount[s.slug] === 1);
console.log(`Count: ${oneStore.length}`);
for (const s of oneStore.slice(0, 60)) {
  console.log(`${s.slug}\t${s.name}\t${s.ward}\t${s.scale}\t${stationStoreCount[s.slug]}store`);
}
