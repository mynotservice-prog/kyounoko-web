/**
 * 関西エリア（大阪・京都・神戸）の駅マスタデータ。
 *
 * 方針:
 * - 東京（lib/tokyo-stations.ts）と同じ slug 体系を保つが、構造は別型
 * - slug は lib/indie-restaurants/chunk-kansai.ts のキーと完全一致
 * - lines は公式の路線名（JR西日本/阪急/阪神/京阪/近鉄/Osaka Metro/京都市営地下鉄/神戸市営地下鉄/ポートライナー 等）
 * - description は周辺の特徴（80字目安）
 * - 既存の東京駅機能を一切変更しない
 */

export type KansaiPrefecture = 'osaka' | 'kyoto' | 'hyogo';

export type KansaiStation = {
  /** スラグ（URL用、英字小文字＋ハイフン）。例: 'osaka-umeda', 'kyoto-kawaramachi', 'kobe-sannomiya' */
  slug: string;
  /** 日本語駅名。例: '梅田', '河原町', '三宮' */
  name: string;
  /** 駅名のカナ */
  kana: string;
  /** 所属する府/県 */
  prefecture: KansaiPrefecture;
  /** エリア名（区/地区）。例: '梅田', '難波', '河原町', '三宮' */
  area: string;
  /** 路線リスト */
  lines: string[];
  /** 駅規模 */
  scale: 'terminal' | 'major' | 'minor';
  /** ファミリー客が多いエリアか */
  familyFriendly?: boolean;
  /** 駅周辺の特徴（80字程度） */
  description?: string;
};

/**
 * 関西18駅。slug は lib/indie-restaurants/chunk-kansai.ts と一致。
 */
