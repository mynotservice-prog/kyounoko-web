#!/usr/bin/env node
/**
 * 事業用フォルダにビジネス利用しやすい CSV を一括書き出し。
 *
 * 出力先: ~/Desktop/nagamine事業用/きょうのこ/data/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, 'tmp', 'business-data');
fs.mkdirSync(OUT_DIR, { recursive: true });

function bom(s) {
  return '﻿' + s; // Excel互換のためBOM付与
}
function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function toCsv(rows, headers) {
  const head = headers.map(csvEscape).join(',');
  const body = rows.map((r) => headers.map((h) => csvEscape(r[h])).join(',')).join('\n');
  return bom(head + '\n' + body);
}

// ===== 1. 記事一覧 =====
const articlesDir = path.join(ROOT, 'content', 'articles');
const articleFiles = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
const articleRows = articleFiles.map((f) => {
  const raw = fs.readFileSync(path.join(articlesDir, f), 'utf8');
  const { data, content } = matter(raw);
  return {
    slug: data.slug || f.replace(/\.md$/, ''),
    title: data.title || '',
    category: data.category || '',
    area: data.area || 'all',
    publishedAt: data.publishedAt || '',
    updatedAt: data.updatedAt || '',
    metaDescription: data.metaDescription || '',
    wordCount: content.length,
    url: `https://kyounoko.jp/article/${data.slug || f.replace(/\.md$/, '')}`,
  };
});
fs.writeFileSync(
  path.join(OUT_DIR, 'articles.csv'),
  toCsv(articleRows, ['slug', 'title', 'category', 'area', 'publishedAt', 'updatedAt', 'wordCount', 'url', 'metaDescription']),
);
console.log(`✓ articles.csv (${articleRows.length}件)`);

// ===== 2. プラン一覧 =====
const plansDir = path.join(ROOT, 'content', 'plans');
const planFiles = fs.readdirSync(plansDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
const planRows = planFiles.map((f) => {
  const raw = fs.readFileSync(path.join(plansDir, f), 'utf8');
  const { data, content } = matter(raw);
  return {
    id: data.id || '',
    title: data.title || '',
    shortAnswer: data.shortAnswer || '',
    kind: data.kind || 'activity',
    ageRanges: Array.isArray(data.ageRanges) ? data.ageRanges.join('|') : '',
    weather: Array.isArray(data.weather) ? data.weather.join('|') : '',
    place: Array.isArray(data.place) ? data.place.join('|') : '',
    durationMin: data.durationMin || '',
    budget: data.budget || '',
    area: data.area || 'all',
    wordCount: content.length,
    url: `https://kyounoko.jp/plan/${data.id || ''}`,
  };
});
fs.writeFileSync(
  path.join(OUT_DIR, 'plans.csv'),
  toCsv(planRows, ['id', 'title', 'shortAnswer', 'kind', 'ageRanges', 'weather', 'place', 'durationMin', 'budget', 'area', 'wordCount', 'url']),
);
console.log(`✓ plans.csv (${planRows.length}件)`);

// ===== 3. レストラン全件（チェーン+個人店） =====
// data-aggregations.ts は TS だが、シンプル化のために chunk を直接読む
const { CHAINS, STATION_CHAIN_MAPPING } = await import('../lib/station-restaurants-export.mjs').catch(() => ({
  CHAINS: null,
  STATION_CHAIN_MAPPING: null,
}));

// fallback: 個別チャンクファイルから抽出
function readIndieChunks() {
  const dir = path.join(ROOT, 'lib', 'indie-restaurants');
  const files = fs.readdirSync(dir).filter((f) => /^chunk-/.test(f));
  const rows = [];
  for (const file of files) {
    const src = fs.readFileSync(path.join(dir, file), 'utf8');
    // 駅キー単位で分割
    const stationBlocks = src.matchAll(/'([a-z][a-z0-9-]+)':\s*\[([\s\S]*?)\n\s*\],/g);
    for (const sm of stationBlocks) {
      const stationSlug = sm[1];
      const inner = sm[2];
      const objBlocks = inner.matchAll(/\{([\s\S]*?)\},?\s*(?=\{|$)/g);
      for (const om of objBlocks) {
        const text = om[1];
        const get = (k) => {
          const m = text.match(new RegExp(`${k}:\\s*('([^']+)'|"([^"]+)"|(true|false))`));
          if (!m) return '';
          return m[2] || m[3] || m[4] || '';
        };
        const getArr = (k) => {
          const m = text.match(new RegExp(`${k}:\\s*\\[([^\\]]+)\\]`));
          if (!m) return '';
          return m[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).join('|');
        };
        const name = get('name');
        if (!name) continue;
        rows.push({
          type: 'indie',
          stationSlug,
          name,
          genre: get('genre'),
          area: get('area'),
          priceLunch: get('priceLunch'),
          strollerOk: get('strollerOk'),
          kidsMenu: get('kidsMenu'),
          privateRoom: get('privateRoom'),
          kidsChair: get('kidsChair'),
          kidsCutlery: get('kidsCutlery'),
          kidsSpace: get('kidsSpace'),
          stepFree: get('stepFree'),
          seatingType: getArr('seatingType'),
          diaperChangingTable: get('diaperChangingTable'),
          nursingRoom: get('nursingRoom'),
          bringBabyFood: get('bringBabyFood'),
          shareDish: get('shareDish'),
          strollerToSeat: get('strollerToSeat'),
          allergenInfo: get('allergenInfo'),
          popular: get('popular'),
          chunkFile: file,
        });
      }
    }
  }
  return rows;
}
const indieRows = readIndieChunks();
fs.writeFileSync(
  path.join(OUT_DIR, 'restaurants_indie.csv'),
  toCsv(indieRows, [
    'type', 'stationSlug', 'name', 'genre', 'area', 'priceLunch',
    'strollerOk', 'kidsMenu', 'privateRoom', 'kidsChair', 'kidsCutlery', 'kidsSpace',
    'stepFree', 'seatingType', 'diaperChangingTable', 'nursingRoom',
    'bringBabyFood', 'shareDish', 'strollerToSeat', 'allergenInfo', 'popular', 'chunkFile',
  ]),
);
console.log(`✓ restaurants_indie.csv (${indieRows.length}件)`);

// ===== 4. チェーン店一覧 =====
const chainSrc = fs.readFileSync(path.join(ROOT, 'lib', 'station-restaurants.ts'), 'utf8');
const chainBlocks = chainSrc.matchAll(/\{\s*\n\s*slug:\s*'([^']+)',[\s\S]*?\n\s*\},/g);
const chainRows = [];
for (const m of chainBlocks) {
  const text = m[0];
  const get = (k) => {
    const mm = text.match(new RegExp(`${k}:\\s*('([^']+)'|"([^"]+)"|(true|false))`));
    if (!mm) return '';
    return mm[2] || mm[3] || mm[4] || '';
  };
  const getArr = (k) => {
    const mm = text.match(new RegExp(`${k}:\\s*\\[([^\\]]+)\\]`));
    if (!mm) return '';
    return mm[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).join('|');
  };
  chainRows.push({
    slug: get('slug'),
    name: get('name'),
    category: get('category'),
    stroller: get('stroller'),
    kidsMenu: get('kidsMenu'),
    babyChair: get('babyChair'),
    privateRoom: get('privateRoom'),
    babyFoodOk: get('babyFoodOk'),
    kidsCutlery: get('kidsCutlery'),
    kidsSpace: get('kidsSpace'),
    stepFree: get('stepFree'),
    seatingType: getArr('seatingType'),
    diaperChangingTable: get('diaperChangingTable'),
    nursingRoom: get('nursingRoom'),
    bringBabyFood: get('bringBabyFood'),
    shareDish: get('shareDish'),
    strollerToSeat: get('strollerToSeat'),
    allergenInfo: get('allergenInfo'),
    lunchPrice: get('lunchPrice'),
    ubiquity: get('ubiquity'),
    description: get('description'),
  });
}
fs.writeFileSync(
  path.join(OUT_DIR, 'restaurants_chain.csv'),
  toCsv(chainRows, [
    'slug', 'name', 'category', 'stroller', 'kidsMenu', 'babyChair', 'privateRoom', 'babyFoodOk',
    'kidsCutlery', 'kidsSpace', 'stepFree', 'seatingType', 'diaperChangingTable', 'nursingRoom',
    'bringBabyFood', 'shareDish', 'strollerToSeat', 'allergenInfo', 'lunchPrice', 'ubiquity', 'description',
  ]),
);
console.log(`✓ restaurants_chain.csv (${chainRows.length}件)`);

// ===== 5. スポット =====
let spotRows = [];
try {
  const spotsSrc = fs.readFileSync(path.join(ROOT, 'lib', 'spots.ts'), 'utf8');
  const spotBlocks = spotsSrc.matchAll(/\{\s*\n\s*slug:\s*'([^']+)',[\s\S]*?\n\s*\},/g);
  for (const m of spotBlocks) {
    const text = m[0];
    const get = (k) => {
      const mm = text.match(new RegExp(`${k}:\\s*('([^']+)'|"([^"]+)"|(true|false)|(\\d+))`));
      if (!mm) return '';
      return mm[2] || mm[3] || mm[4] || mm[5] || '';
    };
    spotRows.push({
      slug: get('slug'),
      name: get('name'),
      prefecture: get('prefecture'),
      area: get('area'),
      category: get('category'),
      ageFrom: get('ageFrom'),
      ageTo: get('ageTo'),
      strollerOk: get('strollerOk'),
      indoor: get('indoor'),
      description: get('description'),
    });
  }
} catch (e) {
  console.warn(`spots.ts 読み込み失敗: ${e.message}`);
}
fs.writeFileSync(
  path.join(OUT_DIR, 'spots.csv'),
  toCsv(spotRows, ['slug', 'name', 'prefecture', 'area', 'category', 'ageFrom', 'ageTo', 'strollerOk', 'indoor', 'description']),
);
console.log(`✓ spots.csv (${spotRows.length}件)`);

// ===== 6. 駅一覧（東京+関西） =====
function readStations(file) {
  const src = fs.readFileSync(path.join(ROOT, 'lib', file), 'utf8');
  const blocks = src.matchAll(/\{\s*\n\s*slug:\s*'([^']+)',[\s\S]*?\n\s*\},/g);
  const rows = [];
  for (const m of blocks) {
    const text = m[0];
    const get = (k) => {
      const mm = text.match(new RegExp(`${k}:\\s*('([^']+)'|"([^"]+)")`));
      if (!mm) return '';
      return mm[2] || mm[3] || '';
    };
    rows.push({
      region: file.includes('kansai') ? 'kansai' : 'tokyo',
      slug: get('slug'),
      name: get('name'),
      ward: get('ward'),
      prefecture: get('prefecture'),
    });
  }
  return rows;
}
const tokyoStations = readStations('tokyo-stations.ts');
const kansaiStations = readStations('kansai-stations.ts');
fs.writeFileSync(
  path.join(OUT_DIR, 'stations.csv'),
  toCsv([...tokyoStations, ...kansaiStations], ['region', 'slug', 'name', 'ward', 'prefecture']),
);
console.log(`✓ stations.csv (${tokyoStations.length + kansaiStations.length}件)`);

console.log(`\n=== 完了 ===`);
console.log(`出力先: ${OUT_DIR}`);
