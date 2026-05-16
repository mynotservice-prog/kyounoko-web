/**
 * 神奈川エリアの駅マスタデータ（横浜・川崎・湘南・県央）。
 *
 * 方針:
 * - 関西（lib/kansai-stations.ts）と同じ構造で、市区町村を prefecture 相当の area で扱う
 * - slug は lib/indie-restaurants/chunk-32.ts のキーと完全一致
 * - 既存の東京/関西の駅機能を一切変更しない
 */

export type KanagawaCity =
  | 'yokohama' // 横浜市
  | 'kawasaki' // 川崎市
  | 'fujisawa' // 藤沢市
  | 'kamakura' // 鎌倉市
  | 'chigasaki' // 茅ヶ崎市
  | 'hiratsuka' // 平塚市
  | 'odawara' // 小田原市
  | 'ebina' // 海老名市
  | 'atsugi' // 厚木市
  | 'sagamihara'; // 相模原市

export type KanagawaStation = {
  /** スラグ（URL用、英字小文字＋ハイフン）。例: 'yokohama', 'kawasaki', 'musashi-kosugi' */
  slug: string;
  /** 日本語駅名。例: '横浜', '川崎', '武蔵小杉' */
  name: string;
  /** 駅名のカナ */
  kana: string;
  /** 所属市（市区町村） */
  city: KanagawaCity;
  /** エリア名（地区）。例: '横浜', 'みなとみらい', '武蔵小杉' */
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
 * 神奈川主要30駅。slug は lib/indie-restaurants/chunk-32.ts と一致。
 */
export const KANAGAWA_STATIONS: KanagawaStation[] = [
  // ===== 横浜市・横浜駅周辺 / みなとみらい =====
  {
    slug: 'yokohama',
    name: '横浜',
    kana: 'よこはま',
    city: 'yokohama',
    area: '横浜駅',
    lines: ['JR東海道線', 'JR横須賀線', 'JR京浜東北線', 'JR根岸線', 'JR湘南新宿ライン', '東急東横線', '京急本線', '相鉄本線', 'みなとみらい線', '横浜市営地下鉄ブルーライン'],
    scale: 'terminal',
    familyFriendly: true,
    description: '横浜市の中央ターミナル。横浜タカシマヤ・そごう・ジョイナス・ルミネ・マルイ等の駅ビルにベビールーム多数。',
  },
  {
    slug: 'minato-mirai',
    name: 'みなとみらい',
    kana: 'みなとみらい',
    city: 'yokohama',
    area: 'みなとみらい',
    lines: ['みなとみらい線'],
    scale: 'major',
    familyFriendly: true,
    description: 'クイーンズスクエア・ランドマークプラザ・MARK IS等の大型モールが集中。アンパンマンミュージアム・カップヌードルミュージアムが徒歩圏。',
  },
  {
    slug: 'sakuragicho',
    name: '桜木町',
    kana: 'さくらぎちょう',
    city: 'yokohama',
    area: '桜木町',
    lines: ['JR京浜東北線', 'JR根岸線', '横浜市営地下鉄ブルーライン'],
    scale: 'major',
    familyFriendly: true,
    description: 'コレットマーレ・ぴあアリーナ・横浜美術館・日本丸メモリアルパークへ徒歩圏。みなとみらい観光の起点。',
  },
  {
    slug: 'kannai',
    name: '関内',
    kana: 'かんない',
    city: 'yokohama',
    area: '関内・伊勢佐木',
    lines: ['JR京浜東北線', 'JR根岸線', '横浜市営地下鉄ブルーライン'],
    scale: 'major',
    familyFriendly: false,
    description: '横浜スタジアム・横浜公園・馬車道に隣接。馬車道〜関内〜伊勢佐木町は老舗洋食・町中華の宝庫。',
  },
  {
    slug: 'motomachi-chukagai',
    name: '元町・中華街',
    kana: 'もとまちちゅうかがい',
    city: 'yokohama',
    area: '中華街・元町',
    lines: ['みなとみらい線'],
    scale: 'major',
    familyFriendly: true,
    description: '横浜中華街と元町商店街が徒歩圏。山下公園・港の見える丘公園も近く、観光と食事の中心地。',
  },
  {
    slug: 'shin-yokohama',
    name: '新横浜',
    kana: 'しんよこはま',
    city: 'yokohama',
    area: '新横浜',
    lines: ['JR横浜線', 'JR東海道新幹線', '横浜市営地下鉄ブルーライン', '相鉄新横浜線', '東急新横浜線'],
    scale: 'terminal',
    familyFriendly: true,
    description: '新幹線停車駅。横浜アリーナ・日産スタジアム・新横浜ラーメン博物館があり、出張・観光・子連れ需要が混在。',
  },
  // ===== 横浜市・東横線/横浜線/グリーンライン =====
  {
    slug: 'hiyoshi',
    name: '日吉',
    kana: 'ひよし',
    city: 'yokohama',
    area: '日吉',
    lines: ['東急東横線', '東急目黒線', '東急新横浜線', '横浜市営地下鉄グリーンライン'],
    scale: 'major',
    familyFriendly: true,
    description: '慶應義塾大学日吉キャンパスの最寄り。日吉東急avenue・普通部通りの個人店が充実。',
  },
  {
    slug: 'tsunashima',
    name: '綱島',
    kana: 'つなしま',
    city: 'yokohama',
    area: '綱島・新綱島',
    lines: ['東急東横線'],
    scale: 'major',
    familyFriendly: true,
    description: '東横線の住宅街駅。綱島街道沿いに子連れ歓迎カフェ・パン屋が多く、新綱島駅開業で利便性UP。',
  },
  {
    slug: 'kikuna',
    name: '菊名',
    kana: 'きくな',
    city: 'yokohama',
    area: '菊名',
    lines: ['東急東横線', 'JR横浜線'],
    scale: 'major',
    familyFriendly: true,
    description: '東横線・JR横浜線の乗換駅。落ち着いた住宅地で、子連れに優しい個人店・カフェが点在。',
  },
  {
    slug: 'ofuna',
    name: '大船',
    kana: 'おおふな',
    city: 'kamakura',
    area: '大船',
    lines: ['JR東海道線', 'JR横須賀線', 'JR根岸線', 'JR湘南新宿ライン', '湘南モノレール'],
    scale: 'major',
    familyFriendly: true,
    description: '湘南エリアのターミナル。大船観音・湘南モノレール始発駅。鎌倉観光と日常使いの両立駅。',
  },
  // ===== 横浜市営地下鉄ブルーライン/グリーンライン =====
  {
    slug: 'center-kita',
    name: 'センター北',
    kana: 'せんたーきた',
    city: 'yokohama',
    area: '港北ニュータウン',
    lines: ['横浜市営地下鉄ブルーライン', '横浜市営地下鉄グリーンライン'],
    scale: 'major',
    familyFriendly: true,
    description: '港北ニュータウンの中核。あおばモール・モザイクモールの大型商業施設で子連れ向け設備が充実。',
  },
  {
    slug: 'center-minami',
    name: 'センター南',
    kana: 'せんたーみなみ',
    city: 'yokohama',
    area: '港北ニュータウン',
    lines: ['横浜市営地下鉄ブルーライン', '横浜市営地下鉄グリーンライン'],
    scale: 'major',
    familyFriendly: true,
    description: 'サウスウッド・港北みなも・市立図書館等、子連れに優しい施設が集中する横浜の郊外型ファミリーエリア。',
  },
  // ===== 田園都市線（神奈川側） =====
  {
    slug: 'azamino',
    name: 'あざみ野',
    kana: 'あざみの',
    city: 'yokohama',
    area: 'あざみ野',
    lines: ['東急田園都市線', '横浜市営地下鉄ブルーライン'],
    scale: 'major',
    familyFriendly: true,
    description: '田園都市線とブルーラインの結節点。高級住宅街で、子連れ歓迎カフェ・ベーカリーが多い。',
  },
  {
    slug: 'tama-plaza',
    name: 'たまプラーザ',
    kana: 'たまぷらーざ',
    city: 'yokohama',
    area: 'たまプラーザ',
    lines: ['東急田園都市線'],
    scale: 'major',
    familyFriendly: true,
    description: 'たまプラーザテラス・東急百貨店たまプラーザ店があり、田園都市線屈指のファミリー駅。',
  },
  {
    slug: 'saginuma',
    name: '鷺沼',
    kana: 'さぎぬま',
    city: 'kawasaki',
    area: '鷺沼',
    lines: ['東急田園都市線'],
    scale: 'major',
    familyFriendly: true,
    description: '田園都市線の住宅街駅。鷺沼プール・フレルさぎ沼があり、地元密着の子連れ店が多い。',
  },
  {
    slug: 'mizonokuchi',
    name: '溝の口',
    kana: 'みぞのくち',
    city: 'kawasaki',
    area: '溝の口',
    lines: ['東急田園都市線', '東急大井町線', 'JR南武線（武蔵溝ノ口）'],
    scale: 'major',
    familyFriendly: true,
    description: 'マルイファミリー溝口・ノクティプラザがあり、田園都市線・南武線の乗換ターミナル。',
  },
  {
    slug: 'futako-shinchi',
    name: '二子新地',
    kana: 'ふたこしんち',
    city: 'kawasaki',
    area: '二子新地',
    lines: ['東急田園都市線', '東急大井町線'],
    scale: 'minor',
    familyFriendly: true,
    description: '二子玉川の対岸（神奈川側）。多摩川沿いの落ち着いた住宅街で、子連れ向きカフェが点在。',
  },
  // ===== 川崎市 =====
  {
    slug: 'kawasaki',
    name: '川崎',
    kana: 'かわさき',
    city: 'kawasaki',
    area: '川崎駅',
    lines: ['JR東海道線', 'JR京浜東北線', 'JR南武線', '京急本線（京急川崎）'],
    scale: 'terminal',
    familyFriendly: true,
    description: '川崎市の中央ターミナル。ラゾーナ川崎プラザ・アトレ川崎・川崎モアーズ等にベビールーム完備。',
  },
  {
    slug: 'musashi-kosugi',
    name: '武蔵小杉',
    kana: 'むさしこすぎ',
    city: 'kawasaki',
    area: '武蔵小杉',
    lines: ['JR南武線', 'JR横須賀線', 'JR湘南新宿ライン', '東急東横線', '東急目黒線'],
    scale: 'major',
    familyFriendly: true,
    description: 'グランツリー武蔵小杉・ららテラス武蔵小杉等のタワマン街。子育て世帯が多く、子連れ向け店舗が充実。',
  },
  {
    slug: 'noborito',
    name: '登戸',
    kana: 'のぼりと',
    city: 'kawasaki',
    area: '登戸',
    lines: ['JR南武線', '小田急小田原線'],
    scale: 'major',
    familyFriendly: true,
    description: '川崎市多摩区の中核。藤子・F・不二雄ミュージアム最寄り駅で、ファミリー観光客が多い。',
  },
  {
    slug: 'shin-yurigaoka',
    name: '新百合ヶ丘',
    kana: 'しんゆりがおか',
    city: 'kawasaki',
    area: '新百合ヶ丘',
    lines: ['小田急小田原線', '小田急多摩線'],
    scale: 'major',
    familyFriendly: true,
    description: 'エルミロード・新百合丘OPA・川崎市アートセンターがあり、川崎北部のファミリー中心駅。',
  },
  // ===== 湘南エリア =====
  {
    slug: 'fujisawa',
    name: '藤沢',
    kana: 'ふじさわ',
    city: 'fujisawa',
    area: '藤沢駅',
    lines: ['JR東海道線', 'JR湘南新宿ライン', '小田急江ノ島線', '江ノ電'],
    scale: 'terminal',
    familyFriendly: true,
    description: '湘南エリアのターミナル。藤沢オーパ・湘南藤沢オーパ・さいか屋があり、湘南観光の起点。',
  },
  {
    slug: 'kamakura',
    name: '鎌倉',
    kana: 'かまくら',
    city: 'kamakura',
    area: '鎌倉',
    lines: ['JR横須賀線', 'JR湘南新宿ライン', '江ノ電'],
    scale: 'major',
    familyFriendly: true,
    description: '鶴岡八幡宮・小町通りが徒歩圏の観光地。鎌倉野菜・しらす料理・古民家カフェの宝庫。',
  },
  {
    slug: 'chigasaki',
    name: '茅ヶ崎',
    kana: 'ちがさき',
    city: 'chigasaki',
    area: '茅ヶ崎',
    lines: ['JR東海道線', 'JR湘南新宿ライン', 'JR相模線'],
    scale: 'major',
    familyFriendly: true,
    description: 'サザンビーチちがさきの最寄り駅。ラスカ茅ヶ崎・茅ヶ崎メルロード等、湘南ライフスタイルの中心地。',
  },
  {
    slug: 'hiratsuka',
    name: '平塚',
    kana: 'ひらつか',
    city: 'hiratsuka',
    area: '平塚駅',
    lines: ['JR東海道線', 'JR湘南新宿ライン'],
    scale: 'major',
    familyFriendly: true,
    description: 'ラスカ平塚・OSC湘南シティ・ららぽーと湘南平塚が徒歩〜バス圏。湘南西部の中心市。',
  },
  {
    slug: 'shonan-daira',
    name: '湘南台',
    kana: 'しょうなんだい',
    city: 'fujisawa',
    area: '湘南台',
    lines: ['小田急江ノ島線', '相鉄いずみ野線', '横浜市営地下鉄ブルーライン'],
    scale: 'major',
    familyFriendly: true,
    description: '湘南台駅西口・東口に大型スーパーと住宅街。慶應SFC最寄りで、ファミリー向け店舗が多い。',
  },
  // ===== 県西・県央 =====
  {
    slug: 'odawara',
    name: '小田原',
    kana: 'おだわら',
    city: 'odawara',
    area: '小田原駅',
    lines: ['JR東海道線', 'JR東海道新幹線', '小田急小田原線', '伊豆箱根鉄道大雄山線', '箱根登山鉄道'],
    scale: 'terminal',
    familyFriendly: true,
    description: '小田原城・箱根観光の玄関。ラスカ小田原・小田原東通り商店街があり、駅前で子連れランチが完結。',
  },
  {
    slug: 'ebina',
    name: '海老名',
    kana: 'えびな',
    city: 'ebina',
    area: '海老名駅',
    lines: ['JR相模線', '小田急小田原線', '相鉄本線'],
    scale: 'major',
    familyFriendly: true,
    description: 'ららぽーと海老名・ビナウォーク・海老名ViNA GARDENSがあり、神奈川県央のファミリーモール拠点。',
  },
  {
    slug: 'hon-atsugi',
    name: '本厚木',
    kana: 'ほんあつぎ',
    city: 'atsugi',
    area: '本厚木',
    lines: ['小田急小田原線'],
    scale: 'major',
    familyFriendly: true,
    description: '厚木市の中央駅。アミューあつぎ・本厚木ミロード・ミロード2にベビールーム完備。県央の中核ターミナル。',
  },
  {
    slug: 'sagami-ono',
    name: '相模大野',
    kana: 'さがみおおの',
    city: 'sagamihara',
    area: '相模大野',
    lines: ['小田急小田原線', '小田急江ノ島線'],
    scale: 'major',
    familyFriendly: true,
    description: '小田急の分岐駅で相模原市南区の中心。ボーノ相模大野・ステーションスクエアにベビールームと子連れ店が集中。',
  },
];

/** slug から駅情報を取得。 */
const KANAGAWA_STATION_MAP = new Map(KANAGAWA_STATIONS.map((s) => [s.slug, s]));

export function getKanagawaStationBySlug(slug: string): KanagawaStation | undefined {
  return KANAGAWA_STATION_MAP.get(slug);
}

/** 市別駅一覧。 */
export function getKanagawaStationsByCity(c: KanagawaCity): KanagawaStation[] {
  return KANAGAWA_STATIONS.filter((s) => s.city === c);
}

/** 市の日本語名マッピング。 */
export const KANAGAWA_CITY_NAMES: Record<KanagawaCity, string> = {
  yokohama: '横浜市',
  kawasaki: '川崎市',
  fujisawa: '藤沢市',
  kamakura: '鎌倉市',
  chigasaki: '茅ヶ崎市',
  hiratsuka: '平塚市',
  odawara: '小田原市',
  ebina: '海老名市',
  atsugi: '厚木市',
  sagamihara: '相模原市',
};

/** 表示用の地域ラベル（市名）。 */
export const KANAGAWA_CITY_LABEL: Record<KanagawaCity, string> = {
  yokohama: '横浜',
  kawasaki: '川崎',
  fujisawa: '藤沢',
  kamakura: '鎌倉',
  chigasaki: '茅ヶ崎',
  hiratsuka: '平塚',
  odawara: '小田原',
  ebina: '海老名',
  atsugi: '厚木',
  sagamihara: '相模原',
};
