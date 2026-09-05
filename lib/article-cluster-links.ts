/**
 * 記事クラスタの回遊ナビ（TL;DR 直下に出す「同じお店／同じ区の記事」チップ）。
 *
 * 背景（2026-09-04 GA4 実測）: 記事着地セッションの PV/セッションは 1.21。
 * 流入主力のチェーン記事（王将・くら寿司・スシロー…）は 1.15〜1.25 で、読者は結論を読んで
 * そのまま離脱している。既存の回遊モジュール（getChainCrossLinks / getGenreRivalLinks 等）は
 * 全て本文の末尾にあり、平均滞在 70〜90 秒の読者には届いていない。
 *
 * ここでは markdown を一切編集せず、実在する slug から
 *   - チェーン: `{chain}-{kids-menu|kodzure-koryaku|baby-chair|…}` を同じ stem で束ねる
 *   - 東京23区: `shitsunai-asobi-{ward}-tokyo` / `mizuasobi-{ward}-tokyo` / `tokyo-{ward}-kodzure-lunch`
 * を機械的に束ね、結論ボックスの直下に短いラベルのリンク列として出す。
 * 既存 getChainCrossLinks は kids-menu↔baby-chair の固定ペアしか張れなかった（デニーズは7本、
 * ジョナサン・ガストは6本の姉妹記事があるのに 1〜2 本しか出ていなかった）。
 *
 * noindex の記事と自分自身は除外する。1本も姉妹が無ければ null。
 */
import type { FileArticleMeta } from './articles';
import { WARD_NAMES } from './tokyo-stations';

export type ClusterLink = { href: string; label: string };
export type ClusterNav = { heading: string; items: ClusterLink[] };

/** slug の suffix → チップの短いラベル。並び順もこの配列の順。 */
const SUFFIX_LABELS: Array<[string, string]> = [
  ['kids-menu', 'キッズメニュー'],
  ['kodzure-koryaku', '子連れ攻略ガイド'],
  ['baby-chair', 'ベビーチェア'],
  ['rinyushoku-mochikomi', '離乳食の持ち込み'],
  ['stroller', 'ベビーカー'],
  ['omutsu', 'おむつ替え・授乳'],
  ['koshitsu', '個室・座敷'],
  ['morning-kosodate', 'モーニング'],
  ['kodomo-ryokin', '子ども料金'],
  ['kodomo-ryokin-guide', '子ども料金'],
  ['kodomo-muryou', '子ども無料'],
  ['tsukimi', '月見メニュー'],
];

/** stem（slug からsuffixを除いた部分）→ 表示名。ここに無い stem はチップを出さない。 */
const CHAIN_NAMES: Record<string, string> = {
  anrakutei: '安楽亭',
  bamiyan: 'バーミヤン',
  bigboy: 'ビッグボーイ',
  'bikkuri-donkey': 'びっくりドンキー',
  'burger-king': 'バーガーキング',
  cocoichi: 'CoCo壱番屋',
  cocos: 'ココス',
  costco: 'コストコ',
  dennys: 'デニーズ',
  disney: '東京ディズニーランド',
  fujiq: '富士急ハイランド',
  gusto: 'ガスト',
  gyukaku: '牛角',
  hamasushi: 'はま寿司',
  hanamarudon: 'はなまるうどん',
  hoshino: '星乃珈琲店',
  ichiran: '一蘭',
  ikea: 'IKEA',
  jonathan: 'ジョナサン',
  'kappa-sushi': 'かっぱ寿司',
  kfc: 'ケンタッキー',
  komeda: 'コメダ珈琲店',
  kurasushi: 'くら寿司',
  'kushikatsu-tanaka': '串カツ田中',
  legoland: 'レゴランド・ジャパン',
  marukame: '丸亀製麺',
  matsuya: '松屋',
  mcdonalds: 'マクドナルド',
  'mos-burger': 'モスバーガー',
  nakau: 'なか卯',
  ohsho: '餃子の王将',
  onyasai: '温野菜',
  puroland: 'サンリオピューロランド',
  ringerhut: 'リンガーハット',
  'royal-host': 'ロイヤルホスト',
  saizeriya: 'サイゼリヤ',
  shabuyo: 'しゃぶ葉',
  steakgusto: 'ステーキガスト',
  sukiya: 'すき家',
  sushiro: 'スシロー',
  tds: '東京ディズニーシー',
  tenya: 'てんや',
  torikizoku: '鳥貴族',
  'ueno-zoo': '上野動物園',
  'washoku-sato': '和食さと',
  'yakiniku-king': '焼肉きんぐ',
  yayoiken: 'やよい軒',
  yoshinoya: '吉野家',
  yuzuan: 'ゆず庵',
};

