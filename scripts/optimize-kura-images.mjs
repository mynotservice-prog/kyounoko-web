#!/usr/bin/env node
/**
 * くら寿司の公式提供画像を webp に最適化して public/img/kura/ に配置する。
 *
 * 使い方:
 *   1. Google Drive の公式画像4枚を assets/kura-src/ に置く（原本名のままでOK／配信対象外）
 *   2. node scripts/optimize-kura-images.mjs
 *
 * 原本名 → 出力名 のマッピングは部分一致で解決するので、拡張子・大文字小文字の差は無視されます。
 */
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'assets/kura-src');
const OUT = join(ROOT, 'public/img/kura');

// 出力名 → 原本名に含まれるキーワード（部分一致）
const MAP = [
  { out: 'lane-cover.webp', needles: ['レーン', '抗菌', 'カバー', 'lane', 'cover'] },
  { out: 'bikkurapon.webp', needles: ['ビッくらポン', 'びっくら', 'bikkura'] },
  { out: 'interior.webp', needles: ['店舗内観', '内観', 'interior', 'shop'] },
  { out: 'sushi-set.webp', needles: ['お寿司集合', '集合', 'sushi', 'photo'] },
];

if (!existsSync(SRC)) {
  console.error(`原本フォルダがありません: ${SRC}\nGoogle Drive の画像4枚をここに置いてください。`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => !f.startsWith('.'));
if (files.length === 0) {
  console.error(`原本が見つかりません: ${SRC} に画像を置いてください。`);
  process.exit(1);
}

// macOSのファイル名はNFD（濁点分離）のことがあるためNFCに正規化して比較する
const norm = (s) => s.normalize('NFC').toLowerCase();
let done = 0;

for (const { out, needles } of MAP) {
  const match = files.find((f) => needles.some((n) => norm(f).includes(norm(n))));
  if (!match) {
    console.warn(`⚠ ${out}: 対応する原本が見つかりませんでした（needles: ${needles.join(', ')}）`);
    continue;
  }
  const inPath = join(SRC, match);
  const outPath = join(OUT, out);
  await sharp(inPath, { failOn: 'none' })
    .rotate()
    .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outPath);
  console.log(`✓ ${match}  →  public/img/kura/${out}`);
  done++;
}

console.log(`\n完了: ${done}/${MAP.length} 枚を最適化しました。`);
