/**
 * アソビュー！（バリューコマース）の着地URLを、記事面の意図に合わせて深リンク化する。
 *
 * ## なぜ必要か（2026-07-27 本番HTML実測）
 * 本番の上位198記事（20,595clk/28日）を curl して数えたところ、アソビューCTAが
 * 描画されている **53本・9,196clk が全て `https://www.asoview.com/` のトップページ着地**
 * だった。トップ着地は「汎用ランキング/通年特集ページに着地させない（EPC¥0.3の実績）」という
 * リメギフ側の教訓そのままの失敗形で、実際にブラウザで確認したところ
 * `?keyword=プール` のようなクエリはSPA側で無視され、水遊び記事の読者に
 * 「沖縄の体験ダイビング」が並ぶ全国5,333件の未絞り込み一覧が出る状態だった。
 *
 * アソビューは実測で **唯一の承認済み成果（VC 2件 ¥588）** が出ている導線なので、
 * ここを意図一致の一覧に着地させるのが最も費用対効果が高い。
 *
 * ## URLの根拠（すべて2026-07-27に実HTTPで200と<title>を確認済み）
 *   /leisure/203/ = プール・ウォーターパーク（69施設）
 *   /leisure/265/ = キッズパーク（240施設・室内あそび場）
 *   /leisure/192/ = 水族館（71施設）
 *   /leisure/212/ = 動物園・サファリパーク（54施設）
 *   /leisure/191/ = 遊園地・テーマパーク（176施設）
 *   都道府県で絞る場合は `/leisure/{genre}/location/prf{JIS2桁}0000/`
 *   （例: 東京 /leisure/203/location/prf130000/ →「東京都のプール・ウォーターパーク」）
 * 推測でURLを組み立てない。新しいジャンルを足すときは必ず実HTTPで200と<title>を確認すること。
 *
 * VCのトラッキングは lib/reservation-cta.ts の buildVcDeepLink() が `vc_url` を
 * 差し替える形で維持される（同一ホスト www.asoview.com 内なので承認マーチャント外に出ない）。
 */

const ASOVIEW_ORIGIN = 'https://www.asoview.com';

/** 実在確認済みのアソビュー・ジャンルパス。 */
export const ASOVIEW_GENRE_PATHS = {
  /** プール・ウォーターパーク */
  pool: '/leisure/203/',
  /** キッズパーク（室内あそび場・雨の日） */
  kidspark: '/leisure/265/',
  /** 水族館 */
  aquarium: '/leisure/192/',
  /** 動物園・サファリパーク */
  zoo: '/leisure/212/',
  /** 遊園地・テーマパーク */
  themepark: '/leisure/191/',
} as const;

export type AsoviewGenre = keyof typeof ASOVIEW_GENRE_PATHS;

/**
 * 記事 frontmatter の `area`（ローマ字の都道府県 slug）→ アソビューの都道府県コード。
 * `all` / `kanto` / `national` のような広域値は都道府県に落とせないので意図的に持たない
 * （= 全国ジャンル一覧に着地させる）。
 */
const AREA_TO_PREF_CODE: Record<string, string> = {
  hokkaido: '01',
  saitama: '11',
  chiba: '12',
  tokyo: '13',
  kanagawa: '14',
  yamanashi: '19',
  shizuoka: '22',
  aichi: '23',
  kyoto: '26',
  osaka: '27',
  hyogo: '28',
  fukuoka: '40',
};

/**
 * 記事 slug に含まれる地名トークン → 都道府県 slug。
 * `mizuasobi-kobe` のように frontmatter の area が付いていない面でも都道府県に寄せるため。
 * 東京23区の区名は area:tokyo が付いている想定だが、保険として主要トークンだけ持つ。
 */
