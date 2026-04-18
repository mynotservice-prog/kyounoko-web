/**
 * エリア定義と判定ロジック。
 * 記事frontmatterと TodayFinder のエリア絞り込みで共通利用する。
 *
 * スケール方針:
 *  - Phase 1: 47都道府県 slug（today-{pref}）+ "all"
 *  - Phase 2: 主要都市の区・市単位に拡張（現時点は未実装）
 *
 * 記事側の area メタ:
 *  - "all"         → エリア非依存（家遊び・ごはん・段取り・育児・習い事・商品比較）
 *  - "tokyo" 等    → 特定都道府県依存（スポット記事）
 *  - 複数地域を跨ぐ場合は "kanto" / "kansai" 等のブロック slug も許可
 */

export type AreaSlug =
  | 'all'
  // 地方ブロック（複数県を跨ぐ記事用）
  | 'hokkaido-tohoku'
  | 'kanto'
  | 'chubu'
  | 'kansai'
  | 'chugoku-shikoku'
  | 'kyushu-okinawa'
  // 都道府県
  | 'hokkaido' | 'aomori' | 'iwate' | 'miyagi' | 'akita' | 'yamagata' | 'fukushima'
  | 'ibaraki' | 'tochigi' | 'gunma' | 'saitama' | 'chiba' | 'tokyo' | 'kanagawa'
  | 'niigata' | 'toyama' | 'ishikawa' | 'fukui' | 'yamanashi' | 'nagano' | 'gifu' | 'shizuoka' | 'aichi'
  | 'mie' | 'shiga' | 'kyoto' | 'osaka' | 'hyogo' | 'nara' | 'wakayama'
  | 'tottori' | 'shimane' | 'okayama' | 'hiroshima' | 'yamaguchi'
  | 'tokushima' | 'kagawa' | 'ehime' | 'kochi'
  | 'fukuoka' | 'saga' | 'nagasaki' | 'kumamoto' | 'oita' | 'miyazaki' | 'kagoshima' | 'okinawa';

export type AreaInfo = { slug: AreaSlug; name: string; block?: AreaSlug };

// block: その都道府県が属する地方ブロック。ブロック単位で絞る記事との照合用。
export const AREAS: AreaInfo[] = [
  { slug: 'all', name: 'すべて' },

  { slug: 'hokkaido', name: '北海道', block: 'hokkaido-tohoku' },
  { slug: 'aomori', name: '青森県', block: 'hokkaido-tohoku' },
  { slug: 'iwate', name: '岩手県', block: 'hokkaido-tohoku' },
  { slug: 'miyagi', name: '宮城県', block: 'hokkaido-tohoku' },
  { slug: 'akita', name: '秋田県', block: 'hokkaido-tohoku' },
  { slug: 'yamagata', name: '山形県', block: 'hokkaido-tohoku' },
  { slug: 'fukushima', name: '福島県', block: 'hokkaido-tohoku' },

  { slug: 'ibaraki', name: '茨城県', block: 'kanto' },
  { slug: 'tochigi', name: '栃木県', block: 'kanto' },
  { slug: 'gunma', name: '群馬県', block: 'kanto' },
  { slug: 'saitama', name: '埼玉県', block: 'kanto' },
  { slug: 'chiba', name: '千葉県', block: 'kanto' },
  { slug: 'tokyo', name: '東京都', block: 'kanto' },
  { slug: 'kanagawa', name: '神奈川県', block: 'kanto' },

  { slug: 'niigata', name: '新潟県', block: 'chubu' },
  { slug: 'toyama', name: '富山県', block: 'chubu' },
  { slug: 'ishikawa', name: '石川県', block: 'chubu' },
  { slug: 'fukui', name: '福井県', block: 'chubu' },
  { slug: 'yamanashi', name: '山梨県', block: 'chubu' },
  { slug: 'nagano', name: '長野県', block: 'chubu' },
  { slug: 'gifu', name: '岐阜県', block: 'chubu' },
  { slug: 'shizuoka', name: '静岡県', block: 'chubu' },
  { slug: 'aichi', name: '愛知県', block: 'chubu' },

  { slug: 'mie', name: '三重県', block: 'kansai' },
  { slug: 'shiga', name: '滋賀県', block: 'kansai' },
  { slug: 'kyoto', name: '京都府', block: 'kansai' },
  { slug: 'osaka', name: '大阪府', block: 'kansai' },
  { slug: 'hyogo', name: '兵庫県', block: 'kansai' },
  { slug: 'nara', name: '奈良県', block: 'kansai' },
  { slug: 'wakayama', name: '和歌山県', block: 'kansai' },

  { slug: 'tottori', name: '鳥取県', block: 'chugoku-shikoku' },
  { slug: 'shimane', name: '島根県', block: 'chugoku-shikoku' },
  { slug: 'okayama', name: '岡山県', block: 'chugoku-shikoku' },
  { slug: 'hiroshima', name: '広島県', block: 'chugoku-shikoku' },
  { slug: 'yamaguchi', name: '山口県', block: 'chugoku-shikoku' },
  { slug: 'tokushima', name: '徳島県', block: 'chugoku-shikoku' },
  { slug: 'kagawa', name: '香川県', block: 'chugoku-shikoku' },
  { slug: 'ehime', name: '愛媛県', block: 'chugoku-shikoku' },
  { slug: 'kochi', name: '高知県', block: 'chugoku-shikoku' },

  { slug: 'fukuoka', name: '福岡県', block: 'kyushu-okinawa' },
  { slug: 'saga', name: '佐賀県', block: 'kyushu-okinawa' },
  { slug: 'nagasaki', name: '長崎県', block: 'kyushu-okinawa' },
  { slug: 'kumamoto', name: '熊本県', block: 'kyushu-okinawa' },
  { slug: 'oita', name: '大分県', block: 'kyushu-okinawa' },
  { slug: 'miyazaki', name: '宮崎県', block: 'kyushu-okinawa' },
  { slug: 'kagoshima', name: '鹿児島県', block: 'kyushu-okinawa' },
  { slug: 'okinawa', name: '沖縄県', block: 'kyushu-okinawa' },
];

const AREA_MAP = new Map(AREAS.map((a) => [a.slug, a]));

/** slug から表示名を返す。不明なら "選択したエリア"。 */
export function getAreaName(slug?: string | null): string {
  if (!slug) return 'すべて';
  return AREA_MAP.get(slug as AreaSlug)?.name ?? 'すべて';
}

/** 記事のarea と ユーザーが選択した area が「マッチするか」判定する。 */
export function areaMatches(articleArea: string | undefined, userArea?: string | null): boolean {
  // 記事側が未指定 or "all" なら常にマッチ
  if (!articleArea || articleArea === 'all') return true;
  // ユーザーが未選択 or "all" なら常にマッチ
  if (!userArea || userArea === 'all') return true;
  // 完全一致
  if (articleArea === userArea) return true;
  // 記事がブロック指定、ユーザーがその配下の県なら一致
  const userInfo = AREA_MAP.get(userArea as AreaSlug);
  if (userInfo?.block === articleArea) return true;
  // ユーザーがブロック指定、記事がその配下ならマッチ
  const articleInfo = AREA_MAP.get(articleArea as AreaSlug);
  if (articleInfo?.block === userArea) return true;
  return false;
}

export function isValidArea(v: unknown): v is AreaSlug {
  return typeof v === 'string' && AREA_MAP.has(v as AreaSlug);
}
