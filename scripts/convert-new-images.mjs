#!/usr/bin/env node
/**
 * public/new_image/*.png → public/img/scenes/<scene>-<nn>.webp に変換・改名。
 * 分類結果 /tmp/img_class_all.json を使用。1600px幅・q80。
 * マッピング表を /tmp/img_rename_map.json に保存。
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'public/new_image';
const DST = 'public/img/scenes';
fs.mkdirSync(DST, { recursive: true });

const all = JSON.parse(fs.readFileSync('/tmp/img_class_all.json', 'utf8'));
const counters = {};
const map = [];

for (const item of all) {
  if (item.quality === 'ng') continue;
  const scene = item.scene || 'outing-general';
  counters[scene] = (counters[scene] || 0) + 1;
  const nn = String(counters[scene]).padStart(2, '0');
  const outName = `${scene}-${nn}.webp`;
  const srcPath = path.join(SRC, item.file);
  const dstPath = path.join(DST, outName);
  if (!fs.existsSync(srcPath)) {
    console.error('MISSING:', item.file);
    continue;
  }
  await sharp(srcPath)
    .resize(1600, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(dstPath);
  map.push({ ...item, out: `/img/scenes/${outName}` });
}

fs.writeFileSync('/tmp/img_rename_map.json', JSON.stringify(map, null, 1));
const totalKB = fs
  .readdirSync(DST)
  .reduce((s, f) => s + fs.statSync(path.join(DST, f)).size, 0) / 1024;
console.log(`変換完了: ${map.length}枚 → ${DST} (${Math.round(totalKB / 1024 * 10) / 10}MB)`);
console.log('シーン別:', JSON.stringify(counters));
