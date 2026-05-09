#!/usr/bin/env node
/**
 * 生成済み hero-ai/<slug>.png を各記事の frontmatter `hero:` に反映する。
 *
 * 動作:
 *   - public/hero-ai/manifest.json から ok=true のエントリを読む
 *   - 該当記事の frontmatter `hero:` を `/hero-ai/<slug>.png` に書き換え
 *   - 元の hero は `legacyHero:` に退避（戻したいときのため）
 *   - updatedAt も今日の日付に更新
 *
 * Usage:
 *   node scripts/apply-hero-ai.mjs              # 全件適用
 *   node scripts/apply-hero-ai.mjs --dry-run    # 変更プレビューのみ
 *   node scripts/apply-hero-ai.mjs --slug=babycar-ranking-2026
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const slugArg = args.find((a) => a.startsWith('--slug'));
const slugFilter = slugArg ? slugArg.split('=')[1] : null;

const MANIFEST = path.join(ROOT, 'public', 'hero-ai', 'manifest.json');
if (!fs.existsSync(MANIFEST)) {
  console.error('❌ public/hero-ai/manifest.json が見つかりません。');
  console.error('   先に scripts/generate-hero-images.mjs を実行してください。');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

const today = new Date().toISOString().slice(0, 10);
const ARTICLES = path.join(ROOT, 'content', 'articles');

let okCount = 0;
let skipCount = 0;
let missingCount = 0;

const entries = Object.entries(manifest).filter(
  ([, v]) => v.ok && (slugFilter ? v.slug === slugFilter : true),
);

console.log(`\n=== Hero画像 frontmatter 反映 ===`);
console.log(`manifest対象: ${entries.length}本 / dryRun=${dryRun}\n`);

for (const [slug, entry] of entries) {
  const file = path.join(ARTICLES, `${slug}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  ⚠ 記事ファイルなし: ${slug}`);
    missingCount++;
    continue;
  }
  // 生成済み画像が存在するかチェック（.jpg を優先、なければ .png）
  const jpgPath = path.join(ROOT, 'public', `hero-ai/${slug}.jpg`);
  const pngPath = path.join(ROOT, 'public', `hero-ai/${slug}.png`);
  let ext;
  if (fs.existsSync(jpgPath)) ext = 'jpg';
  else if (fs.existsSync(pngPath)) ext = 'png';
  else {
    console.warn(`  ⚠ 画像ファイルなし: ${slug}`);
    missingCount++;
    continue;
  }

  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  const data = parsed.data;
  const newHero = `/hero-ai/${slug}.${ext}`;

  if (data.hero === newHero) {
    skipCount++;
    continue;
  }

  if (!dryRun) {
    // 元のheroをlegacyHeroに退避（既にlegacyHeroがあれば上書きしない）
    const legacy = data.legacyHero ?? data.hero;
    const next = {
      ...data,
      hero: newHero,
      ...(legacy ? { legacyHero: legacy } : {}),
      updatedAt: today,
    };
    const newRaw = matter.stringify(parsed.content, next);
    fs.writeFileSync(file, newRaw);
  }
  okCount++;
  console.log(`  ✓ ${slug}: ${data.hero || '(なし)'} → ${newHero}`);
}

console.log(`\n=== 完了 ===`);
console.log(`更新: ${okCount}本 / 既に反映済: ${skipCount}本 / 欠損: ${missingCount}本`);
if (dryRun) console.log('※ --dry-run のため実ファイルは未変更');
