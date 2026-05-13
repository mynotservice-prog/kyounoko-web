#!/usr/bin/env node
/** stations + spots を堅牢に CSV エクスポート（事業フォルダ用） */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, 'tmp', 'business-data');
fs.mkdirSync(OUT_DIR, { recursive: true });

function bom(s) { return '﻿' + s; }
function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function toCsv(rows, headers) {
  return bom(headers.map(csvEscape).join(',') + '\n' +
    rows.map((r) => headers.map((h) => csvEscape(r[h])).join(',')).join('\n'));
}

// ===== 駅: tokyo-stations.ts + kansai-stations.ts =====
function parseStationFile(fp, region) {
  const src = fs.readFileSync(fp, 'utf8');
  const rows = [];
  // tokyo は1行 / kansai は複数行。両方対応する非貪欲マッチ
  const re = /\{\s*slug:\s*'[^']+'[\s\S]*?\},/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const text = m[0];
    const get = (k) => {
      const mm = text.match(new RegExp(`\\b${k}:\\s*'([^']+)'`));
      return mm ? mm[1] : '';
    };
    const linesM = text.match(/lines:\s*\[([^\]]+)\]/);
    const lines = linesM ? linesM[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).join('|') : '';
    rows.push({
      region,
      slug: get('slug'),
      name: get('name'),
      kana: get('kana'),
      ward: get('ward'),
      prefecture: get('prefecture'),
      scale: get('scale'),
      lines,
    });
  }
  return rows;
}
const stations = [
  ...parseStationFile(path.join(ROOT, 'lib', 'tokyo-stations.ts'), 'tokyo'),
  ...parseStationFile(path.join(ROOT, 'lib', 'kansai-stations.ts'), 'kansai'),
];
fs.writeFileSync(
  path.join(OUT_DIR, 'stations.csv'),
  toCsv(stations, ['region', 'slug', 'name', 'kana', 'ward', 'prefecture', 'scale', 'lines']),
);
console.log(`✓ stations.csv (${stations.length}件)`);

// ===== スポット: lib/spots.ts =====
// Record<AreaSlug, Spot[]> 形式。各 prefecture: [ {...}, ... ] を抽出
const spotsSrc = fs.readFileSync(path.join(ROOT, 'lib', 'spots.ts'), 'utf8');
// AreaSlug をキー、Spot配列 を値とするブロックを抽出
const blockRe = /^\s{2}([a-z][a-z0-9-]+):\s*\[\s*$([\s\S]*?)^\s{2}\],?$/gm;
const spotRows = [];
let bm;
while ((bm = blockRe.exec(spotsSrc)) !== null) {
  const area = bm[1];
  const body = bm[2];
  // body から {...} を抽出
  const objRe = /\{([\s\S]*?)\},/g;
  let om;
  while ((om = objRe.exec(body)) !== null) {
    const t = om[1];
    const get = (k) => {
      const mm = t.match(new RegExp(`\\b${k}:\\s*('([^']+)'|"([^"]+)"|(true|false))`));
      return mm ? (mm[2] || mm[3] || mm[4] || '') : '';
    };
    const agesM = t.match(/ages:\s*\[([^\]]+)\]/);
    const ages = agesM ? agesM[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).join('|') : '';
    const name = get('name');
    if (!name) continue;
    spotRows.push({
      area,
      name,
      category: get('category'),
      place: get('place'),
      ages,
      city: get('city'),
      budget: get('budget'),
      reservation: get('reservation'),
      hiddenTip: get('hiddenTip'),
      note: get('note'),
    });
  }
}
fs.writeFileSync(
  path.join(OUT_DIR, 'spots.csv'),
  toCsv(spotRows, ['area', 'name', 'category', 'place', 'ages', 'city', 'budget', 'reservation', 'hiddenTip', 'note']),
);
console.log(`✓ spots.csv (${spotRows.length}件)`);