const SLUG_TOKEN_TO_AREA: [string, string][] = [
  ['-kobe', 'hyogo'],
  ['-nagoya', 'aichi'],
  ['-yokohama', 'kanagawa'],
  ['-kawasaki', 'kanagawa'],
  ['-osaka', 'osaka'],
  ['-kyoto', 'kyoto'],
  ['-fukuoka', 'fukuoka'],
  ['-chiba', 'chiba'],
  ['-saitama', 'saitama'],
  ['-funabashi', 'chiba'],
  ['-tokyo', 'tokyo'],
  ['-sapporo', 'hokkaido'],
];

/** area / slug から都道府県コードを解決する（できなければ null＝全国一覧）。 */
function resolvePrefCode(slug: string, area?: string): string | null {
  const direct = area ? AREA_TO_PREF_CODE[area.toLowerCase()] : undefined;
  if (direct) return direct;
  const lower = slug.toLowerCase();
  for (const [token, a] of SLUG_TOKEN_TO_AREA) {
    if (lower.includes(token)) return AREA_TO_PREF_CODE[a] ?? null;
  }
  return null;
}

/** ジャンル（＋都道府県）からアソビューの着地URLを組み立てる。 */
export function buildAsoviewLanding(
  genre: AsoviewGenre,
  slug = '',
  area?: string,
): string {
  const base = ASOVIEW_GENRE_PATHS[genre];
  const pref = resolvePrefCode(slug, area);
  return pref
    ? `${ASOVIEW_ORIGIN}${base}location/prf${pref}0000/`
    : `${ASOVIEW_ORIGIN}${base}`;
}

/** slug/category/title のいずれかに needle が含まれるか（大小無視）。 */
function has(haystacks: (string | undefined)[], needles: string[]): boolean {
  const hay = haystacks.map((s) => (s ?? '').toLowerCase()).join(' ');
  return needles.some((n) => hay.includes(n.toLowerCase()));
}

/**
 * 記事面の意図から、最も一致するアソビューのジャンルを1つ決める。
 * 上から順に評価し、具体的な意図を優先する。どれにも当たらなければ
 * `kidspark`（子連れの日帰りおでかけの最大公約数・240施設）を既定にする。
 *
 * 既定を「全国トップ」ではなく「キッズパーク」にしているのは、当サイトの読者が
 * 例外なく子連れ（0-6歳）で、トップの全国5,333件には大人向け体験（ダイビング/
 * ラフティング等）が上位に来て意図がまったく合わないため。
 */
export function resolveAsoviewGenre(
  slug: string,
  category?: string,
  title?: string,
): AsoviewGenre {
  const ctx = [slug, category, title];
  if (has(ctx, ['mizuasobi', '水遊び', 'じゃぶじゃぶ', 'jabujabu', 'プール', 'pool', 'kawaasobi', '川遊び']))
    return 'pool';
  if (has(ctx, ['aquarium', '水族館'])) return 'aquarium';
  if (has(ctx, ['zoo', '動物園', 'safari', 'サファリ', '牧場'])) return 'zoo';
  if (has(ctx, ['yuuenchi', '遊園地', 'themepark', 'テーマパーク', 'legoland', 'disney']))
    return 'themepark';
  return 'kidspark';
}

/**
 * 記事面に出すアソビューの着地URLを決める（ジャンル判定＋都道府県絞り込み）。
 * 返り値は必ず www.asoview.com 内のURLなので、buildVcDeepLink のホスト検査を通る。
 */
export function resolveAsoviewLanding(
  slug: string,
  category?: string,
  title?: string,
  area?: string,
): string {
  return buildAsoviewLanding(resolveAsoviewGenre(slug, category, title), slug, area);
}

/** スポット詳細ページの category → アソビュー・ジャンル。 */
export function asoviewGenreForSpotCategory(category: string): AsoviewGenre {
  switch (category) {
    case 'aquarium':
      return 'aquarium';
    case 'zoo':
    case 'farm':
      return 'zoo';
    case 'amusement':
      return 'themepark';
    default:
      return 'kidspark';
  }
}
