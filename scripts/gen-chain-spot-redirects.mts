/**
 * lib/chain-spot-redirects.ts を再生成する（P1-1c）。
 *
 *   npx tsx scripts/gen-chain-spot-redirects.mts
 *
 * TOKYO_RESTAURANTS / SPOTS から「category='restaurant' かつ ward='複数'」（=全国チェーン）
 * を走査し、各 /spot/[slug] を対応まとめ記事へ 301 する静的データを書き出す。
 * name→記事 の対応が無いチェーンは外食カテゴリ /category/today-taberu へ。
 */
import { TOKYO_RESTAURANTS, SPOTS, spotToSlug, type Spot } from '../lib/spots.ts';
import fs from 'node:fs';

const MAP: Record<string, string> = {
  'IKEA レストラン（新三郷・立川・原宿等）': 'ikea-restaurant-kodzure-koryaku',
  'ココス': 'cocos-kodzure-koryaku',
  'ガスト': 'gusto-kodzure-koryaku',
  'サイゼリヤ': 'kodzure-saize-koryaku',
  'くら寿司': 'kura-sushi-kodzure-koryaku',
  'スシロー': 'sushiro-kodzure-koryaku',
  'ジョナサン': 'jonathan-kodzure-koryaku',
  '上島珈琲店・キッズ向けカフェ': 'ueshima-coffee-kodzure-koryaku',
  'デニーズ': 'denny-s-kodzure-koryaku',
  'バーミヤン': 'bamiyan-kodzure-koryaku',
  'ビッグボーイ': 'bigboy-kids-menu',
  'ロイヤルホスト': 'royal-host-kodzure-koryaku',
  'ステーキガスト': 'steak-gusto-kodzure-koryaku',
  'びっくりドンキー': 'bikkuri-donkey-kodzure-koryaku',
  'マクドナルド': 'mcdonalds-kodzure-koryaku',
  'モスバーガー': 'mos-burger-kodzure-koryaku',
  'ケンタッキーフライドチキン': 'kfc-kodzure-koryaku',
  'フレッシュネスバーガー': 'freshness-burger-kodzure-koryaku',
  'リンガーハット': 'ringer-hut-kodzure-koryaku',
  '丸亀製麺': 'marugame-kodzure-koryaku',
  'なか卯': 'nakau-kodzure-koryaku',
  '松屋': 'matsuya-kodzure-koryaku',
  'すき家': 'sukiya-kodzure-koryaku',
  '吉野家': 'yoshinoya-kodzure-koryaku',
  'ミスタードーナツ': 'misdo-kodzure-koryaku',
  '焼肉きんぐ': 'yakiniku-king-kodzure-koryaku',
  'しゃぶ葉': 'shabuyou-kodzure-koryaku',
  'かっぱ寿司': 'kappa-sushi-kodzure-koryaku',
  'はま寿司': 'hama-sushi-kodzure-koryaku',
  'コメダ珈琲店': 'komeda-kodzure-koryaku',
  "タリーズコーヒー（Tully's）キッズメニュー対応店": 'tullys-coffee-kodzure-koryaku',
};
const FALLBACK = '/category/today-taberu';

const seen = new Set<string>();
const rows: { from: string; to: string; name: string }[] = [];
const add = (s: Spot, area: string) => {
  if (s.category !== 'restaurant' || s.ward !== '複数') return;
  const from = spotToSlug(s, area);
  if (seen.has(from)) return;
  seen.add(from);
  const art = MAP[s.name];
  const to = art && fs.existsSync(`content/articles/${art}.md`) ? `/article/${art}` : FALLBACK;
  rows.push({ from, to, name: s.name });
};
for (const s of TOKYO_RESTAURANTS) add(s, 'tokyo');
for (const [area, list] of Object.entries(SPOTS)) for (const s of list ?? []) add(s, area);

const ts = `/**
 * 全国チェーン外食スポット（category='restaurant' かつ ward='複数'）の
 * /spot/[slug] → まとめ記事(or 外食カテゴリ)への 301（P1-1c）。
 *
 * チェーンは「どこにでもある＝目的地にならない」ためスポットDBの一覧・ランキング・
 * 今日の流れ(destination)からは getOutingSpotsWithSlug が既に除外している。だが
 * /spot/[slug] は 200 のまま生き、Google がクロール・評価し続ける（低品質・重複・
 * チェーン記事とのカニバリ）。ここで URL レベルに 301 して評価を記事へ統合する。
 *
 * 自動生成: scripts/gen-chain-spot-redirects.mts（TOKYO_RESTAURANTS を走査）。
 * 手編集しないこと。name→記事 の対応が無いチェーンは ${FALLBACK} へ。
 */
export const CHAIN_SPOT_REDIRECTS: Array<{ from: string; to: string }> = [
${rows.map((r) => `  { from: '${r.from}', to: '${r.to}' }, // ${r.name}`).join('\n')}
];
`;
fs.writeFileSync('lib/chain-spot-redirects.ts', ts);
console.log(`wrote lib/chain-spot-redirects.ts (${rows.length} rows, fallback=${rows.filter((r) => r.to === FALLBACK).length})`);