export const KANSAI_STATIONS: KansaiStation[] = [
  // ===== 大阪府 =====
  {
    slug: 'osaka-umeda',
    name: '梅田',
    kana: 'うめだ',
    prefecture: 'osaka',
    area: '梅田',
    lines: ['JR大阪駅', '阪急神戸線・宝塚線・京都線（大阪梅田）', '阪神本線（大阪梅田）', 'Osaka Metro御堂筋線（梅田）', 'Osaka Metro谷町線（東梅田）', 'Osaka Metro四つ橋線（西梅田）'],
    scale: 'terminal',
    familyFriendly: true,
    description: '大阪駅・阪急・阪神・地下鉄が集まる関西最大のターミナル。百貨店と駅ビルにベビールーム・授乳室が揃う。',
  },
  {
    slug: 'osaka-namba',
    name: '難波',
    kana: 'なんば',
    prefecture: 'osaka',
    area: '難波',
    lines: ['Osaka Metro御堂筋線', 'Osaka Metro四つ橋線', 'Osaka Metro千日前線', '南海本線・高野線（なんば）', '近鉄難波線（大阪難波）', '阪神なんば線'],
    scale: 'terminal',
    familyFriendly: false,
    description: 'ミナミの中心、千日前・道頓堀へ徒歩圏。なんばパークス・なんばCITY等のファミリー対応モールが多い。',
  },
  {
    slug: 'osaka-tennoji',
    name: '天王寺',
    kana: 'てんのうじ',
    prefecture: 'osaka',
    area: '天王寺・阿倍野',
    lines: ['JR大阪環状線', 'JR関西本線', 'JR阪和線', 'Osaka Metro御堂筋線', 'Osaka Metro谷町線', '近鉄南大阪線（大阪阿部野橋）', '阪堺電車'],
    scale: 'terminal',
    familyFriendly: true,
    description: 'あべのハルカス・天王寺公園・天王寺動物園が徒歩圏。子連れ施設が集中するファミリー向きエリア。',
  },
  {
    slug: 'osaka-shinsaibashi',
    name: '心斎橋',
    kana: 'しんさいばし',
    prefecture: 'osaka',
    area: '心斎橋',
    lines: ['Osaka Metro御堂筋線', 'Osaka Metro長堀鶴見緑地線'],
    scale: 'major',
    familyFriendly: false,
    description: '心斎橋筋商店街と大丸心斎橋店の中心。買い物・百貨店利用のファミリー客が多い。',
  },
  {
    slug: 'osaka-honmachi',
    name: '本町',
    kana: 'ほんまち',
    prefecture: 'osaka',
    area: '本町',
    lines: ['Osaka Metro御堂筋線', 'Osaka Metro中央線', 'Osaka Metro四つ橋線'],
    scale: 'major',
    familyFriendly: false,
    description: 'オフィス街の中心駅。船場・北浜方面の老舗洋食やレトロ喫茶が点在する。',
  },
  {
    slug: 'osaka-kyobashi',
    name: '京橋',
    kana: 'きょうばし',
    prefecture: 'osaka',
    area: '京橋',
    lines: ['JR大阪環状線', 'JR東西線', 'JR学研都市線', '京阪本線', 'Osaka Metro長堀鶴見緑地線'],
    scale: 'major',
    familyFriendly: false,
    description: 'JR・京阪・地下鉄が交わるターミナル。京阪モール・京橋コムズガーデンなど駅直結商業施設あり。',
  },
  {
    slug: 'osaka-fukushima',
    name: '福島',
    kana: 'ふくしま',
    prefecture: 'osaka',
    area: '福島',
    lines: ['JR大阪環状線', 'JR東西線（新福島）', '阪神本線（福島）'],
    scale: 'minor',
    familyFriendly: false,
    description: '梅田の隣駅。隠れ家系の名店・ビストロが多く、グルメスポットとして注目される地区。',
  },
  {
    slug: 'osaka-nakazakicho',
    name: '中崎町',
    kana: 'なかざきちょう',
    prefecture: 'osaka',
    area: '中崎町',
    lines: ['Osaka Metro谷町線'],
    scale: 'minor',
    familyFriendly: true,
    description: '梅田北側のレトロな町並み。古民家カフェ・雑貨店が集まり、ベビーカーでの散策にも向く。',
  },

  // ===== 京都府 =====
  {
    slug: 'kyoto-station',
    name: '京都',
    kana: 'きょうと',
    prefecture: 'kyoto',
    area: '京都駅',
    lines: ['JR東海道本線', 'JR山陰本線', 'JR奈良線', '東海道新幹線', '近鉄京都線', '京都市営地下鉄烏丸線'],
    scale: 'terminal',
    familyFriendly: true,
    description: '京都の玄関口。京都駅ビル内に伊勢丹・専門店街・拉麺小路があり子連れの食事先が豊富。',
  },
  {
    slug: 'kyoto-kawaramachi',
    name: '河原町',
    kana: 'かわらまち',
    prefecture: 'kyoto',
    area: '河原町・四条河原町',
    lines: ['阪急京都線（京都河原町）'],
    scale: 'terminal',
    familyFriendly: false,
    description: '四条河原町交差点の繁華街。錦市場・先斗町・新京極へ徒歩圏で、老舗喫茶や和食店が密集。',
  },
  {
    slug: 'kyoto-shijo',
    name: '四条',
    kana: 'しじょう',
    prefecture: 'kyoto',
    area: '四条烏丸',
    lines: ['京都市営地下鉄烏丸線'],
    scale: 'major',
    familyFriendly: false,
    description: '烏丸通沿いのオフィス・商業エリア。大丸京都店や錦市場が徒歩圏で和菓子・甘味処が多い。',
  },
  {
    slug: 'kyoto-arashiyama',
    name: '嵐山',
    kana: 'あらしやま',
    prefecture: 'kyoto',
    area: '嵐山',
    lines: ['阪急嵐山線', '嵐電（京福電鉄嵐山本線）', 'JR山陰本線（嵯峨嵐山）'],
    scale: 'major',
    familyFriendly: true,
    description: '渡月橋・竹林の小径の観光地。子連れ向きの茶寮や湯豆腐店が点在し、休日は混雑するため早めの来店推奨。',
  },
  {
    slug: 'kyoto-kitaoji',
    name: '北大路',
    kana: 'きたおおじ',
    prefecture: 'kyoto',
    area: '北山・北大路',
    lines: ['京都市営地下鉄烏丸線'],
    scale: 'minor',
    familyFriendly: true,
    description: '京都府立植物園・北山通沿いのカフェエリア。落ち着いた住宅地で子連れ散歩に向く。',
  },

  // ===== 兵庫県（神戸） =====
  {
    slug: 'kobe-sannomiya',
    name: '三宮',
    kana: 'さんのみや',
    prefecture: 'hyogo',
    area: '三宮',
    lines: ['JR東海道本線（三ノ宮）', '阪急神戸本線（神戸三宮）', '阪神本線（神戸三宮）', '神戸市営地下鉄西神・山手線・海岸線', 'ポートライナー'],
    scale: 'terminal',
    familyFriendly: true,
    description: '神戸の中心ターミナル。そごう神戸店跡（神戸阪急）やミント神戸など駅直結の商業施設にベビールーム完備。',
  },
  {
    slug: 'kobe-motomachi',
    name: '元町',
    kana: 'もとまち',
    prefecture: 'hyogo',
    area: '元町・南京町',
    lines: ['JR東海道本線', '阪神本線'],
    scale: 'major',
    familyFriendly: false,
    description: '南京町（神戸中華街）と元町商店街が徒歩圏。老舗洋菓子店や中華の名店が多く、観光と食事の中心地。',
  },
  {
    slug: 'kobe-harborland',
    name: 'ハーバーランド',
    kana: 'はーばーらんど',
    prefecture: 'hyogo',
    area: 'ハーバーランド',
    lines: ['JR神戸線（神戸駅）', '神戸市営地下鉄海岸線（ハーバーランド）'],
    scale: 'major',
    familyFriendly: true,
    description: 'モザイク・umie・アンパンマンこどもミュージアムがある子連れの定番スポット。海沿いの開放感で散歩に最適。',
  },
  {
    slug: 'kobe-rokko',
    name: '六甲',
    kana: 'ろっこう',
    prefecture: 'hyogo',
    area: '六甲',
    lines: ['阪急神戸本線（六甲）', 'JR神戸線（六甲道）'],
    scale: 'minor',
    familyFriendly: true,
    description: '六甲山・神戸大学エリアの落ち着いた住宅街。洋菓子店や老舗カフェが多く、子連れに優しい雰囲気。',
  },
  {
    slug: 'kobe-okamoto',
    name: '岡本',
    kana: 'おかもと',
    prefecture: 'hyogo',
    area: '岡本',
    lines: ['阪急神戸本線', 'JR神戸線（摂津本山）'],
    scale: 'minor',
    familyFriendly: true,
    description: '甲南大学エリアのカフェ・ベーカリー激戦区。子連れ歓迎の落ち着いた住宅地で阪急沿線屈指の人気。',
  },
];

/** slug から駅情報を取得。 */
const KANSAI_STATION_MAP = new Map(KANSAI_STATIONS.map((s) => [s.slug, s]));

export function getKansaiStationBySlug(slug: string): KansaiStation | undefined {
  return KANSAI_STATION_MAP.get(slug);
}

/** 府/県別駅一覧。 */
export function getKansaiStationsByPrefecture(p: KansaiPrefecture): KansaiStation[] {
  return KANSAI_STATIONS.filter((s) => s.prefecture === p);
}

/** 府/県の日本語名マッピング。 */
export const PREFECTURE_NAMES: Record<KansaiPrefecture, string> = {
  osaka: '大阪府',
  kyoto: '京都府',
  hyogo: '兵庫県',
};

/** 府/県の表示用ラベル（地域名）。 */
export const PREFECTURE_REGION_LABEL: Record<KansaiPrefecture, string> = {
  osaka: '大阪',
  kyoto: '京都',
  hyogo: '神戸',
};