/** slug の表記ゆれを正規 stem に寄せる（丸亀 marugame/marukame、はま寿司 hama-sushi 等）。 */
const STEM_ALIASES: Record<string, string> = {
  marugame: 'marukame',
  'hama-sushi': 'hamasushi',
  'kura-sushi': 'kurasushi',
  'steak-gusto': 'steakgusto',
  'hanamaru-udon': 'hanamarudon',
  shabuyou: 'shabuyo',
  saize: 'saizeriya',
};

/** suffix 規則に乗らない slug の所属を明示する。 */
const IRREGULAR: Record<string, { stem: string; suffix: string }> = {
  'kodzure-saize-koryaku': { stem: 'saizeriya', suffix: 'kodzure-koryaku' },
  'saize-morning-kosodate': { stem: 'saizeriya', suffix: 'morning-kosodate' },
};

function parseChainSlug(slug: string): { stem: string; suffix: string } | null {
  const irregular = IRREGULAR[slug];
  if (irregular) return irregular;
  for (const [suffix] of SUFFIX_LABELS) {
    if (slug.endsWith(`-${suffix}`)) {
      const raw = slug.slice(0, -(suffix.length + 1));
      const stem = STEM_ALIASES[raw] ?? raw;
      if (!CHAIN_NAMES[stem]) return null;
      return { stem, suffix };
    }
  }
  return null;
}

function suffixOrder(suffix: string): number {
  const i = SUFFIX_LABELS.findIndex(([s]) => s === suffix);
  return i < 0 ? 999 : i;
}

/**
 * チェーン記事の姉妹記事チップ。`all` は getAllFileArticles() の結果（noindex を含んでよい）。
 */
export function getChainClusterNav(slug: string, all: FileArticleMeta[]): ClusterNav | null {
  const me = parseChainSlug(slug);
  if (!me) return null;
  const items: Array<ClusterLink & { order: number }> = [];
  const seenSuffix = new Set<string>();
  for (const a of all) {
    if (a.slug === slug || a.noindex) continue;
    const p = parseChainSlug(a.slug);
    if (!p || p.stem !== me.stem) continue;
    // 同じ意図の記事が2本ある場合（丸亀の marugame/marukame 等）は先に見つかった1本だけ
    if (seenSuffix.has(p.suffix)) continue;
    seenSuffix.add(p.suffix);
    const label = SUFFIX_LABELS.find(([s]) => s === p.suffix)?.[1] ?? p.suffix;
    items.push({ href: `/article/${a.slug}`, label, order: suffixOrder(p.suffix) });
  }
  if (items.length === 0) return null;
  items.sort((x, y) => x.order - y.order);
  return {
    heading: `${CHAIN_NAMES[me.stem]}の子連れ情報をもっと見る`,
    items: items.map(({ href, label }) => ({ href, label })),
  };
}

/** 東京23区の区単位クラスタ。 */
const WARD_PATTERNS: Array<{ re: RegExp; label: string; order: number }> = [
  { re: /^shitsunai-asobi-([a-z]+)-tokyo$/, label: '室内遊び場', order: 0 },
  { re: /^mizuasobi-([a-z]+)-tokyo$/, label: '水遊び・じゃぶじゃぶ池', order: 1 },
  { re: /^tokyo-([a-z]+)-kodzure-lunch$/, label: '子連れランチ', order: 2 },
  { re: /^tokyo-([a-z]+)-free-park-muryou$/, label: '無料で遊べる公園', order: 3 },
  { re: /^tokyo-([a-z]+)-weekday-hidden$/, label: '平日の穴場', order: 4 },
];

function parseWardSlug(slug: string): { ward: string; label: string; order: number } | null {
  for (const p of WARD_PATTERNS) {
    const m = slug.match(p.re);
    if (m && (WARD_NAMES as Record<string, string>)[m[1]]) {
      return { ward: m[1], label: p.label, order: p.order };
    }
  }
  return null;
}

export function getWardClusterNav(slug: string, all: FileArticleMeta[]): ClusterNav | null {
  const me = parseWardSlug(slug);
  if (!me) return null;
  const items: Array<ClusterLink & { order: number }> = [];
  for (const a of all) {
    if (a.slug === slug || a.noindex) continue;
    const p = parseWardSlug(a.slug);
    if (!p || p.ward !== me.ward) continue;
    items.push({ href: `/article/${a.slug}`, label: p.label, order: p.order });
  }
  if (items.length === 0) return null;
  items.sort((x, y) => x.order - y.order);
  const wardName = (WARD_NAMES as Record<string, string>)[me.ward];
  return {
    heading: `${wardName}の子連れ情報をもっと見る`,
    items: items.map(({ href, label }) => ({ href, label })),
  };
}

/** 記事に出すクラスタナビ（チェーン優先、無ければ区）。 */
export function getClusterNav(slug: string, all: FileArticleMeta[]): ClusterNav | null {
  return getChainClusterNav(slug, all) ?? getWardClusterNav(slug, all);
}
