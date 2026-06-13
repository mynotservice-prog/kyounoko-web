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
  // 具体的な場所・施設（最優先）
  { scene: 'aquarium', kws: ['suizokukan', 'aquarium', 'kasai-aquarium', 'churaumi'] },
  { scene: 'zoo', kws: ['doubutsuen', 'zoo', 'bokujou', 'fureai', 'safari'] },
  { scene: 'pool-water', kws: ['mizuasobi', 'jabujabu', 'pool', 'puuru', 'kawaasobi', 'umi', 'umisuiyoku', 'beach'] },
  { scene: 'camp', kws: ['kyanpu', 'camp', 'bbq', 'glamping'] },
  { scene: 'airplane', kws: ['hikouki', 'airport', 'kuukou'] },
  { scene: 'train', kws: ['shinkansen', 'densha', 'train', 'ressha'] },
  { scene: 'car', kws: ['child-seat', 'junior-seat', 'drive', 'kuruma', 'chairudo-shito', 'isofix'] },
  // ベビー用品
  { scene: 'stroller', kws: ['babycar', 'bebika', 'bebicar', 'stroller', 'dakkohimo', 'hipseat', 'bebika-ok-cafe', 'bebycar', 'baby-oritatami', 'baby-rucksack'] },
  // 天候
  { scene: 'rain', kws: ['ame', 'tsuyu', 'rainy', 'nagagutsu', 'kappa', 'amenohi'] },
  // 食事系（具体）
  { scene: 'bento', kws: ['obento', 'bento', 'kyaraben', 'lunch-box'] },
  { scene: 'baby-food', kws: ['rinyuushoku', 'rinyushoku', 'babyfood', 'youjishoku', 'youji-shoku', 'rinyu-shoku'] },
  // 保育園・幼稚園
  { scene: 'nursery', kws: ['hoikuen', 'nyuuen', 'youchien', 'enji', 'ensoku', 'kyushoku', 'youjien', 'hoiku-en', 'preschool'] },
  // 習い事（v7: ピアノ・スイミング・英会話・体操の実写10枚追加）
  { scene: 'lesson', kws: ['naraigoto', 'narai', 'piano', 'swimming', 'suiei', 'eikaiwa', 'eigo', 'taiso', 'kumon', 'shichida', 'gakken', 'rythmic', 'ritomikku', 'gymnastics'] },
  // 工作・お絵かき・粘土・折り紙（v7: 実写4枚追加）
  { scene: 'craft', kws: ['kousaku', 'craft', 'oekaki', 'oeka', 'origami', 'nendo', 'seal-asobi', 'tegami', 'painting', 'shiborinuki'] },
  // スクリーンタイム（v7: 実写10枚追加）
  { scene: 'screen-time', kws: ['sumaho', 'smartphone', 'tablet', 'youtube', 'screen-time', 'screentime', 'digital', 'screen-toha'] },
  // お風呂・入浴ケア（v7: 実写4枚追加）
  { scene: 'bath', kws: ['ofuro', 'bath', 'nyuuyoku', 'shampoo', 'shanpu', 'babybath'] },
  // 医療・体調・小児科（v7: 実写7枚追加）
  { scene: 'medical', kws: ['hatsunetsu', 'netsu', 'kaze', 'byouin', 'shounika', 'ishi-sagashi', 'yobou-sesshu', 'vaccine', 'kusuri', 'gerizam', 'arerugi', 'aleergi', 'shindansho', 'shinsatsu', 'taionkei', 'taion', 'hatake', 'mizuboso', 'otafuku', 'influenza', 'corona'] },
  // 絵本・読書
  { scene: 'book', kws: ['ehon', 'yomikikase', 'reading', 'dokusho'] },
  // 寝かしつけ
  { scene: 'sleep', kws: ['nekashitsuke', 'nenne', 'suimin', 'oyasumi', 'shoutou', 'hirune', 'yonaki', 'nemuri', 'oneshou', 'oyasuminasai'] },
  // 室内遊び場
  { scene: 'indoor-play', kws: ['shitsunaiasobiba', 'kids-park', 'asobiba', 'indoor', 'kidsroom', 'jido-club', 'jidoukan', 'asobi-room', 'shitsunai'] },
  // おもちゃ
  { scene: 'toy', kws: ['omocha', 'chiiku-toys', 'toys', 'tsumiki', 'block', 'toysub', 'omochaserve', 'toy-rental'] },
  // 料理・調理
  { scene: 'cooking', kws: ['tsukurioki', 'cooking', 'ryouri', 'oyako-cook', 'oyako-cooking', 'tsukuriokiha'] },
  // 買い物・ショッピング
  { scene: 'shopping', kws: ['kaimono', 'shopping', 'costco', 'supermarket', 'super-market', 'aeon', 'mall', 'depato', 'depart'] },
  // 公園・外遊び・季節イベント
  { scene: 'park', kws: ['kouen', 'park', 'picnic', 'sotoasobi', 'soto-asobi', 'undou', 'hanabi', 'matsuri', 'hanami', 'ohanami', 'sakura', 'koinobori', 'tanabata'] },
  // 食事（汎用）— 飲食チェーンも含む
  { scene: 'meal', kws: [
    'recipe', 'gohan', 'taberu', 'lunch', 'dinner', 'shokuji', 'menu', 'asagohan', 'yuuhan', 'yushoku', 'oyatsu', 'kondate',
    'kodzure-koryaku', 'kodzure', 'toribunke', 'toribunke-real',
    'koshitsu', 'chain', 'yakiniku', 'udon', 'sushi', 'sushiro', 'kura-zushi', 'hama-zushi', 'izakaya',
    'family-restaurant', 'fast-food', 'fastfood', 'koryori', 'tabehoudai',
  ] },
  // 家遊び・室内
  { scene: 'home-play', kws: [
    'ie-asobi', 'ieasobi', 'ouchi', 'ie-de', 'home', 'ouchi-asobi', 'wanope', 'wanope-asobi',
    'akachan-asobi', 'mama-asobi', 'oekaki', 'origami', 'kousaku', 'craft', 'seal-asobi', 'nendo', 'shabondama',
    'baby-oil', 'baby-senzai', 'babyfuku', 'babybath', 'babygate', 'baby-jama',
    'kosodate', 'mama', 'papa',
  ] },
  // お出かけ全般（地域・施設名・温泉・観光）
  { scene: 'outing-general', kws: [
    'odekake', 'day-trip', 'day-trip-spot', 'spot', 'spots', 'sightseeing', 'kankou',
    'onsen', 'yado', 'ryokan', 'hotel', 'inn', 'kosodate-spot',
    'atami', 'hakone', 'karuizawa', 'kamakura', 'enoshima', 'nikko', 'odaiba',
    'sapporo', 'sendai', 'kanazawa', 'nagoya', 'kyoto', 'kobe', 'hiroshima', 'fukuoka', 'okinawa',
    'kasai', 'ikebukuro', 'shinjuku', 'shibuya', 'ueno', 'asakusa', 'tokyo-skytree', 'tokyodome',
  ] },
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
