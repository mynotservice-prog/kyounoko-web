#!/usr/bin/env node
/**
 * /img/scenes/ の新画像を記事ヒーローに割り当てる。
 *
 * - slugキーワード → シーンのマッピングで「合う記事」だけ差し替え（合わない記事は触らない）
 * - 同シーン内のバリアントは slugハッシュで決定的に選択（多少の重複は許容）
 * - frontmatter の hero: のみ書き換え。updatedAt 等は不変
 * - --dry でドライラン
 */
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const DIR = 'content/articles';
const SCENES_DIR = 'public/img/scenes';

// シーン → 利用可能画像（実ファイルから列挙）
const pool = {};
for (const f of fs.readdirSync(SCENES_DIR)) {
  const m = /^([a-z-]+)-\d+\.webp$/.exec(f);
  if (!m) continue;
  (pool[m[1]] ||= []).push(`/img/scenes/${f}`);
}
for (const k of Object.keys(pool)) pool[k].sort();

// slugセグメント一致ルール（ハイフン区切りの完全セグメント列で照合。
// 上から順に最初のマッチ採用。具体的なものを上に）
// 例: kw 'train' は 'toire-training' にはマッチしない（segment 'training' ≠ 'train'）
const RULES = [
  { scene: 'aquarium', kws: ['suizokukan', 'aquarium'] },
  { scene: 'zoo', kws: ['doubutsuen', 'zoo', 'bokujou', 'fureai'] },
  { scene: 'pool-water', kws: ['mizuasobi', 'jabujabu', 'pool', 'puuru', 'kawaasobi', 'umi'] },
  { scene: 'camp', kws: ['kyanpu', 'camp', 'bbq'] },
  { scene: 'airplane', kws: ['hikouki'] },
  { scene: 'train', kws: ['shinkansen', 'densha', 'train', 'ressha'] },
  { scene: 'car', kws: ['child-seat', 'junior-seat', 'drive', 'kuruma'] },
  { scene: 'stroller', kws: ['babycar', 'bebika', 'stroller', 'dakkohimo', 'hipseat'] },
  { scene: 'rain', kws: ['ame', 'tsuyu', 'rainy', 'nagagutsu', 'kappa'] },
  { scene: 'bento', kws: ['obento', 'bento'] },
  { scene: 'baby-food', kws: ['rinyuushoku', 'rinyushoku'] },
  { scene: 'nursery', kws: ['hoikuen', 'nyuuen', 'youchien', 'enji', 'ensoku', 'kyushoku'] },
  { scene: 'book', kws: ['ehon'] },
  { scene: 'sleep', kws: ['nekashitsuke', 'nenne', 'suimin', 'oyasumi', 'shoutou', 'hirune'] },
  { scene: 'indoor-play', kws: ['shitsunaiasobiba', 'kids-park', 'asobiba', 'indoor'] },
  { scene: 'toy', kws: ['omocha', 'chiiku-toys', 'toys', 'tsumiki', 'block', 'toysub'] },
  { scene: 'cooking', kws: ['tsukurioki', 'cooking', 'ryouri', 'oyako-cook'] },
  { scene: 'shopping', kws: ['kaimono', 'shopping', 'costco', 'supermarket'] },
  { scene: 'park', kws: ['kouen', 'park', 'picnic', 'sotoasobi', 'soto-asobi', 'undou'] },
  { scene: 'meal', kws: ['recipe', 'gohan', 'taberu', 'lunch', 'dinner', 'shokuji', 'menu', 'asagohan', 'yuuhan', 'yushoku', 'oyatsu', 'kondate'] },
  { scene: 'home-play', kws: ['ie-asobi', 'ieasobi', 'ouchi', 'ie-de', 'home'] },
];

/** kw がハイフン区切りセグメント列として slug に含まれるか */
function segMatch(slug, kw) {
  return ('-' + slug + '-').includes('-' + kw + '-');
}

function hash(s) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

let changed = 0;
const log = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.md'))) {
  const slug = file.replace(/\.md$/, '');
  const rule = RULES.find((r) => r.kws.some((k) => segMatch(slug, k)));
  if (!rule || !pool[rule.scene]?.length) continue;
  const p = path.join(DIR, file);
  const src = fs.readFileSync(p, 'utf8');
  const heroMatch = /^hero:\s*(.+)$/m.exec(src);
  if (!heroMatch) continue;
  const candidates = pool[rule.scene];
  const pick = candidates[hash(slug) % candidates.length];
  if (heroMatch[1].trim() === pick) continue;
  const next = src.replace(/^hero:\s*.+$/m, `hero: ${pick}`);
  if (!DRY) fs.writeFileSync(p, next);
  changed++;
  log.push(`${slug} : ${heroMatch[1].trim()} -> ${pick}`);
}

console.log(`${DRY ? '[DRY] ' : ''}差し替え: ${changed}記事`);
const byScene = {};
for (const l of log) {
  const sc = /scenes\/([a-z-]+)-\d+/.exec(l)?.[1];
  byScene[sc] = (byScene[sc] || 0) + 1;
}
console.log('シーン別:', JSON.stringify(byScene));
fs.writeFileSync('/tmp/hero_assign_log.txt', log.join('\n'));
console.log('詳細: /tmp/hero_assign_log.txt');
